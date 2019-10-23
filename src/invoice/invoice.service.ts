import { Injectable } from '@nestjs/common';
import {Invoices} from './entity/invoices.entity';

import {RequestService} from '../core/service/request-service';
import {FilterService} from "../core/service/filter.service";


@Injectable()
export class InvoiceService extends RequestService{
    repInvoiceMysql: any;
    reqSelect= "SELECT invoices.*, op.*, SUBSTRING(invoice_type,LOCATE( '_', invoice_type)+1) as type," +
               " SUBSTRING(invoice_type,1,LOCATE( '_', invoice_type)-1) as energy, " +
               " (SELECT new_balance FROM payments_list p WHERE p.invoice_ref = invoices.invoice_ref ORDER BY  p.created_at desc LIMIT 1 ) as openAmount,"+
               " cn.credit_note_date, cn.total_credit, cn.credit_note_invoice_ref"+
               " FROM invoices "+
               " LEFT JOIN (select o.date as operationDate, o.internal_comment as operationComment, st.description, st.status, o.id as operationId, o.more_information FROM operations_workflow o" +
                            " LEFT JOIN  operation_invoices_status st ON o.status_id = st.id) as op ON op.operationId = " +
                            " (SELECT id from operations_workflow op where op.invoice_reference = invoices.invoice_ref ORDER BY  op.operationDate desc, op.created_at desc LIMIT 1) "+
               " LEFT JOIN credit_notes cn ON cn.invoice_ref = invoices.invoice_ref";

    constructor(private filter: FilterService) {

        super();
        this.createConnectionMySql().then(() => {
            this.repInvoiceMysql = this.connectionMysql.getRepository(Invoices);
        });
        this.createConnectionPostgres();
    }

    /**
     * create new invoice
     * @param invoice
     *
     * @return Promise<Invoices[]> | any
     */
    create(invoice: Invoices): Promise<Invoices[]> | any {
        return new Promise((resolve, reject) => {
                this.repInvoiceMysql.save(invoice).then(() => {
                   let res = {value:'ok'};
                   resolve(res);
                });
        });
    }

    /**
     * update the comment of an invoice
     * @param invoice
     */
    async updateComment(invoice: any[]){
        for(let key in invoice){
            const note = this.parseStringToSql(invoice[key].note);
            const req = "UPDATE invoices set note = '"+note+ "' ,updated_at = NULL  where invoice_ref = '"+invoice[key].invoice_ref+"'";
            await this.repInvoiceMysql.query(req);

        }
         return new Promise((resolve)=> {
             resolve(true);
         });
    }
    /**
     * change status payed of a list of invoices
     * @param ref string [] reference of invoice which will be updated
     * @param payed number status ( 0 | 1)
     */
   updateStatus(ref: string[], data: any): Promise<any> {
       let req = '';
        if(data.text){
            req = "update invoices set "+ data.key+ " = '"+data.value + "' where invoice_ref IN (" + this.getINForSql(ref) + ")";
        } else {
            req = 'update invoices set '+ data.key+ ' = '+data.value + ' where invoice_ref IN (' + this.getINForSql(ref) + ')';
        }
        console.log(req);

        return this.repInvoiceMysql.query(req);
    }

    /*let rep = connection.getRepository(Invoices);
rep.find().then((rs) =>  {
});*/
    /**
     * find all invoices
     * @return Promise<Invoices[]>
     */
    findAll(): Promise<Invoices[]> {
        return new Promise((resolve, reject) => {
            this.repInvoiceMysql.find().then((rs) => {
                resolve(rs);
            });
        });
    }

    /**
     * get one invoice
     * @param ref
     */
    findOne(ref: string): Promise<Invoices>{
        return new Promise((resolve, reject) => {
            this.repInvoiceMysql.findOne(ref).then((rs) => {
                resolve(rs);
            });
        });
    }

    /**
     * search invoice with invoice reference or pod
     * @param str string a part of invoice reference
     */
    search(str: string): Promise<Invoices[]>{
        const req = this.reqSelect + ' WHERE invoices.invoice_ref LIKE "%' + str + '%" OR invoices.pod LIKE "%'+ str+'%" ORDER BY invoices.created_at desc LIMIT 12';
        return new Promise((resolve, reject) => {
            this.repInvoiceMysql.query(req).then((listInvoice) => {
              resolve(listInvoice);;
            });
        });
    }

    /** get invoice status
     * @param invoice Invoice
     * @return string[] list status of invoice
     **/

