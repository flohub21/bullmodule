import {Body, Controller, Injectable, Post} from '@nestjs/common';
import {InvoiceController} from "./invoice/invoice.controller";
//import {CustomerController} from "./customer/customer.controller";
import {NoResultException} from "./exception/NoResultException";
import {CustomerController} from "./customer/customer.controller";
import {ContractController} from "./contract/contract.controller";
//import {Invoice} from "../../src/app/shared/models/invoice.model";

@Controller('main')
@Injectable()
export class MainController {

    constructor(private invoiceCont: InvoiceController, private customerCont: CustomerController, private contractCont: ContractController){}

    /**
     * search invoice, contract and cuustomer
     * @param body
     */
    @Post('search')
    async search(@Body() body){
        let listInvoice = [];
        let listCustomer = [];
        let listContract = [];
       listInvoice = await this.invoiceCont.search(body);
       if(listInvoice.length === 0){
           listCustomer = await this.customerCont.search(body.search);
           if(listCustomer.length === 0) {
               listContract = await this.contractCont.search(body.search);
               if(listContract.length === 0) {
                   throw new NoResultException();
               }
           }
       }
        let data = {
                customers: listCustomer,
                invoices:listInvoice,
                contracts: listContract

        };

       await this.searchOtherObjById(data);

      return data;

    }

    /**
     * search customer, contract and invoice
      * @param dataObj any: object which contains all data ( invoice, or contract or customer)
     */
    async searchOtherObjById(dataObj: any){
        if(dataObj.contracts.length > 0){
            dataObj.customers = await this.getAllCustomersById(dataObj.contracts);
            dataObj.invoices = await this.getAllInvoicesByPod(dataObj.contracts);
        } else if(dataObj.customers.length > 0){
            dataObj.contracts = await this.getAllContractByCustomerId(dataObj.customers);
            dataObj.invoices = await this.getAllInvoicesByPod(dataObj.contracts);
        } else if(dataObj.invoices.length > 0){
            dataObj.contracts = await this.getAllContractByPod(dataObj.invoices);
            dataObj.customers = await this.getAllCustomersById(dataObj.contracts);
        }
    }

    async getAllCustomersById(listContract: any[]){
        let listId = [];
        listContract.forEach((c)=>{
            listId.push(c.customer_id);
        });
        return await this.customerCont.getAllById(listId);
    }

    async getAllInvoicesByPod(listContract: any[]){
        let listPod = [];
        listContract.forEach((c)=>{
            listPod.push(c.pod);
        });
        return await this.invoiceCont.getAllByPod(listPod);
    }

    async getAllContractByCustomerId(listCustomer: any[]){
        let listId = [];
        listCustomer.forEach((c)=>{
            listId.push(c.customer_id);
        });
        return await this.contractCont.getAllByCustomerId({
            customerId: listId
        });
    }

    async getAllContractByPod(listInvoice: any[]){
        let listPod = [];
        listInvoice.forEach((c)=>{
            listPod.push(c.pod);
        });
        return await this.contractCont.getAllByCustomerPod(listPod);
    }

}
