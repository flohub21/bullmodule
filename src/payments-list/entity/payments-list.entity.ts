
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payments_list{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    invoice_ref: string;

    @Column()
    amount_paid: string;

    @Column()
    payment_type: string;

    @Column()
    payment_method: string;

    @Column()
    new_balance: string;

    @Column()
    extra_comment: string;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;

    @Column()
    deleted: boolean;

    @Column()
    operation_id: number;

}
