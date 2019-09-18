import { Injectable } from '@nestjs/common';
import {RequestService} from "../core/service/request-service";
import {Payments_list} from "./entity/payments-list.entity";

@Injectable()
export class PaymentsListService  extends RequestService {

    repPaymentsList: any;

    constructor() {

        super();
        this.createConnectionMySql().then(() => {
            this.repPaymentsList = this.connectionMysql.getRepository(Payments_list);
        });
    }

    save(payment: Payments_list){
        this.repPaymentsList.save(payment);
    }

    getLastOneByInvoice(invoice_ref: string){
        const req = "SELECT * from payments_list where invoice_ref = '"+invoice_ref+"' ORDER BY created_at desc LIMIT 1";
        return this.repPaymentsList.query(req);
    }
}
