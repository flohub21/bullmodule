
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Newbo_logs{

    @PrimaryGeneratedColumn()
    time: Date;


    @Column()
    userMail: string;

    @Column()
    query: string;
}
