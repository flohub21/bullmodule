import {Body, Controller, Get, Injectable, Param, Post, Put} from '@nestjs/common';
import {InvoiceService} from './invoice.service';
import {Invoices} from './entity/invoices.entity';
import {CustomerController} from '../customer/customer.controller';
import {NoResultException} from "../exception/NoResultException";
import {Operations_workflow} from "../operations-workflow/entity/operations-workflow.entity";
import {UserController} from "../user/user.controller";
import {Operation_invoices_status} from "../operations-workflow/entity/Operation-invoices-status.entity";
import * as moment from 'moment';


@Controller('invoice')
@Injectable()
export class InvoiceController {

    constructor(private invoiceService: InvoiceService,
                private customerCont: CustomerController,
                private userCont: UserController) {}

    @Post('create')
    create(@Body() body) {
        let invoice = new Invoices();
        invoice.invoice_ref = 'test';
        invoice.address = body.address;
        this.invoiceService.create(invoice).then((res: any) => {
            return res;
        });
       // return {value : 'create'};
    }

    @Put('update/status')
    /**
     * body any : {
     *     invoices: Invoice[],
     *     status: string
     * }
     */
    async updateStatus(@Body() body) {
        return await this.saveStatus(body.invoices, body.status);
    }

    /**
     * update invoice with specific status
     * @param invoices
     * @param status
     * @param idGroup
     */
    saveStatus(invoices: Invoices[],status:string, idGroup: number = null){
        let ref = [];
        let data:any;
        invoices.forEach((invoice) => {
            ref.push(invoice.invoice_ref);
        });
        switch (status) {
            case 'valid_invoice':
                data = {
                    key:'canceled',
                    value: '0'
                };
                break;
            case 'cancel_invoice':
                data = {
                    key:'canceled',
                    value: '1'
                };
                break;
            case 'payed_invoice':
                data = {
                    key:'payed',
                    value: '1'
                };
                break;
            case 'unpayed_invoice':
                data = {
                    key:'payed',
                    value: '0'
                };
                break;
            case 'send_invoice' :
                data ={
                    key : 'draft',
                    value :'0'
                };
                break;
            case 'notsend_invoice' :
                data ={
                    key : 'draft',
                    value :'1'
                };
                break;
            case 'group':
                data = {
                    key:'id_group',
                    value: idGroup
                };
                break;
        }
        return new Promise((resolve) => {
            this.invoiceService.updateStatus(ref, data).then((res)=>{
               let ret:any = {};
               ret[data.key] = data.value;
               resolve(ret);
            });
        });
    }

    @Put('update/comment')
    async updateComment(@Body() body) {

        return await this.invoiceService.updateComment(body.invoice);

    }

    @Get('find_all')
    async findAll(): Promise<Invoices[]> {
        const listInvoice = await this.invoiceService.findAll();

        return listInvoice;
    }

    @Post('find')
    async find(@Body() body): Promise<Invoices> {
        const invoice = await this.invoiceService.findOne(body.invoice_ref);
        return invoice;
    }

    @Post('find_filter')
    async findByFilter(@Body() body){
        let listCustomer;

        if(body.filter.customer !== undefined){
            // if value is an array = multiple pod
            if(typeof body.filter.customer.value !== 'string'){
                console.log('array');
                listCustomer = await this.customerCont.getAllByPod({pod: body.filter.customer.value});
            } else {
                listCustomer = await this.customerCont.getAllByAll({str: body.filter.customer.value});
            }

            if(listCustomer.length > 0) {
                let listId = [];
                listCustomer.forEach((el) => {
                    listId.push(el.customer_id);
                });
                body.filter.customer_num = {
                    "operator" : "IN",
                    "value":listId
                };
            } else {
                throw new NoResultException();
            }
        }

        if(body.filter.operation !== undefined){
            let listInvoice = await this.invoiceService.getAllByOperation(body.filter.operation.value);
            if(listInvoice.length > 0) {
                let listId = [];
                listInvoice.forEach((el) => {
                    listId.push(el.id);
                });
                body.filter.id = {
                    "operator" : "IN",
                    "value":listId
                };
            } else {
                throw new NoResultException();
            }
        }

        if(body.filter.open != undefined) {
            body.filter.payed = {};
            body.filter.payed.operator = '=';
            body.filter.payed.value = '0'
        }
        if(body.filter.send_post != undefined || body.filter.send_email != undefined) {
            let operator: string;
            if(body.filter.send_post != undefined) {
                operator = '=';
            } else {
                operator = '!=';
            }

            body.filter.draft = {};
            body.filter.draft.operator = '=';
            body.filter.draft.value = '0';

            body.filter.send_out_email= {};
            body.filter.send_out_email.operator = operator;
            body.filter.send_out_email.value = 'null';
        }

        if(body.filter.refund != undefined) {
            if(body.filter.invoice_sub_type === undefined){
                body.filter.invoice_sub_type = {};
                body.filter.invoice_sub_type.operator = "LIKE";
                body.filter.invoice_sub_type.value = "DECOMPTE";
            }
            if(body.filter.total_price_with_tax === undefined){
                body.filter.total_price_with_tax = {};
                body.filter.total_price_with_tax.operator = "<";
                body.filter.total_price_with_tax.value = "0";
            }
        }
        let listInvoice = await this.invoiceService.findByFilter(body.filter);
        if(body.filter.open !== undefined) {
            let lst: Invoices[] = [];
            listInvoice.forEach((invoice) => {
                if (invoice.openAmount != null) {
                    if (invoice.openAmount >= body.filter.open.value[0] && invoice.openAmount <= body.filter.open.value[1]) {
                        lst.push(invoice);
                    }
                } else {
                    if (invoice.total_price_with_tax >= body.filter.open.value[0] && invoice.total_price_with_tax <= body.filter.open.value[1]) {
                        lst.push(invoice);
                    }
                }
            });
            listInvoice = lst;
        }
        if(listInvoice.length > 0) {
           listInvoice = await this.trtListInvoice(listInvoice,listCustomer);
        } else {
            throw new NoResultException();
        }
        return listInvoice;

    }

