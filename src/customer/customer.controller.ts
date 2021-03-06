import {Body, Controller, Get, Injectable, Post,UseGuards, UploadedFile, UseInterceptors} from '@nestjs/common';
import {CustomerService} from './customer.service';
import {Cm_customer} from "./entity/cm_customer.entity";
import {FileInterceptor} from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('customer')
@Injectable()
@UseInterceptors(
    FileInterceptor('image'),
)
export class CustomerController {

    constructor(private customerService: CustomerService){}

    @Post('find_by_id')
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


    @Post('find_by_all')
    async getAllByAll(@Body() body) {
        return await this.customerService.getAllCustomerByAll(body.str);
        // return {value : 'create'};
    }

    @Post('find_by_pod')
    async getAllByPod(@Body() body) {
        return await this.customerService.getAllCustomerByPod(body.pod);
        // return {value : 'create'};
    }

    @Post('find_by_addr')
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
    }

}
