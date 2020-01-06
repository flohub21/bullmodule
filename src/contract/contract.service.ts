import { Injectable } from '@nestjs/common';
import {RequestService} from "../core/service/request-service";
import {Cm_contract} from "./entity/cm_contract.entity";
import {AddressModel} from "./entity/address.model";
import {Invoices} from "../invoice/entity/invoices.entity";
import {FilterService} from "../core/service/filter.service";

@Injectable()
export class ContractService extends RequestService {
    schema = 'business';
    repContract: any;
    reqSelect: string = " select co.*, a.* from business.cm_contract co " +
                        " LEFT JOIN business.cm_addresses a ON a.pod = co.pod";
    constructor(private filter: FilterService){
        super();
        this.createConnectionPostgres(this.schema).then(()=>{
            this.repContract = this.connectionPostgres.getRepository(Cm_contract);
        });

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
            ////console.log(req);
            this.managerPostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    getAllByCustomerId(listId: string[]): Promise<any[]> {
        return new Promise((resolve) => {
            const req = "select co.*, CONCAT(a.delivery_number,',',a.delivery_address,' ',a.delivery_city_fr) as delivery_addr, a.* from business.cm_contract co " +
                " LEFT JOIN business.cm_addresses a ON a.pod = co.pod"+
                " where customer_id IN (" + this.getINForSql(listId) + ")";
            //console.log(req);
            this.managerPostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * Get all contracts,this is use in contract.service.ts in the function : getAllContract
     */

    getAllContract(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const req = "select co.*, adr.* from business.cm_contract co LEFT JOIN business.cm_addresses adr ON adr.pod = co.pod";
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
            ////console.log(req);
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
            const req = 'SELECT DISTINCT rue, localite, localite_lux, code_postal FROM master.places_addresses WHERE  CONCAT (localite," ", rue) like "%'+str+'%"' +
                ' OR CONCAT (rue, " ", localite) like "%'+str+'%" ORDER BY rue LIMIT 5' ;
            //console.log(req);
            this.managerPostgres.query(req).then((res)=>{
                resolve(res);
            })
        });

    }

    getNumberStreet(dataAddress: AddressModel) {
        return new Promise( (resolve)=>{
            const req = 'SELECT numero FROM master.places_addresses WHERE  localite = "'+dataAddress.city_fr+'"' +
                ' AND rue =  "'+dataAddress.address+'"' +' AND code_postal =  "'+dataAddress.post_code+'" ORDER BY length(numero),numero' ;
            //console.log(req);
            this.managerPostgres.query(req).then((res)=>{
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

    /**
     * get consumes for one pod for every years since 2017, use for build graphic in list-contracts.component.ts and contract-customers.component.ts
     * @param pod string
     */
    getConsumeByPod(pod : string) : Promise <any[]> {
        return new Promise( (resolve)=>{
            const req = "SELECT pod,month,year,energy_day,energy_night FROM master.invoice_monthly_history where pod = '"+pod+"'"+" ORDER BY year,month asc ";
            console.log(req)
            this.managerPostgres.query(req).then((res)=>{
                console.log(res)
                resolve(res);
            })
        });
    }

    /**
     * get prices history (SCC) for one contract, use for onglet "Prix" list-contracts.component.ts and contract-customers.component.ts
     * @param pod string
     */
    getPriceHistoryById(id : string) : Promise <any[]> {
        return new Promise((resolve) => {
            const req = "SELECT contract_id,start_agreement,end_agreement,price_date,price_normal,fixed_charges_energy,status,product_name,product_duration from business.price_history where contract_id = '" + id + "'" + "ORDER BY start_agreement desc";
            console.log(req)
            this.managerPostgres.query(req).then((res) => {
                console.log(res)
                resolve(res);
            })
        });
    }

    /**
     * get prices (ACC) for one contract, use for onglet "Prix" list-contracts.component.ts and contract-customers.component.ts
     * @param pod string
     */
    getPriceById(id : string) : Promise <any[]> {
        return new Promise((resolve) => {
            const req = "SELECT buy_price_day,buy_price_night,sell_price_day,sell_price_night,counting_price,end_date,type_price from business.cm_price where id = '" + id + "'" + "ORDER BY end_date Asc";
            console.log(req)
            this.managerPostgres.query(req).then((res) => {
                console.log(res)
                resolve(res);
            })
        });
    }
    /**
     *  get contract in database by several filter
     * @param data any Filter
     */
    findByFilter(data: any): Promise<Invoices[]>{
        let req = this.filter.generateRequest(this.reqSelect, data, 10000, 'co');
        return new Promise((resolve, reject) => {
            console.log(req);
            this.repContract.query(req).then((listContract) => {
                resolve(listContract);
            });
        });
    }

}
