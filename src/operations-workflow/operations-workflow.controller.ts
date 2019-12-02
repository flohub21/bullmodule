import {Body, Controller, Get, Injectable, Param, Post, UseGuards} from '@nestjs/common';
import {Invoices} from "../invoice/entity/invoices.entity";
import {Operation_invoices_status} from "./entity/Operation-invoices-status.entity";
import {Request} from "./entity/Request.entity";
import {OperationsWorkflowService} from "./operations-workflow.service";
import {Operations_workflow} from "./entity/operations-workflow.entity";
import {UserController} from "../user/user.controller";
import {PaymentsListController} from "../payments-list/payments-list.controller";
import {InvoiceController} from "../invoice/invoice.controller";
import {Cm_contract} from "../contract/entity/cm_contract.entity";
import {ContractController} from "../contract/contract.controller";
import * as moment from 'moment';
import {InvoiceService} from "../invoice/invoice.service";
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt'))
 @Controller('operations-workflow')
@Injectable()
export class OperationsWorkflowController {
    constructor(private operationService: OperationsWorkflowService,
                private userController: UserController,
                private paymentController: PaymentsListController,
                private invoiceController: InvoiceController,
                private contractController: ContractController,
                private invoiceService: InvoiceService){}

    @Get('find_all_status')
    async findAllStatus(): Promise<Operation_invoices_status[]> {
        return await this.operationService.findAllStatus();
    }

    /**
     * create the operation for all invoice found by filter
     * @param body any
     * @return invoice object which can be have only key which are in a invoice object
     *         It contains the change of invoice after the saving in the DB
     */
    @Post('create_by_filter')
    async createByFilter(@Body() body){
        if(myCache.get(body.operation[0].user.id) === undefined) {
            myCache.set(body.operation[0].user.id, 'TRT');

            let listInvoice: Invoices[] = await this.invoiceController.findByFilter(body.filter);
            body.invoiceComment = [];
            let listOperation: Operations_workflow[] = [];
            listInvoice.forEach((invoice) => {
                let op: Operations_workflow = JSON.parse(JSON.stringify(body.operation[0]));
                op.invoice_reference = invoice.invoice_ref;
                listOperation.push(op);
                body.invoiceComment.push(invoice.note);
            });
            body.operation = listOperation;
            body.invoice = listInvoice;
            let n = await this.create(body);
            myCache.del( body.operation[0].user.id);
            return n;
        }
    }