    getInvoiceStatus(invoice: Invoices) {
        let status: string[] = [];
        if (invoice.canceled == 1){
            status.push('cancel');
        }
        if (invoice.invoice_sub_type.indexOf('DECOMPTE') !== -1 && parseFloat(invoice.total_price_with_tax) < 0){
            status.push('refund');
        }
        if (invoice.payed == 0) {
            if (invoice.send_out == 1){
                status.push('notsend');
            } else {
                status.push('unpayed');
            }

        } else {
            status.push('payed');
        }
        return status;

    }

    getAllByCustomerName(listCustId: string[] ): Promise<Invoices[]>{
        return new Promise(( resolve) => {
                this.repInvoiceMysql.createQueryBuilder("invoices")
                .where("customer_num IN ("+this.getINForSql(listCustId)+")")
                .getMany().then((rs) => {
                    resolve(rs);
                });
        });
    }

    getAllByPod(listPod: string[] ): Promise<Invoices[]>{
        const req = this.reqSelect +
                    " WHERE pod IN ("+this.getINForSql(listPod)+")"+
                    " ORDER BY created_at DESC"+
                    " LIMIT 10";
        //console.log(req);
        return new Promise(( resolve) => {
            this.repInvoiceMysql.query(req).then((rs) => {
                resolve(rs);
            });
        });
    }

   findByFilter(data: any): Promise<Invoices[]>{
        let req = this.filter.generateRequest(this.reqSelect,data);

        return new Promise((resolve, reject) => {
          //  console.log(req);
            this.repInvoiceMysql.query(req).then((listInvoice) => {
             resolve(listInvoice);
            });
        });
    }

