import {Body, Controller, Get, Injectable, Param, Post, Put, UseGuards} from '@nestjs/common';
import {InvoiceService} from './invoice.service';
import {Invoices} from './entity/invoices.entity';
import {CustomerController} from '../customer/customer.controller';
import {NoResultException} from "../exception/NoResultException";
import {Operations_workflow} from "../operations-workflow/entity/operations-workflow.entity";
import {Operation_invoices_status} from "../operations-workflow/entity/Operation-invoices-status.entity";
import { AuthGuard } from '@nestjs/passport';
import * as moment from 'moment';

@UseGuards(AuthGuard('jwt'))
@Controller('invoice')
@Injectable()
export class InvoiceController {
     listCustomerForFilter: any;

    constructor(private invoiceService: InvoiceService,
                private customerCont: CustomerController) {}

    @Post('create')
    create(@Body() body) {
        let invoice = new Invoices();
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

    async payInvoice(listInvoice: Invoices[]){
        let ref: string[] = [];
        let listOpenAmount: Number[] = [];
        for(let i in listInvoice){
           /* let openAmount = await this.paymentCont.getTotalOpenAmount(listInvoice[i].invoice_ref);
            let payment:any = this.paymentController.getPaymentList(listInvoice[i].invoice_ref, openAmount, null , +res.id);
            payment.date = listOperation[0].date;
            payment.payment_method = listOperation[0].more_information;
            resultTmp = await this.paymentController.create({payment: payment});
            resultTmp.listOperation = [res];*/

        }

    }

    /**
     * update invoice with specific status
     * @param invoices
     * @param status
     * @param idGroup
     * @param value
     */
    saveStatus(invoices: Invoices[],status:string, idGroup: number = null, value:any = null){
        let ref = [];
        let data:any;


        invoices.forEach((invoice) => {
            ref.push(invoice.invoice_ref);
        });

        switch (status) {
            case 'VALID_INVOICE':
                data = {
                    key:'canceled',
                    value: '0',
                    text:true
                };
                break;

            case 'CANCEL_INVOICE':
                data = {
                    key:'canceled',
                    value: '1',
                    text:true
                };
                break;

            case 'PAYED_INVOICE':
                data = {
                    key:'payed',
                    value: '1',
                    text:true
                };
                break;

            case 'UNPAYED_INVOICE':
                data = {
                    key:'payed',
                    value: '0',
                    text:true
                };
                break;

            case 'SPLIT':
                data = {
                    key:'id_group',
                    value: null
                };
                break;

            case 'GROUP':
                data = {
                    key:'id_group',
                    value: idGroup

                };
                break;

            case 'SEPA':
                data = {
                    key:'internal_payment_method',
                    value: 'SEPA',
                    text:true
                };
                break;

            case 'TRANSFER':
                data = {
                    key:'internal_payment_method',
                    value: 'TRANSFER',
                    text:true
                };
                break;

            case 'BEKI':
                data = {
                    key:'internal_payment_method',
                    value: 'BEKI',
                    text:true
                };
                break;

            case 'CASH':
                data = {
                    key:'internal_payment_method',
                    value: 'CASH',
                    text:true
                };
                break;

            case 'MULTI':
                data = {
                    key:'internal_payment_method',
                    value: 'MULTI',
                    text:true
                };
                break;

            case 'internal_payment_date':
                data = {
                    key:'internal_payment_date',
                    value: value,
                    text: value !== null ? true : false
                };

                break;

            case 'ADD_COMMENT':
                data = {
                    key:'note',
                    value: value,
                    text:true
                };
                break;

            case 'send_status':
                data = {
                    key:'send_status',
                    value: value,
                    text:true
                };
                break;

            case 'NEW_PAYMENT':
                data = {
                    key:'balance_in_progress',
                    value: value+'',
                    text:true
                };
                break;

            default:
                data = {
                    key: status,
                    value: value
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

    /**
     * save payment method
     * @param data any data containing the invoice reference
     */
    async savePaymentMethod(data: any){
        return new Promise((resolve)=>{
            this.find(data).then((invoice: Invoices)=>{
                let method: string;
                if(invoice.payment_method === "Virement bancaire"){
                    method = "TRANSFER";
                } else {
                    method = "SEPA"
                }
                let d =  {
                    key:'internal_payment_method',
                    value: method,
                    text:true
                };
                this.invoiceService.updateStatus([data.invoice_ref], d).then((res)=>{
                    let ret:any = {};
                    ret[d.key] = d.value;
                    resolve(ret);
                });
            })

        });
    }

    @Put('update/comment')
    async updateComment(@Body() body) {

        return await this.invoiceService.updateComment(body.invoice);
    }

    @Get('find_all')
    /**
     * find all invoice
     */
    async findAll(): Promise<Invoices[]> {
        const listInvoice = await this.invoiceService.findAll();

        return listInvoice;
    }

    @Post('find')
    /**
     * find one invoice by invoice_ref
     */
    async find(@Body() body): Promise<Invoices> {
        const invoice = await this.invoiceService.findOne(body.invoice_ref);
        return invoice;
    }

    @Post('find_filter')
    /**
     * find invoice by filter
     */
    async findByFilter(@Body() body){
       
        let req: string = await this.generateRequest(body.filter);
        let listInvoice = await this.invoiceService.findByFilter(req);
        if(body.filter.open !== undefined) {
            let lst: Invoices[] = [];
            listInvoice.forEach((invoice) => {
                if (invoice.openamount != null) {
                    if (invoice.openamount >= body.filter.open.value[0] && invoice.openamount <= body.filter.open.value[1]) {
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
           listInvoice = await this.trtListInvoice(listInvoice,this.listCustomerForFilter);
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
        let newInvoiceList: Invoices[] = [];
        for(let key in listInvoice){
            let el:any = listInvoice[key];
            listId.push(el.customer_num);
            newInvoiceList.push(el);
            /*if(! el.openamount){
                el.openamount = +el.total_price_with_tax;
            }*/
            //let user = await this.userCont.findOne({id:el.user_id})
            if(el.date !== null){
                let op: Operations_workflow = new Operations_workflow();
                op.status = new Operation_invoices_status();
                op.date = el.operation_date;
                op.updated_at = el.operation_update_date;
                op.status.description = el.description;
                op.internal_comment = el.operation_comment;
                op.status.status = el.status;
                op.more_information = el.more_information;
                el.listOperation = [op];
                if(!op.date){
                    el.showExpand = false;
                }
            }

            if(el.period_start && el.period_start.indexOf('/') !== -1){
                el.period_start = moment(el.period_start, 'DD/MM/YYYY').format('YYYY-MM-DD');
            }
            if(el.period_finish && el.period_finish.indexOf('/') !== -1){
                el.period_finish = moment(el.period_finish, 'DD/MM/YYYY').format('YYYY-MM-DD');
            }
            if(el.payment_method === 'Virement bancaire'){
                el.payment_method = 'TRANSFER';
            }
            else{
                el.payment_method = 'SEPA';
            }
        }
        if(listCustomer === null){
            listCustomer = await this.customerCont.getAllById(listId);
        }
        newInvoiceList = this.addCustomerNameToInvoice(newInvoiceList, listCustomer);

        return newInvoiceList;
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

    @Post('find_by_pod')
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

    /**
     * generateRequest for the filter received
     * @param filter
     * @param request the request the clause where ( 'select ...' )
     */
    async generateRequest(filter: any, request: string = null){
        let listId = [];
        let addDraftFilter = false;
        for(let key in filter){
            if(key !== 'union'){
                addDraftFilter = true;

            }
        }
        if(addDraftFilter){
            filter.draft = {};
            filter.draft.operator = '=';
            filter.draft.value = '0'
            filter.draft.quote = true;

        }
        if(filter.customer !== undefined){
            // if value is an array = multiple pod
            if(typeof filter.customer.value !== 'string'){
                this.listCustomerForFilter = await this.customerCont.getAllByPod({pod: filter.customer.value});
            } else {
                this.listCustomerForFilter = await this.customerCont.getAllByAll({str: filter.customer.value});
            }

            if(this.listCustomerForFilter.length > 0) {
                let listIdCust = [];
                this.listCustomerForFilter.forEach((el) => {
                    listIdCust.push(el.customer_id);
                });
                filter.customer_num = {
                    "operator" : "IN",
                    "value":listIdCust
                };
            } else {
                throw new NoResultException();
            }
        }

        if(filter.operation !== undefined){

            let listInvoice = await this.invoiceService.getAllByOperation(filter.operation.value);
            if(listInvoice.length > 0) {
                listInvoice.forEach((el) => {
                    listId.push(el.id);
                });
            } else {
                throw new NoResultException();
            }
        }
        // open amount
        if(filter.openamount != undefined) {
            filter.payed = {};
            filter.payed.operator = '=';
            filter.payed.value = '0';
            filter.payed.quote = true;
        }

        if(filter.refund != undefined) {
            if(filter.invoice_sub_type === undefined){
                filter.invoice_sub_type = {};
                filter.invoice_sub_type.operator = "LIKE";
                filter.invoice_sub_type.value = "DECOMPTE";
            }
            if(filter.total_price_with_tax === undefined){
                filter.total_price_with_tax = {};
                filter.total_price_with_tax.operator = "::float<";
                filter.total_price_with_tax.value = "0";
            }
        }
        if(listId.length > 0){
            filter.id = {
                "operator" : "IN",
                "value":listId
            };
        }

        return this.invoiceService.generateRequest(filter, request);
    }

    async runQuery(query: string){
        return await this.invoiceService.runQuery(query);
    }



}
