import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import {Operation_invoices_status} from "./Operation-invoices-status.entity";

@Entity()
export class Operations_workflow{

    @PrimaryGeneratedColumn()
    id:string;

    @Column()
    invoice_reference:string;

    @Column()
    status_id:number;

    @Column()
    internal_comment:string;

    @Column()
    user_id:number;

    @Column()
    operation_type:string;

    @Column()
    operation_procedure:string;

    @Column()
    request_id:number;

    @Column()
    created_at:string;

    @Column()
    updated_at: string;

    @Column()
    more_information: string;

    @Column()
    date: string;

    status: Operation_invoices_status;
    amount_paid: number;

    user: any;

    async getOperation(op: any, user: any = null): Promise<Operations_workflow>{
        let newOp: Operations_workflow = op;
        let status: Operation_invoices_status = new Operation_invoices_status();
        status.id = op.status_id;
        status.description = op.description;
        status.status = op.status;
        status.type = op.type;
        newOp.status = status;
        newOp.user = user;
        return newOp;
    }

}
