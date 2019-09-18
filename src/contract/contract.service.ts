import { Injectable } from '@nestjs/common';
import {RequestService} from "../core/service/request-service";
import {Cm_contract} from "./entity/cm_contract.entity";
import {AddressModel} from "./entity/address.model";

@Injectable()
export class ContractService extends RequestService {
    schema = 'business';
    repContract: any;
    constructor(){
        super();
        this.createConnectionPostgres(this.schema).then(()=>{
            this.repContract = this.connectionPostgres.getRepository(Cm_contract);
        });

        this.createConnectionMySql();
    }

    /**
     * search contract by pod or id
     * @param str string name or customer id
     */
    search(str:string): Promise<any[]>{

        return new Promise((resolve) => {
            str = this.parseStringToSql(str);
            const req = "select co.*, CONCAT(a.delivery_number,',',a.delivery_address,' ',a.delivery_city_fr) as delivery_addr, a.* from business.cm_contract co " +
                        " LEFT JOIN business.cm_addresses a ON a.pod = co.pod" +
                        " where co.contract_id LIKE ('%" + str + "%') "+
                        " OR co.pod LIKE ('%" + str + "%') ";
            //console.log(req);
            this.managerPostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    getAllByCustomerId(listId: string[]): Promise<any[]> {
        console.log(listId);
        return new Promise((resolve) => {
            const req = "select co.*, CONCAT(a.delivery_number,',',a.delivery_address,' ',a.delivery_city_fr) as delivery_addr, a.* from business.cm_contract co " +
                " LEFT JOIN business.cm_addresses a ON a.pod = co.pod"+
                " where customer_id IN (" + this.getINForSql(listId) + ")";
            console.log(req);
            this.managerPostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    getAllByPod(listPod: string[]): Promise<any[]> {
        return new Promise((resolve) => {
            const req = "select co.*, a.* from business.cm_contract co " +
                " LEFT JOIN business.cm_addresses a ON a.pod = co.pod"+
                " where co.pod IN (" + this.getINForSql(listPod) + ")";
            //console.log(req);
            this.managerPostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    update(contract: Cm_contract){
        contract.updated_at = new Date();
        this.repContract.save(contract);

    }

    searchAddressStreet(str: string): Promise<any[]>{
        return new Promise( (resolve)=>{
            const req = 'SELECT DISTINCT rue, localite, localite_lux, code_postal FROM places_addresses WHERE  CONCAT (localite," ", rue) like "%'+str+'%"' +
                ' OR CONCAT (rue, " ", localite) like "%'+str+'%" ORDER BY rue LIMIT 5' ;
            //console.log(req);
            this.managerMySql.query(req).then((res)=>{
                resolve(res);
            })
        });

    }

    getNumberStreet(dataAddress: AddressModel) {
        return new Promise( (resolve)=>{
            const req = 'SELECT numero FROM places_addresses WHERE  localite = "'+dataAddress.city_fr+'"' +
                ' AND rue =  "'+dataAddress.address+'"' +' AND code_postal =  "'+dataAddress.post_code+'" ORDER BY length(numero),numero' ;
            //console.log(req);
            this.managerMySql.query(req).then((res)=>{
                resolve(res);
            })
        });
    }

    updateAddress(data: AddressModel,type:string,pod: string){
        data.address = data.address.replace("'","''");
        return new Promise( (resolve)=>{
            const req = "update business.cm_addresses" +
                " SET "+type+"_number = '"+data.number+"'"+
                " ,"+type+"_address = '"+data.address+"'"+
                " ,"+type+"_post_code = '"+data.post_code+"'"+
                " ,"+type+"_city_lu = '"+data.city_lu+"'"+
                " ,"+type+"_city_fr = '"+data.city_fr+"'"+
                " ,"+type+"_country = '"+data.country+"'"+
                " ,"+type+"_address_extra = ''"+
                " WHERE pod = '"+pod+"'";

            //console.log(req);
            this.managerPostgres.query(req).then((res)=>{
                resolve(res);
            });
        });
    }

}