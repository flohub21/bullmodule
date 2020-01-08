import { Injectable } from '@nestjs/common';
import {Invoices} from './entity/invoices.entity';

import {RequestService} from '../core/service/request-service';
import {FilterService} from "../core/service/filter.service";


@Injectable()
export class InvoiceService extends RequestService{
    repInvoicePostgres: any;
    schema: string = 'master';
    reqSelect= "SELECT * from " +
               " (SELECT invoices.*, op.*, SUBSTRING(invoice_type,POSITION ( '_' in invoice_type)+1) as type," +
               " SUBSTRING(invoice_type,1,POSITION ( '_' in invoice_type)-1) as energy, " +
               " (SELECT new_balance FROM master.payments_list p WHERE p.invoice_ref = invoices.invoice_ref ORDER BY  p.created_at desc LIMIT 1 ) as openamount"+
               " FROM master.invoices "+
               " LEFT JOIN (select o.date as operationDate, o.internal_comment as operationComment, st.description, st.status, o.id as operationId, o.more_information FROM master.operations_workflow o" +
                            " LEFT JOIN  master.operation_invoices_status st ON o.status_id = st.id) as op ON op.operationId = " +
                            " (SELECT id from master.operations_workflow op where op.invoice_reference = master.invoices.invoice_ref ORDER BY  op.updated_at desc, op.date desc LIMIT 1)" +
                " order by invoices.invoice_date_formatted desc, invoices.id) as invoice ";

    constructor(private filter: FilterService) {

        super();
        this.createConnectionPostgres(this.schema).then(() => {
            this.repInvoicePostgres = this.connectionPostgres.getRepository(Invoices);
        });
    }

    /**
     * create new invoice
     * @param invoice
     *
     * @return Promise<Invoices[]> | any
     */
    create(invoice: Invoices): Promise<Invoices[]> | any {
        return new Promise((resolve, reject) => {
                this.repInvoicePostgres.save(invoice).then(() => {
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
            const req = "UPDATE master.invoices set note = '"+note+ "' ,updated_at = NULL  where invoice_ref = '"+invoice[key].invoice_ref+"'";
            await this.repInvoicePostgres.query(req);

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
        console.log('updateStatus');
        console.log(ref);
        console.log(data);
        if(data.text){
            req = "update master.invoices set "+ data.key+ " = '"+this.parseStringToSql(data.value) + "' where invoice_ref IN (" + this.getINForSql(ref) + ")";
        } else {
            req = 'update master.invoices set '+ data.key+ ' = '+data.value + ' where invoice_ref IN (' + this.getINForSql(ref) + ')';
        }
        console.log(req);

        return this.repInvoicePostgres.query(req);
    }

    /**
     * find all invoices
     * @return Promise<Invoices[]>
     */
    findAll(): Promise<Invoices[]> {
        return new Promise((resolve, reject) => {
            this.repInvoicePostgres.find().then((rs) => {
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
            this.repInvoicePostgres.findOne(ref).then((rs) => {
                resolve(rs);
            });
        });
    }

    getAllById(listId: string[]): Promise<Invoices>{
        const req = this.reqSelect + " WHERE id IN ("+this.getINForSql(listId)+")";
        console.log(req);
        return new Promise((resolve) => {
            this.repInvoicePostgres.query(req).then((listInvoice) => {
                resolve(listInvoice);;
            });
        });
    }

    /**
     * search invoice with invoice reference or pod
     * @param str string a part of invoice reference
     */
    search(str: string): Promise<Invoices[]>{
        const req = this.reqSelect + " WHERE invoice_ref LIKE '%"+ str +"%' OR pod LIKE '%"+ str +"%' ORDER BY created_at desc LIMIT 12 ";
        console.log(req);
        return new Promise((resolve, reject) => {
            this.repInvoicePostgres.query(req).then((listInvoice) => {
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
                this.repInvoicePostgres.createQueryBuilder("invoices")
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
        console.log(req);
        return new Promise(( resolve) => {
            this.repInvoicePostgres.query(req).then((rs) => {
                resolve(rs);
            });
        });
    }

    getAllByRef(listRef: string[] ): Promise<Invoices[]>{
        const req = this.reqSelect +
            " WHERE invoice_ref IN ("+this.getINForSql(listRef)+")";
        console.log(req);
        return new Promise(( resolve) => {
            this.repInvoicePostgres.query(req).then((rs) => {
                resolve(rs);
            });
        });
    }

    /**
     *  get invoice in database by several filter
     * @param data any Filter
     */
   findByFilter(data: any): Promise<Invoices[]>{
        let req = this.filter.generateRequest(this.reqSelect,data, 10000);

        return new Promise((resolve, reject) => {
            console.log(req);
            this.repInvoicePostgres.query(req).then((listInvoice) => {
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
            " sum( CASE WHEN (SELECT new_balance FROM master.payments_list p WHERE p.invoice_ref = invoices.invoice_ref ORDER BY  p.created_at desc LIMIT 1) IS NULL"+
            " THEN total_price_with_tax"+
            " ELSE (SELECT new_balance FROM master.payments_list p WHERE p.invoice_ref = invoices.invoice_ref ORDER BY  p.created_at desc LIMIT 1)"+
            " END ) as notPayed"+
            " FROM  `master.invoices` where payed = '0' and canceled = '0' and customer_num =" + "'" + customerId + "' ORDER BY id DESC LIMIT 1";
            console.log(req);
            this.repInvoicePostgres.query(req).then((res) => {
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
            const req = "SELECT i.* from master.operations_workflow o"+
                        " LEFT JOIN "+this.schema+".invoices i ON i.invoice_ref = o.invoice_reference" +
                        " WHERE o.created_at IN (select max(created_at) from master.operations_workflow  group by invoice_reference) "+
                        " AND o.status_id = "+statusId;
            console.log(req);
            this.repInvoicePostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }

    getAllInternalAndPaymentMethod(methodPay:string): Promise<Invoices[]> {
        return new Promise((resolve) => {
            let req: string;

            if(methodPay === 'TRANSFER' ){
                req = "SELECT * from master.invoices where payment_method = 'Virement bancaire' AND (internal_payment_method = '"+methodPay+"' OR internal_payment_method is NULL)";
            } else {
                if(methodPay === 'SEPA'){
                    req = "SELECT * from master.invoices where payment_method = 'Prélèvement automatique' AND (internal_payment_method = '"+methodPay+"' OR internal_payment_method is NULL)";
                } else {
                    req = "SELECT * from master.invoices where internal_payment_method = '"+methodPay+"'";
                }
            }
            console.log(req);
            this.repInvoicePostgres.query(req).then((res) => {
                resolve(res);
            });
        });
    }




}
