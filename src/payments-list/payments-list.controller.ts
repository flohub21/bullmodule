import {Body, Controller, Injectable, Post} from '@nestjs/common';
import {PaymentsListService} from "./payments-list.service";
import {Payments_list} from "./entity/payments-list.entity";
import {InvoiceController} from "../invoice/invoice.controller";
import {Invoices} from "../invoice/entity/invoices.entity";
import {OperationsWorkflowController} from "../operations-workflow/operations-workflow.controller";

@Controller('payments-list')
@Injectable()
export class PaymentsListController {

    constructor(private paymentsListService: PaymentsListService){}

    @Post('create')
    async create(@Body() body) {
        body.payment.delete = 0;
        body.payment.payment_type = "Payment";
        body.payment.payment_method = null;
        let openAmount = await this.getTotalOpenAmount(body.payment.invoice_ref);
        body.payment.new_balance = +(openAmount - (+body.payment.amount_paid)).toFixed(2);
        await this.paymentsListService.save(body.payment);
        let result: any = {
            openAmount : body.payment.new_balance
        };
        if(body.payment.new_balance <= 0){
            let falseInvoice : Invoices[] = [];
            falseInvoice[0] = new Invoices();
            falseInvoice[0].invoice_ref = body.payment.invoice_ref;
           //await this.invoiceController.saveStatus(falseInvoice,'payed');
           result.payed = '1';
           result.status = 'payed';
        }
        return({
            ok: true,
            result: result
        });
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
               /* this.invoiceController.find({invoice_ref: invoice_ref}).then((res: Invoices)=>{
                    resolve(+res.total_price_with_tax);
                });*/
               resolve(1);
            });
        });

    }
}

