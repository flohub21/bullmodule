import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice/invoice.controller';
import { InvoiceService } from './invoice/invoice.service';
import { InvoiceModule } from './invoice/invoice.module';
import { CustomerController } from './customer/customer.controller';
import { CustomerModule } from './customer/customer.module';
import { MainController } from './main.controller';
import { ContractController } from './contract/contract.controller';
import { ContractService } from './contract/contract.service';
import { OperationsWorkflowController } from './operations-workflow/operations-workflow.controller';
import { OperationsWorkflowService } from './operations-workflow/operations-workflow.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { PaymentsListController } from './payments-list/payments-list.controller';
import { PaymentsListService } from './payments-list/payments-list.service';
import {APP_INTERCEPTOR} from "@nestjs/core";
import {TransformInterceptor} from "./core/interceptor/transform.interceptor";
import {FilterService} from "./core/service/filter.service";

@Module({
  imports: [
      InvoiceModule,
      CustomerModule,
  ],
    providers: [
        InvoiceController,
        CustomerController,
        ContractController,
        ContractService,
        InvoiceService,
        OperationsWorkflowService,
        UserService,
        FilterService,
        UserController,
        PaymentsListService,
        PaymentsListController,
        {
            provide:APP_INTERCEPTOR,
            useClass: TransformInterceptor
        }

    ],
    exports: [CustomerModule],
    controllers: [MainController, ContractController, OperationsWorkflowController, UserController, PaymentsListController]
})
export class AppModule {
    constructor(){}
}
