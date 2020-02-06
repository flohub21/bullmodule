import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import * as profilJson from './profil.json';
import {UserController} from "../user/user.controller";
import {ProfilCsvModel} from "./profil-csv.model";
import {Users} from "../user/entity/users.entity";
import {RequestService} from "../core/service/request-service";
import {InvoiceController} from "../invoice/invoice.controller";
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('csv')
export class ExportCsvController {

    listProfil:any[] = profilJson;
    constructor(private userCont: UserController,
                private invoiceCont: InvoiceController) {}

    @Get('get_all_profile')
    async getAllProfile() {
        return 'test';
        for (let key in this.listProfil) {
            if(this.listProfil[key].userId === 0){
                this.listProfil[key].userName = 'Export Global'
            } else {
                await this.userCont.findOne({id : this.listProfil[key].userId}).then((user: Users) => {
                    this.listProfil[key].userName = user.name;
                });
            }

        }
        return this.listProfil;

    }

    getProfil(id:number): ProfilCsvModel{
        let i = 0;
        while(i<this.listProfil.length && this.listProfil[i].id !== id){
            i++;
        }
        return this.listProfil[i];
    }


    @Post('export_by_id')
    /**
     * get data for scv by a list of id
     */
    async exportDataById(@Body() body)
    {
        let listData: any;
        let query: string;
        let profil: ProfilCsvModel = this.getProfil(body.idProfil);
        if(profil.where){
            query = profil.query + " WHERE "+ profil.where;
        } else {
            query = profil.query + " WHERE "+profil.keyId+" IN ("+RequestService.prototype.getINForSql(body.listId, )+")";
        }
        console.log(query);
        return await this.runQueryExport(profil, query);

    }

    @Post('export_by_filter')
    /**
     * get data for scv by the filter
     */
    async exportDataByFilter(@Body() body) {
        console.log('export_by_filter');

        let profil: ProfilCsvModel = this.getProfil(body.idProfil);
        let query: string;
        if (profil.where) {
            query = profil.query + " WHERE " + profil.where;
        } else {
            query = await this.invoiceCont.generateRequest(body.dataFilter, profil.query);
        }

        console.log(query);
        return await this.runQueryExport(profil, query);
    }

    /**
     * run the query to get the data for the export
     * @param profil ProfilCsvModel profil selected by the user
     * @param query string query used to get the data
     * @return any[] the data to create the csv file ( data[] contains all header columns)
     */
    async runQueryExport(profil: ProfilCsvModel, query: string){
        let listData: any;
        if(profil.type === 'invoice' || profil.where){
            listData =  await this.invoiceCont.runQuery(query);
        }

        // change the object with key to an array
        let arrayData: any[] = [];
        let i = 0;
        listData.forEach((data:any)=>{
            arrayData[i] = [];
            for(let key in data ) {
                arrayData[i].push(data[key]);
            }
            i++;

        });

        arrayData.splice(0,0,profil.header);

        return arrayData;
    }


}
