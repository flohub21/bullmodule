import {Body, Controller, Get, Injectable, Post, UploadedFile, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {CustomerService} from './customer.service';
import {Cm_customer} from "./entity/cm_customer.entity";
import {OperationsWorkflowController} from "../operations-workflow/operations-workflow.controller";
import {FileInterceptor, MulterModule} from '@nestjs/platform-express';

@Controller('customer')
@Injectable()
@UseInterceptors(
    FileInterceptor('image'),
)
export class CustomerController {

    constructor(private customerService: CustomerService){}

    @Post('get_by_id')
    async getAllById(@Body() body) {
       let listId
        if(body.id === undefined){
          listId = body;
       }
       return await this.customerService.getAllCustomer(listId);
        // return {value : 'create'};
    }

    @Get('find_all')
    async findAll(): Promise<Cm_customer[]> {
        const listCustomer = await this.customerService.findAll();
        return listCustomer;
    }


    @Post('get_by_all')
    async getAllByAll(@Body() body) {
        return await this.customerService.getAllCustomerByAll(body.str);
        // return {value : 'create'};
    }

    @Post('get_by_pod')
    async getAllByPod(@Body() body) {
        return await this.customerService.getAllCustomerByPod(body.pod);
        // return {value : 'create'};
    }

    @Post('get_by_addr')
    async getAllByAddr(@Body() body) {
        return await this.customerService.getAllCustomerByAddr(body.address);
        // return {value : 'create'};
    }

    async search(str:string){
        return await this.customerService.search(str);
    }


    @Post('upload')
    @UseInterceptors(FileInterceptor('test'))
    uploadFile(@UploadedFile() file) {
        console.log(file);
    }

}
