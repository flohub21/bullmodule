import {Body, Controller, Get, Injectable, Param, Post} from '@nestjs/common';
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

@Controller('operations-workflow')
@Injectable()
export class OperationsWorkflowController {

    constructor(private operationService: OperationsWorkflowService,
                private userController: UserController,
                private paymentController: PaymentsListController,
                private invoiceController: InvoiceController,
                private contractController: ContractController){}

    @Get('find_all_status')
    async findAllStatus(): Promise<Operation_invoices_status[]> {
        return await this.operationService.findAllStatus();
    }

    @Post('create')
    async create(@Body() body) {
        let listOperation: Operations_workflow[] = body.operation;
        let result: any;
        for (let key in listOperation) {
            listOperation[key].user_id = listOperation[key].user.id;
            listOperation[key].status_id = listOperation[key].status.id;
            if(listOperation[key].status.status === 'GENERATE_CREDIT_NOTE_ANULATION' || listOperation[key].status.status === 'GENERATE_CREDIT_NOTE_REFUND' ){
                let request = await this.saveRequest(listOperation[key],'ANULATION');
                listOperation[key].request_id = request.id;
            }
            if (listOperation[key].status.status === "RAPPEL_SEND" || listOperation[key].status.status === "SEPA_SUBMITTED") {
                let res: any = await this.operationService.getNbSpecialOperation(listOperation[key]);
                listOperation[key].more_information = 'number : ' + (+res[0].nb + 1);
            }
            console.log(listOperation[key]);
            console.log('-------------------------');
            let res: Operations_workflow = await this.operationService.save(listOperation[key]);
            switch (res.status.status) {
                case "ENTER_PAYMENT": {
                    let payment = this.paymentController.getPaymentList(res.invoice_reference, body.payment, res.internal_comment, +res.id);
                    return await this.paymentController.create({payment: payment});
                    break;
                }
                case "PAYED": {
                    let falseInvoice = new Invoices();
                    falseInvoice.invoice_ref = res.invoice_reference;
                    await this.invoiceController.saveStatus([falseInvoice], 'payed');
                    if (!result) {
                        result = {
                            'payed': 1,
                            'status': 'payed'
                        };
                    }
                    break;
                }
                case "RAPPEL_SEND": {
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
                }

            };
        }
       return result;
    }

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
        console.log(request);
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

    @Post('get_all_by_invoice')
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
