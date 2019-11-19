import {Body, Controller, Injectable, Post} from '@nestjs/common';
import {PaymentsListService} from "./payments-list.service";
import {Payments_list} from "./entity/payments-list.entity";
import {InvoiceController} from "../invoice/invoice.controller";
import {Invoices} from "../invoice/entity/invoices.entity";

@Controller('payments-list')
@Injectable()
export class PaymentsListController {

    constructor(private paymentsListService: PaymentsListService, private invoiceController: InvoiceController){}

    @Post('create')
    async create(@Body() body) {
        body.payment.delete = 0;
        body.payment.payment_type = "Payment";
        let openAmount = await this.getTotalOpenAmount(body.payment.invoice_ref);
        body.payment.new_balance = +(openAmount - (+body.payment.amount_paid)).toFixed(2);
        let invoice : Invoices;
        invoice = new Invoices();
        invoice.invoice_ref = body.payment.invoice_ref;
        if(!body.payment.payment_method){
           invoice = await this.invoiceController.find(invoice);
            if(invoice.payment_method === "Virement bancaire"){
                body.payment.payment_method  = "TRANSFER";
            } else {
                body.payment.payment_method  = "SEPA"
            }
        }
        await this.paymentsListService.save(body.payment);
        let result: any = {
            openAmount : body.payment.new_balance
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

    getPaymentList(invoice_ref: string, amount: number,comment:string, operation_id: number): Payments_list{
        let payment = new Payments_list();
        payment.invoice_ref = invoice_ref;
        payment.amount_paid = amount+"";
        payment.extra_comment = comment;
        payment.operation_id = operation_id;
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
}

