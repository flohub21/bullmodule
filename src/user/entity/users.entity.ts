import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    client_number:string;

    @Column()
    name:string;

    @Column()
    language:number;

    @Column()
    email:string;

    @Column()
    password:string;

    @Column()
    remember_token:string;

    @Column()
    default_pod:string;

    @Column()
    is_active:boolean;

    @Column()
    created_at:string;

    @Column()
    updated_at:string;

    @Column()
    plain_text_frist_password:string;

    @Column()
    phone:string;

    @Column()
    newsletter_subscription:boolean;

    @Column()
    main_user:boolean;


}
