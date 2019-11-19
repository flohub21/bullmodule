import { Injectable } from '@nestjs/common';
import {Invoices} from '../invoice/entity/invoices.entity';
import {RequestService} from '../core/service/request-service';
import {Cm_customer} from "./entity/cm_customer.entity";


@Injectable()
export class CustomerService extends RequestService{
    repCustomerPostgres: any;
    schema = 'business';

    constructor(){
        super();
        this.createConnectionPostgres(this.schema).then(() => {
            this.repCustomerPostgres = this.connectionPostgres.getRepository(Cm_customer);
        });
    }

    /**
     * find all invoices
     * @return Promise<Invoices[]>
     */
    findAll(): Promise<Cm_customer[]> {
        return new Promise((resolve, reject) => {
            this.repCustomerPostgres.find().then((rs) => {
                resolve(rs);
            });
        });
    }

    /**
     * get customer from postgres data base
     * @param listData any[]
     * @param key string | null
     * @return Promise<any []> list of customer
     */
    getAllCustomer(listId: any[], key:string=null): Promise<Cm_customer[]> {
        return new Promise((resolve) => {
            let INStr;
            if(key ===null)
            {
                 INStr = this.getINForSql(listId);
            } else  {
                INStr = this.getINForSql(listId,key);
            }
            const req = 'select *from business.cm_customer where customer_id IN (' + INStr + ')';
         //   console.log(req);
            this.managerPostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * search customer
     * @param str string name or customer id
     */
    search(str:string): Promise<Cm_customer[]>{
        return new Promise((resolve) => {
            str = this.parseStringToSql(str);
            const req = "select * from business.cm_customer where LOWER(main_name) LIKE LOWER('%" + str + "%') " +
                        "OR customer_id LIKE ('%"+str+"%')";
            console.log(req);
            this.managerPostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * get customer from postgres data base by id, name, pod, or address
     * @param str string
     * @return Promise<any []> list of customer
     */
    getAllCustomerByAll(str:string): Promise<Cm_customer[]> {
        return new Promise((resolve) => {
            str = this.parseStringToSql(str);
            const req = "select * from business.cm_customer where LOWER(main_name) LIKE LOWER('%"+str+"%') "+
                "OR customer_id LIKE ('%"+str+"%')"+
                " UNION  select cust.* from business.cm_customer cust"+
                " LEFT JOIN business.cm_contract cont ON cont.customer_id = cust.customer_id"+
                " where cont.pod = '" + str + "'" +
                " UNION SELECT cust.*from business.cm_customer cust" +
                " LEFT JOIN business.cm_contract cont on cust.customer_id = cont.customer_id" +
                " LEFT JOIN business.cm_addresses addr on cont.pod = addr.pod" +
                " WHERE LOWER ( CONCAT (billing_address,' ', billing_city_fr, ' ',billing_number) ) like '%"+str+"%' " +
                "        OR LOWER (CONCAT (billing_city_fr, ' ' , billing_address,' ', billing_number)) like '%"+str+"%' " +
                "        OR LOWER (CONCAT (delivery_address,' ', delivery_city_fr, ' ',delivery_number) ) like '%"+str+"%' " +
                "        OR LOWER (CONCAT (delivery_city_fr, ' ' , delivery_address,' ', delivery_number)) like '%"+str+"%' ";
            console.log(req);
            this.managerPostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * get customer from postgres data base by id, name, pod, or address
     * @param str string address
     * @return Promise<any []> list of customer with the address
     */
    getAllCustomerByAddr(str:string): Promise<any[]> {
        return new Promise((resolve) => {
            str = this.parseStringToSql(str);
            const req = " SELECT cust.*, addr.* from business.cm_customer cust" +
                " LEFT JOIN business.cm_contract cont on cust.customer_id = cont.customer_id" +
                " LEFT JOIN business.cm_addresses addr on cont.pod = addr.pod" +
                " WHERE LOWER ( CONCAT (billing_address,' ', billing_city_fr, ' ',billing_number) ) like '%"+str+"%' " +
                "        OR LOWER (CONCAT (billing_city_fr, ' ' , billing_address,' ', billing_number)) like '%"+str+"%' " +
                "        OR LOWER (CONCAT (delivery_address,' ', delivery_city_fr, ' ',delivery_number) ) like '%"+str+"%' " +
                "        OR LOWER (CONCAT (delivery_city_fr, ' ' , delivery_address,' ', delivery_number)) like '%"+str+"%' "+
                " ORDER BY addr.billing_address, addr.delivery_address";
            console.log(req);
            this.managerPostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * get customer with a list of pod
     * @param listPod string[]
     */
    getAllCustomerByPod(listPod: string[]){
        return new Promise((resolve) => {
            let req = "SELECT cust.* from business.cm_customer cust" +
                " LEFT JOIN business.cm_contract cont on cust.customer_id = cont.customer_id"+
                " WHERE cont.pod IN (" + this.getINForSql(listPod) + ")";
            console.log(req);

            this.managerPostgres.query(req).then((res) => {
                resolve(res);
            });
        });

    }



}
