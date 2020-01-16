import {Body, Controller, Injectable, Post, UseGuards} from '@nestjs/common';
import {PaymentsListService} from "./payments-list.service";
import {Payments_list} from "./entity/payments-list.entity";
import {InvoiceController} from "../invoice/invoice.controller";
import {Invoices} from "../invoice/entity/invoices.entity";
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('payments-list')
@Injectable()
export class PaymentsListController {

    constructor(private paymentsListService: PaymentsListService, private invoiceController: InvoiceController){}

    @Post('create')
    async create(@Body() body) {

        let invoice : Invoices;
        invoice = new Invoices();
        invoice.invoice_ref = body.payment.invoice_ref;
        invoice = await this.invoiceController.find(invoice);
        if(!body.payment.payment_method){
            if(invoice.payment_method === "Virement bancaire"){
                body.payment.payment_method  = "TRANSFER";

            } else {
                body.payment.payment_method  = "SEPA"
            }
        }

        body.payment = await this.saveNewPayment(body.payment, invoice.balance_in_progress);
        await this.invoiceController.saveStatus([invoice], 'NEW_PAYMENT', null, body.payment.new_balance);
        let result: any = {
            balance_in_progress : body.payment.new_balance
        };
        if(body.payment.new_balance <= 0){

            await this.invoiceController.saveStatus([invoice],'PAYED_INVOICE');
            await this.invoiceController.saveStatus([invoice], 'internal_payment_date',null, body.payment.date);
            await this.invoiceController.saveStatus([invoice], body.payment.payment_method);

           result.payed = '1';
           result.status = 'payed';
           result.internal_payment_method = body.payment.payment_method;
           result.internal_payment_date = body.payment.date;
        }
        return result;
    }

    getPayment(invoice_ref: string, amount: number = null ,comment:string, operation_id: number, payment_method: string = ''): Payments_list{
        let payment:Payments_list = new Payments_list();
        payment.invoice_ref = invoice_ref;
        if(amount !==null){
            payment.amount_paid = amount+"";
        } else {
            payment.amount_paid = null;
        }
        payment.extra_comment = comment;
        payment.operation_id = operation_id;
        payment.payment_method = payment_method;
        return payment;
    }

    getTotalOpenAmount(invoice_ref: string): Promise<number>{
        return new Promise((resolve)=>{
            this.paymentsListService.getLastOneByInvoice(invoice_ref).then((res: Payments_list[])=>{
                if(res.length > 0){
                    resolve(+res[0].new_balance);
                }
                this.invoiceController.find({invoice_ref: invoice_ref}).then((res: Invoices)=>{
                    resolve(+res.total_price_with_tax);

                });
            });
        });

    }

    /**
     * Save new payment in database
     * @param paymentObj Payment_list object to save in the DB if null the other parameters are mandatory
     * @param invoice_ref string
     * @param amount  number if null this payment pay the invoice completely
     * @param comment string
     * @param operation_id number id of of the operation_workflow in the DB
     * @param payment_method string
     */
    async saveNewPayment(paymentObj: Payments_list = null,openAmount: any,  invoice_ref:string = null, amount:number = null, comment:string = null, operation_id: number=null, payment_method: string= null){
        if(paymentObj === null){
            paymentObj = this.getPayment(invoice_ref, amount, comment, operation_id, payment_method);
        }

        paymentObj.deleted = false;
        paymentObj.payment_type = "Payment";
        if(paymentObj.amount_paid !== null){
            paymentObj.new_balance = (openAmount - +paymentObj.amount_paid).toFixed(2)+'';
        } else {
            paymentObj.new_balance = '0';
            paymentObj.amount_paid = openAmount+'';
        }
        await this.paymentsListService.save(paymentObj);
        return paymentObj;
    }
}

