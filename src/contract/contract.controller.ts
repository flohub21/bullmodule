import {Body, Controller, Post, Get, Param} from '@nestjs/common';
import {ContractService} from "./contract.service";
import {Cm_contract} from "./entity/cm_contract.entity";
import {AddressModel} from "./entity/address.model";
import {Invoices} from "../invoice/entity/invoices.entity";

@Controller('contract')
export class ContractController {
    constructor(private contractService: ContractService){
    }



    @Post('update')
    async update(@Body() body){
        if(body.contract.fix_amount){
            body.contract.use_fix_amount = true;
        } else {
            body.contract.use_fix_amount = false;
        }
        this.contractService.update(body.contract);
        return true;
    }
    @Post('get_all_by_pod')
    async getAllByPod(@Body() body){
        return await this.search(body.pod);
    }
    /**
     * search contract by pod or id
     * @param str string name or customer id
     */
    async search(str:string) {

        let listContract = await this.contractService.search(str);
        return this.createContractObject(listContract);
    }

    @Post("get_all_by_customer")
    async getAllByCustomerId(@Body() body){
        let listContract = await this.contractService.getAllByCustomerId(body.customerId);
        return this.createContractObject(listContract);
    }

    /**
     * Get all contracts, this is use in contract.service.ts in the function : getAllContract
     */

    @Get('get_all_contract')
    async getAllContract(): Promise<any[]> {
        const listContract = await this.contractService.getAllContract();
        return this.createContractObject(listContract);
    }

    /**
     * create contract object
     * @param listContract  any []
     */
    createContractObject(listContract: any[]){
        listContract.forEach((el,key)=>{
            listContract[key] = this.getContract(el);
        });
        return listContract;
    }


    async getAllByCustomerPod(listPod: string[]){
        let listContract =  await this.contractService.getAllByPod(listPod);
        return this.createContractObject(listContract);
    }

    @Get('address/autocomplete/:str')
    async searchAddressStreet(@Param() param){
        return await this.contractService.searchAddressStreet(param.str);
    }

    @Post('/address/number_street/')
    async getNumberStreet(@Body() body){
        return await this.contractService.getNumberStreet(body);
    }

    @Post('/address/update')
    async updateAddress(@Body() body){
        return await this.contractService.updateAddress(body.address, body.type, body.pod);
    }


    /**
     * Get consume for one pod, this is use in contract.service.ts in the function : getConsumeByPod
     */
    @Get('get_consume_by_pod/:pod')
    async getConsumeByPod(@Param() param): Promise<any[]> {
        const listConsumes = await this.contractService.getConsumeByPod(param.pod)
        return listConsumes;
    }

    /**
     * Get price (SCC contract) for one contract, this is use in contract.service.ts in the function : getPriceHistoryById
     */
    @Get('get_price_history_by_id/:id')
    async getPriceHistoryById(@Param() param): Promise<any[]> {
        const listPrices = await this.contractService.getPriceHistoryById(param.id)
        return listPrices;
    }

    /**
     * Get price (ACC contract) for one contract, this is use in contract.service.ts in the function : getPriceById
     */
    @Get('get_price_by_id/:id')
    async getPriceById(@Param() param): Promise<any[]> {
        const listPrices = await this.contractService.getPriceById(param.id)
        return listPrices;
    }

    /**
     * create contract object
     * @param contract any object which conatin data to create the new contract
     */
    getContract(contract: any): Cm_contract{
        let addressD: AddressModel = new AddressModel();

        addressD.address = contract.delivery_address;
        addressD.address_extra = contract.delivery_address_extra;
        addressD.city_fr = contract.delivery_city_fr;
        addressD.city_lu = contract.delivery_city_lu;
        addressD.number = contract.delivery_number;
        addressD.post_code = contract.delivery_post_code;
        addressD.country = contract.delivery_country;


        let addressB: AddressModel = new AddressModel();
        addressB.address = contract.billing_address;
        addressB.address_extra = contract.billing_address_extra;
        addressB.city_fr = contract.billing_city_fr;
        addressB.city_lu = contract.billing_city_lu;
        addressB.number = contract.billing_number;
        addressB.post_code = contract.billing_post_code;
        addressB.country = contract.billing_country;

        contract.deliveryAddress = addressD;
        contract.billingAddress = addressB;
        return contract;

    }

}
