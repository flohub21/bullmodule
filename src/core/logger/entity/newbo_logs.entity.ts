
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Newbo_logs{

    @PrimaryGeneratedColumn()
    time: Date;

    @Column()
    usermail: string;

    @Column()
    query: string;
}