    /**
     * create the operation and manage all changes to do in the data base
     * @param body any
     */
    @Post('create')
    async create(@Body() body) {
        let listOperation: Operations_workflow[] = body.operation;
        let result: any = [];
        let idGroup: number;
        let resultTmp: any;
        let saveSameOperation: boolean = true;
        let listInvoiceToUpdate:Invoices[] = [];
        let defaultOperation: Operations_workflow;
        let listInvoiceRef: string[] = [];
        for (let key in listOperation) {

            listOperation[key].user_id = listOperation[key].user.id;
            listOperation[key].status_id = listOperation[key].status.id;
            if (listOperation[key].status.status === 'CREDIT_NOTE' || listOperation[key].status.status === 'GENERATE_CREDIT_NOTE_REFUND') {
                saveSameOperation = false;

                let request = await this.saveRequest(listOperation[key], 'ANULATION');
                listOperation[key].request_id = request.id;
            }
            if (listOperation[key].status.status.indexOf('SEPA_') !== -1 || listOperation[key].status.status === 'CANCEL_DOM') {
                saveSameOperation = false;
                let res: any = await this.operationService.getNbSpecialOperation(listOperation[key]);
                listOperation[key].more_information =  (+res[0].nb + 1) + '';
            }
            let res: Operations_workflow = await this.operationService.save(listOperation[key]);

            let falseInvoice = new Invoices();
            falseInvoice.invoice_ref = res.invoice_reference;
            listInvoiceToUpdate.push(falseInvoice);
            listInvoiceRef.push(res.invoice_reference);
            if(key == '0'){
                defaultOperation = listOperation[key];
            }
            // save different thing for each invoice ( it depends the state of each invoice)
            if (res.status.status.indexOf('SEPA_') === -1 && res.status.status !== 'CANCEL_DOM') {
                switch (res.status.status) {
                    case "NEW_PAYMENT": {
                        saveSameOperation = false;
                        let payment:any = this.paymentController.getPaymentList(res.invoice_reference, body.payment, res.internal_comment, +res.id);
                        payment.date = listOperation[0].date;
                        payment.payment_method = listOperation[0].more_information;
                        resultTmp = await this.paymentController.create({payment: payment});
                        resultTmp.listOperation = [res];

                        result.push(resultTmp);
                        break;
                    }
                    case 'ADD_COMMENT':{
                        saveSameOperation = false;
                        let comment: string;
                        if(listOperation.length === 1 || ! body.invoiceComment[key]){
                            comment = listOperation[0].internal_comment;
                        } else {
                            comment = body.invoiceComment[key] + ' - ' + listOperation[0].internal_comment;
                        }
                        resultTmp = await this.invoiceController.saveStatus([falseInvoice], 'ADD_COMMENT',null, comment);
                        resultTmp.listOperation = [res];
                        result.push(resultTmp);
                        break;
                    }
                }
            } else {
                result.push({
                    listOperation: [res]
                });
            }
        }
        // specific case
        if(defaultOperation.status.status === 'PAYED_INVOICE' && ! defaultOperation.more_information){
            saveSameOperation = false;
            // save status for all invoice
            this.invoiceController.saveStatus(listInvoiceToUpdate, listOperation[0].status.status);
            this.invoiceController.saveStatus(listInvoiceToUpdate, 'internal_payment_date', null, listOperation[0].date);
            let invoiceSepa: Invoices[] = [];
            let invoiceTransfer: Invoices[] = [];
            let listInvoice: any[];
            if(body.invoice){
                listInvoice = body.invoice;
            } else {
                listInvoice = await this.invoiceService.getAllByRef(listInvoiceRef);
            }

            listInvoice.forEach((invoice: Invoices)=>{
                resultTmp = {
                    payed: '1',
                    internal_payment_date:listOperation[0].date,
                    listOperation: [defaultOperation]
                };
                if(invoice.payment_method === 'Virement bancaire' || invoice.payment_method === 'TRANSFER'){
                    invoiceTransfer.push(invoice);
                    resultTmp.internal_payment_method = 'TRANSFER';
                } else {
                    invoiceSepa.push(invoice);
                    resultTmp.internal_payment_method = 'SEPA';
                }
                result.push(resultTmp);

            });
            if(invoiceSepa.length > 0){
                this.invoiceController.saveStatus(invoiceSepa, 'SEPA');
            }
            if(invoiceTransfer.length > 0){
                this.invoiceController.saveStatus(invoiceTransfer, 'TRANSFER');
            }
        }
        if(saveSameOperation){
           result = await this.saveSameStatusForInvoices(listOperation, listInvoiceToUpdate, result);
        }
       return result;
    }

