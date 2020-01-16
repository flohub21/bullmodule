import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Operation_invoices_status{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string;

    @Column()
    description:string;

    @Column()
    type: string;
}
