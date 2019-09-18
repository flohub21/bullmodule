
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cm_customer {

    @PrimaryGeneratedColumn()
    customer_id: string;

    @Column()
    main_name: string;

    @Column()
    email: string;

    @Column()
    mobile: string;

    @Column()
    phone: string;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;

    @Column()
    address: string;

    @Column()
    address_extra: string;

    @Column()
    address_city: string;

    @Column()
    address_number: string;

    @Column()
    address_post_code: string;

}
