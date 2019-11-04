import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import {Operations_workflow} from "../../operations-workflow/entity/operations-workflow.entity";

@Entity()
export class Invoices {

    @PrimaryGeneratedColumn()
    invoice_ref: string;

    @Column()
    id: number;

    @Column()
    month_id:number;

    @Column()
    pod: string;

    @Column()
    year: string;

    @Column()
    month: string;

    @Column()
    invoice_date: string;

    @Column()
    invoice_period: string;

    @Column()
    payment_method: string;

    @Column()
    contract_validity: string;

    @Column()
    grid_operator: string;

    @Column()
    address: string;

    @Column()
    address_point_of_supply: string;

    @Column()
    customer_num: string;

    @Column()
    pod_nickname_value: string;

    @Column()
    balance_in_progress: string;

    @Column()
    left_to_pay: string;

    @Column()
    is_debit_direct: string;

    @Column()
    num_point_of_supply: string;

    @Column()
    infos_point_of_supply: string;

    @Column()
    next_invoice: string;

    @Column()
    period_start: string;

    @Column()
    period_finish: string;

    @Column()
    day_cost_volume: string;

    @Column()
    night_cost_volume: string;

    @Column()
    night_unit_price: string;

    @Column()
    day_unit_price: string;

    @Column()
    day_total_price: string;

    @Column()
    night_total_price: string;

    @Column()
    sum_energy: string;

    @Column()
    power_prime_label: string;

    @Column()
    prime_cost_volume: string;

    @Column()
    prime_unit_price: string;

    @Column()
    prime_total_price: string;

    @Column()
    prime_total_price_last: string;

    @Column()
    adjust_total_price: string;

    @Column()
    adjust_cost_volume: string;

    @Column()
    grid_cost_volume: string;

    @Column()
    grid_total_price: string;

    @Column()
    grid_unit_price: string;

    @Column()
    grid_cost: string;

    @Column()
    sum_grid: string;

    @Column()
    comptage_cost_volume: string;

    @Column()
    comptage_unit_price: string;

    @Column()
    comptage_total_price: string;

    @Column()
    fonds_cost_volume: string;

    @Column()
    fonds_unit_price: string;

    @Column()
    fonds_total_price: string;

    @Column()
    tax_cost_volume: string;

    @Column()
    tax_unit_price: string;

    @Column()
    tax_total_price: string;

    @Column()
    sum_tax: string;

    @Column()
    total_price_without_tax: string;

    @Column()
    total_price_tax: string;

    @Column()
    total_price_with_tax: string;

    @Column()
    date_invoice_due: string;

    @Column()
    actif_positive: string;

    @Column()
    actif_negative: string;

    @Column()
    reactif_positive: string;

    @Column()
    reactif_negative: string;

    @Column()
    reactif: string;

    @Column()
    actif: string;

    @Column()
    peak_day: string;

    @Column()
    peak_night: string;

    @Column()
    max_peak: string;

    @Column()
    tax_regul_htva: string;

    @Column()
    grid_regul_htva: string;

    @Column()
    payed: number;

    @Column()
    sepa_gen: number

    @Column()
    sepa_path: string;

    @Column()
    path: string;

    @Column()
    filename: string;

    @Column()
    generated: number;

    @Column()
    batch_id: string;

    @Column()
    created_at: string;

    @Column()
    updated_at: string;

    @Column()
    rebuild: number;

    @Column()
    internal_payment_date: string;

    @Column()
    internal_payment_method: string;

    @Column()
    invoice_type: string;

    @Column()
    canceled: number;

    @Column()
    month_value: number;

    @Column()
    year_consume: string;

    @Column()
    month_consume: string;

    @Column()
    eta_id: number;

    @Column()
    send_out: number;

    @Column()
    send_out_email: string;

    @Column()
    credit_url: string;

    @Column()
    system: string;

    @Column()
    show_my_eida: number;

    @Column()
    invoice_sub_type: string;

    @Column()
    manual_svu: number;

    @Column()
    unit_used: string;

    @Column()
    used_old_eta: number;

    @Column()
    deleted: number;

    @Column()
    draft: number;

    @Column()
    id_sepa: string;

    @Column()
    internal_path: string;

    @Column()
    ajustment_next: number;

    @Column()
    ajustment_used: number;

    @Column()
    adicional_status: string;

    @Column()
    note: string;

    @Column()
    id_group: string;

    @Column()
    send_status: string;

    credit_note_date: string;
    credit_note_invoice_ref: string;
    total_credit : number;
    clientName: string;
    canBeModified: boolean = true;
    status: string[];
    type:string;
    energy:string;
    openAmount: number;
    nbRappel:number = 0;
    nbSepaSubmit:number = 0;
    listOperation: Operations_workflow[];


}
