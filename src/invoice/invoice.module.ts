import {MiddlewareConsumer, Module} from '@nestjs/common';
import {InvoiceController} from './invoice.controller';
import {InvoiceService} from './invoice.service';
import {InvoiceMiddleware} from './invoice.middleware';
import {CustomerController} from '../customer/customer.controller';
import {CustomerModule} from '../customer/customer.module';

import {OperationsWorkflowService} from "../operations-workflow/operations-workflow.service";
import {FilterService} from "../core/service/filter.service";
import {UserController} from "../user/user.controller";
import {UserService} from "../user/user.service";

@Module({
    controllers: [InvoiceController],
    providers: [InvoiceService, CustomerController, OperationsWorkflowService, FilterService,UserController, UserService],
    imports: [CustomerModule],
})
export class InvoiceModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(InvoiceMiddleware)
            .forRoutes('invoice');
    }
}
