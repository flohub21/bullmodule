
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import {AddressModel} from "./address.model";

@Entity()
export class Cm_contract {

    @PrimaryGeneratedColumn()
    pod: string;

    @Column()
    amount_pay_invoice: string;

    @Column()
    auto_end_close: boolean;

    @Column()
    block_fix_amount: boolean;


    @Column()
    block_invoice_values_type: boolean;

    @Column()
    blocked_date: string;

    @Column()
    blocking: boolean;

    @Column()
    change_all_bank: boolean;

    @Column()
    change_of_supplier_date: string;

    @Column()
    cm_bank_id: number;

    @Column()
    cm_price_id: number;

    @Column()
    comments: string;

    @Column()
    contract_client_co: string;

    @Column()
    contract_client_extra_name: string;

    @Column()
    contract_client_name: string;

    @Column()
    contract_id: string;

    @Column()
    counting_method: string;

    @Column()
    created_at: string;

    @Column()
    customer_id: string;

    @Column()
    date_end_eos: string;

    @Column()
    different_prices_every_month: boolean;

    @Column()
    eko_energy: boolean;

    @Column()
    email_copy: boolean;

    @Column()
    end_operation: string;

    @Column()
    energy_type: string;

    @Column()
    entity_form: string;

    @Column()
    fix_amount: number

    @Column()
    fixed_charges_energy: string;

    @Column()
    frequency_invoice: number;

    @Column()
    gas_op: string;

    @Column()
    gas_unit: string;

    @Column()
    give_me_sos_date: boolean;

    @Column()
    grd_id: number

    @Column()
    grid_tarif: string;

    @Column()
    id_sepa: string;

    @Column()
    index_read_date: string;

    @Column()
    invoice_email: string;

    @Column()
    invoice_method: string;

    @Column()
    invoice_values_type: string;

    @Column()
    is_person: string;

    @Column()
    last_syu_normal: number

    @Column()
    last_syu_normal_low: number

    @Column()
    last_syu_normal_total: number

    @Column()
    main_customer_id: string;

    @Column()
    make_reg: boolean;

    @Column()
    mako_name_1: string;

    @Column()
    mako_name_2: string;

    @Column()
    mako_name_3: string;

    @Column()
    mako_name_4: string;

    @Column()
    mako_name_5: string;

    @Column()
    market_segment: string;

    @Column()
    meter_info_id: number;

    @Column()
    meter_number: string;

    @Column()
    nickname: string;

    @Column()
    note: string;

    @Column()
    op: string;

    @Column()
    optional: string;

    @Column()
    payment_type: string;

    @Column()
    period_end: string;

    @Column()
    period_end_renewed: string;

    @Column()
    period_start: string;

    @Column()
    period_start_renewed: string;

    @Column()
    pod_info: string;

    @Column()
    price_date: string;

    @Column()
    price_list_id: string;

    @Column()
    price_low: number;

    @Column()
    price_normal: string;

    @Column()
    price_type: string;

    @Column()
    product_subscribed: string;

    @Column()
    product_time: string;

    @Column()
    quotation: number

    @Column()
    rcsl_id: string;

    @Column()
    rcsl_name: string;

    @Column()
    received_invoice_copy: boolean;

    @Column()
    reconnect: boolean;

    @Column()
    renewed_id: string;

    @Column()
    request_bdr: boolean;

    @Column()
    scc_type: string;

    @Column()
    sms_active: boolean;

    @Column()
    sos_eos_year_initial_consume: string;

    @Column()
    special_tax: boolean;

    @Column()
    status: string;

    @Column()
    sub_type: string;

    @Column()
    supply_reason: string;

    @Column()
    tax_redevance: boolean;

    @Column()
    type: string;

    @Column()
    updated_at: Date;

    @Column()
    use_click_service: boolean;

    @Column()
    use_fix_amount: boolean;

    @Column()
    use_price_list: boolean;

    @Column()
    year: number;

    deliveryAddress: AddressModel;
    billingAddress: AddressModel;
}
