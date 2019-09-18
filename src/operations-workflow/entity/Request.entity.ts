import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Request{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year_month: string; 

    @Column()
    energy_type: string;

    @Column()
    contract_id: string;

    @Column()
    invoice_type: string;

    @Column()
    data: string;

    @Column()
    submitted: Date;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;

    @Column()
    operation: string;


}