    async saveSameStatusForInvoices(listOperation: Operations_workflow[], listInvoiceToUpdate: Invoices[], result: any[]){
        let resultTmp: any;
        let idGroup:number;
        // save the same thing in all invoice ( only one request for all status)
            switch (listOperation[0].status.status) {

                case 'PAYED_INVOICE': {
                    if(listOperation[0].more_information){
                        this.invoiceController.saveStatus(listInvoiceToUpdate, listOperation[0].status.status);
                        this.invoiceController.saveStatus(listInvoiceToUpdate, 'internal_payment_date',null, listOperation[0].date);
                        let resPayment = await this.invoiceController.saveStatus(listInvoiceToUpdate, listOperation[0].more_information);
                        resultTmp = {
                            payed: '1',
                            internal_payment_date:listOperation[0].date,
                            internal_payment_method: resPayment['internal_payment_method']
                        };

                    }
                    break;
                }
                case 'UNPAYED_INVOICE':{
                    resultTmp = await this.invoiceController.saveStatus(listInvoiceToUpdate, listOperation[0].status.status);
                    this.invoiceController.saveStatus(listInvoiceToUpdate, 'internal_payment_date',null, null);
                    this.invoiceController.saveStatus(listInvoiceToUpdate, 'internal_payment_method',null, null);
                    resultTmp.internal_payment_date = null;
                    resultTmp.internal_payment_method = null;

                    break;

                }

                case 'CHANGE_PAYMENT_DATE':{
                    resultTmp = await this.invoiceController.saveStatus(listInvoiceToUpdate, 'internal_payment_date',null, listOperation[0].date);
                    break;
                }

                case 'NOT_SEND':{
                    this.invoiceController.saveStatus(listInvoiceToUpdate, 'send_status',null, 'NOT_SEND');
                    resultTmp = {
                        send_status : 'NOT_SEND'
                    };
                    break;

                }
                case 'SEND_EMAIL':
                case 'SEND_POST':
                case 'SEND_ALL': {
                    let sendStatus: string;
                    if(listOperation[0].status.status === 'SEND_EMAIL'){
                        sendStatus = 'EMAIL';
                    } else {
                        if(listOperation[0].status.status === 'SEND_POST') {
                            sendStatus = 'POST';
                        }
                        else{
                            sendStatus = 'ALL';
                        }
                    }
                    this.invoiceController.saveStatus(listInvoiceToUpdate, 'send_status',null,sendStatus);
                    resultTmp = {
                        send_status : sendStatus
                    };
                    break;

            }

           /* case "RAPPEL_SEND": {
                if (!result) {
                    result = [{
                        nbRappel: +res.more_information
                    }];

                } else {
                    result.push({
                        nbRappel: +res.more_information
                    });
                }
                break;
            }
            case "SEPA_SUBMITTED": {
                if (!result) {
                    result = [{
                        nbSepaSubmit: +res.more_information
                    }];

                     } else {
                         result.push({
                             nbSepaSubmit: +res.more_information
                         });
                     }
                     break;
                 }
                 case "OPEN": {
                     let falseInvoice = new Invoices();
                     falseInvoice.invoice_ref = res.invoice_reference;
                     await this.invoiceController.saveStatus([falseInvoice], 'unpayed');
                     if (!result) {
                         result = {
                             'payed': 0,
                             'status': 'unpayed'
                         };
                     }
                     break;
                 }*/
                default: {
                    let falseInvoice = new Invoices();
                    falseInvoice.invoice_ref = listOperation[0].invoice_reference;
                    if(listOperation[0].status.status === "GROUP"){
                        idGroup = new Date().getTime();
                    }
                    resultTmp = await this.invoiceController.saveStatus(listInvoiceToUpdate, listOperation[0].status.status, idGroup);
                    break;
                }

         }
            listOperation.forEach((op)=>{
                resultTmp.listOperation = [op];
                result.push(resultTmp);

            });
            return result;
    }

    /**
     * save a record in the request table
     * @param operation Operations_workflow The operation for which a record is created
     * @param invoiceType string
     *
     * @return any the request created
     */
    async saveRequest(operation: Operations_workflow, invoiceType: string)
    {
        let request: Request = new Request();
        let d = {
            invoice_ref: operation.invoice_reference
        };
        let invoice: Invoices = await this.invoiceController.find(d);
        let contract: Cm_contract[] = await this.contractController.getAllByCustomerPod([invoice.pod]);
        request.contract_id = contract[0].contract_id;
        request.energy_type = invoice.invoice_type;
        if(invoiceType = 'ANULATION'){
            request.data = invoice.invoice_ref;
        }
        request.invoice_type = invoiceType;
        request = await this.operationService.saveRequest(request);
        return request;
    }

    @Post('request_create_invoice')
    async saveRequestForNewInvoice(@Body()body){
        let request: Request = new Request();

        request.contract_id = body.contractId;
        request.energy_type = body.contractType;
        request.invoice_type = body.invoiceType;
        request.year_month = body.month;
        await this.operationService.saveRequest(request);
        return;
    }

    @Post('update')
    async update(@Body() body) {
        body.operation.updated_at = new Date();
        body.operation.user_id = body.operation.user.id;
        body.operation.status_id = body.operation.status.id;
        return await this.operationService.save(body.operation);
    }

    @Post('find_all_by_invoice')
    async getAllByInvoice(@Body() body){

        let operation: Operations_workflow[] = [];
        let  res = await this.operationService.getAllByInvoice(body.invoice_ref);
        for(let r of res){
            let user = await this.userController.findOne({id:r.user_id});
            let op = await Operations_workflow.prototype.getOperation(r,user );
            operation.push(op);
        }
        return operation;
    }
}