    /**
     * get open amount for one customer
     * @param customerId : string
     */
    getOpenAmount(customerId:string): Promise<any>{
        return new Promise((resolve) => {
            const req = "SELECT"+
            " sum( CASE WHEN (SELECT new_balance FROM payments_list p WHERE p.invoice_ref = invoices.invoice_ref ORDER BY  p.created_at desc LIMIT 1) IS NULL"+
            " THEN total_price_with_tax"+
            " ELSE (SELECT new_balance FROM payments_list p WHERE p.invoice_ref = invoices.invoice_ref ORDER BY  p.created_at desc LIMIT 1)"+
            " END ) as notPayed"+
            " FROM  `invoices` where payed = 0 and canceled = 0 and customer_num =" + "'" + customerId + "' ORDER BY id DESC LIMIT 1";
            //" FROM  `invoices` where show_my_eida = 1 and payed = 0 and canceled = 0 and customer_num =" + "'" + customerId + "' ORDER BY id DESC LIMIT 1";
            /*const req = "SELECT sum(total_price_with_tax) as notPayed FROM `invoices` where show_my_eida = 1 and payed = 0 and canceled = 0 and customer_num =" + "'" + customerId + "' ORDER BY id DESC LIMIT 1";*/
            //console.log(req);
            this.repInvoiceMysql.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * get all invoice by one operations_workflow
     * @param search number id
     */
    getAllByOperation(statusId: number): Promise<Invoices[]> {
        return new Promise((resolve) => {
            const req = "SELECT i.* from operations_workflow o"+
                        " LEFT JOIN invoices i ON i.invoice_ref = o.invoice_reference" +
                        " WHERE o.created_at IN (select max(created_at) from operations_workflow  group by invoice_reference) "+
                        " AND o.status_id = "+statusId;
            this.repInvoiceMysql.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    getAllInternalAndPaymentMethod(methodPay:string): Promise<Invoices[]> {
        return new Promise((resolve) => {
            let req: string;

            if(methodPay === 'TRANSFER' ){
                req = "SELECT * from invoices where  payment_method = 'Virement bancaire' AND (internal_payment_method = '"+methodPay+"' OR internal_payment_method is NULL)";
            } else {
                if(methodPay === 'SEPA'){
                    req = "SELECT * from invoices where  payment_method = 'Prélèvement automatique' AND (internal_payment_method = '"+methodPay+"' OR internal_payment_method is NULL)";
                } else {
                    req = "SELECT * from invoices where internal_payment_method = '"+methodPay+"'";
                }
            }
            console.log(req);
            this.repInvoiceMysql.query(req).then((res) => {
                resolve(res);
            });
        });
    }
    /**
     * get invoices with multiple filters
     * @param data any contains the filters
     */
    newfindByFilter(data: any){
        let where = false;
        const payed = [];
        data.status.forEach((status) => {
            if (status === 'payed'){
                payed.push(1);
            } else if  (status === 'unpayed'){
                payed.push(0);
            }
        });

        /*  select * from ((select i.*, true as canBeModified FROM invoices i
          GROUP BY i.id limit 20)
          UNION (select  k.id, NULL, k.pod, k.year, k.month, k.invoice_date, NULL, k.payment_type, NULL, NULL, NULL, NULL, k.customer_id, NULL, k.invoice_number,
              k.balance, NULL, NULL, k.pod, NULL, NULL, k.start_date, k.end_date, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
              NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, k.amount,
              NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,NULL,  k.status, NULL, NULL, NULL, NULL, NULL,
              k.created_at, k.updated_at, NULL, k.final_payment_date, k.payment_type, k.energy_type, NULL, NULL, NULL, NULL, NULL,
              NULL, NULL, NULL, NULL, NULL,NULL,
              IF (k.invoice_number LIKE '%R91%' OR  k.invoice_number LIKE '%~~%', 'ANNULATION', IF (DATEDIFF(k.end_date, k.start_date) > 160 and k.invoice_number NOT LIKE '%R91%' and  k.description NOT LIKE '%~~%' , 'DECOMPTE', 'ACOMPTE')) AS invoice_sub_type,
              NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,  NULL, NULL, false as canBeModified FROM kas_invoices_12_02_2019 k
          GROUP BY k.id limit 20)) as result order by created_at*/

        let req1 = 'SELECT invoices.* FROM invoices';
        let req2 = "select  k.id, NULL, k.pod, k.year, k.month, k.invoice_date, NULL, k.payment_type, NULL, NULL, NULL, NULL, k.customer_id, NULL, k.invoice_number,\n" +
            "            k.balance, NULL, NULL, k.pod, NULL, NULL, k.start_date, k.end_date, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,\n" +
            "            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, k.amount,\n" +
            "            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,NULL,  k.status, NULL, NULL, NULL, NULL, NULL,\n" +
            "            k.created_at, k.updated_at, NULL, k.final_payment_date, k.payment_type, k.energy_type, NULL, NULL, NULL, NULL, NULL,\n" +
            "            NULL, NULL, NULL, NULL, NULL,NULL,\n" +
            "            IF (k.invoice_number LIKE '%R91%' OR  k.invoice_number LIKE '%~~%', 'ANNULATION', IF (DATEDIFF(k.end_date, k.start_date) > 160 and k.invoice_number NOT LIKE '%R91%' and  k.description NOT LIKE '%~~%' , 'DECOMPTE', 'ACOMPTE')) AS invoice_sub_type,\n" +
            "            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,  NULL, NULL, false as canBeModified FROM kas_invoices_12_02_2019 k";
        let reqWhere = '';

        if (payed.length !== 0) {
            where = true;
            reqWhere += ' where payed IN(' + this.getINForSql(payed) + ')';
        }

        if(data.startDate !== undefined){
            if(where){
                reqWhere += ' and ';
            } else {
                reqWhere += ' where ';
            }
            reqWhere += ' created_at >="' + data.startDate + '" and created_at <="' + data.endDate + '"';
        }

        let req = 'select * from ( '+req1 + reqWhere + ' GROUP BY id'+
            ' UNION ( '+req2+reqWhere+' ) as result ORDER BY created_at';


        return new Promise((resolve, reject) => {
            this.repInvoiceMysql.query(req).then((listInvoice) => {
                /*this.addCustomerNameToInvoice(listInvoice).then((result: Invoices[]) => {
                    resolve(result);
                });*/
                resolve(listInvoice);
            });
        });

        /*   let payed = []
           data.status.forEach((status)=>{
               if(status === 'payed'){
                    payed.push(1);
               } else if  (status === 'unpayed'){
                   payed.push(0);
               }
           });
           let sql = await this.connection.getRepository(Invoices)
               .createQueryBuilder("invoices")
               .where("invoices.payed IN ("+this.getINForSql(payed)+")")
               .andWhere("invoices.created_at >='"+ data.startDate+ "'")
               .andWhere("invoices.created_at <='"+ data.endDate + "'")
               .getSql();
           return new Promise((resolve, reject) => {
               if(data.status.length === 0){
                   resolve([]);
               }

               let invoices = this.connection.getRepository(Invoices)
                   .createQueryBuilder("invoices")
                   .where("invoices.payed IN ("+this.getINForSql(payed)+")")
                   .andWhere("invoices.created_at >='"+ data.startDate+ "'")
                   .andWhere("invoices.created_at <='"+ data.endDate + "'")
                   .getMany().then((rs) => {
                       resolve(rs);
                   });
           });*/
    }

}