    /**
     * traitement of list invoice to add several data ( client name, ...) to each invoices
     * @param listInvoice Invoices
     * @param listCustomer any[] customer of invoices
     *
     * @return Invoices[] with alll data
     */

    async trtListInvoice(listInvoice: Invoices[], listCustomer: any[] = null){
        let listId = [];
        for(let key in listInvoice){
            let el:any = listInvoice[key];
            listId.push(el.customer_num);
            if(! el.openAmount){
                el.openAmount = +el.total_price_with_tax;
            }
            //let user = await this.userCont.findOne({id:el.user_id})
            if(el.date !== null){
                let op: Operations_workflow = new Operations_workflow();
                op.status = new Operation_invoices_status();
                op.date = el.operationDate;
                op.status.description = el.description;
                op.internal_comment = el.operationComment;
                op.status.status = el.status;
                op.more_information = el.more_information;
                el.listOperation = [op];
            }
            if(el.draft === 1){
                el.sendStatus = 'notsend';
            } else {
                if(el.send_out_email !== null){
                    el.sendStatus = 'email';
                } else {
                    el.sendStatus = 'post';
                }
            }
            if(el.period_start && el.period_start.indexOf('/') !== -1){
                el.period_start = moment(el.period_start, 'DD/MM/YYYY').format('YYYY-MM-DD');
            }
            if(el.internal_payment_method){

            }

        }
        if(listCustomer === null){
            listCustomer = await this.customerCont.getAllById(listId);
        }
        listInvoice = this.addCustomerNameToInvoice(listInvoice, listCustomer);

        return listInvoice;
    }

    /**
     * search by invoice ref or pod
     * @param body: any  body.search: string
     */
    @Post('search')
    async search(@Body() body){
        let listInvoice = await this.invoiceService.search(body.search);
        if(listInvoice.length > 0) {
            listInvoice = await this.trtListInvoice(listInvoice);
        }

        return listInvoice;
    }

    @Get('open_amount/:customer_id')
    async getOpenAmount(@Param() param){
        let res = await this.invoiceService.getOpenAmount(param.customer_id);
        res[0].notPayed = parseFloat(res[0].notPayed).toFixed(2);
        return res;
    }

    getInvoiceStatus(listInvoice: any) {
        listInvoice.forEach((el) => {
          el.status = this.invoiceService.getInvoiceStatus(el);
        });
    }

    /**
     * add customer name to list of invoice
     * @param listInvoice Invoices[]
     * @return Promise<Invoices[]> list of invoice with customer name
     */
    addCustomerNameToInvoice(listInvoice: Invoices[], listCustomer: any[]) {
        listInvoice.forEach((inv) => {
            let i = 0;
            let find = false;
            while (i < listCustomer.length && !find) {
                if ( inv.customer_num === listCustomer[i].customer_id) {
                    find = true;
                    inv.clientName = listCustomer[i].main_name;
                }
                i++;
            }
        });
        return listInvoice;
    }

    @Post('get_by_pod')
    async searchByPod(@Body() body){
        return await this.invoiceService.getAllByPod(body.pod);
    }

    async getAllByPod(listPod: string[]){
        let listInvoice = await this.invoiceService.getAllByPod(listPod);
        if(listInvoice.length > 0) {
            listInvoice = await this.trtListInvoice(listInvoice);
        }
        return listInvoice;
    }


}
