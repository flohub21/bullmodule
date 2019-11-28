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
import { PaymentsListController } from './payments-list/payments-list.controller';
import { PaymentsListService } from './payments-list/payments-list.service';
import {APP_INTERCEPTOR} from "@nestjs/core";
import {TransformInterceptor} from "./core/interceptor/transform.interceptor";
import {FilterService} from "./core/service/filter.service";
import {UserModule} from "./user/user.module";
import {AuthModule} from "./auth/auth.module";
import { APP_GUARD } from '@nestjs/core';
import {JwtStrategy} from "./auth/jwt.strategy";
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';

@Module({
  imports: [
      InvoiceModule,
      CustomerModule,
      UserModule,
      AuthModule
  ],
    providers: [
        InvoiceController,
        CustomerController,
        ContractController,
        ContractService,
        InvoiceService,
        OperationsWorkflowService,
        FilterService,
        PaymentsListService,
        UserController,
        PaymentsListController,
        {
            provide:APP_INTERCEPTOR,
            useClass: TransformInterceptor
        },
        {
            provide: APP_GUARD,
            useClass: JwtStrategy,
        },
        UploadService

    ],
    exports: [CustomerModule],
    controllers: [MainController, ContractController, OperationsWorkflowController, UserController, PaymentsListController, UploadController]
})
export class AppModule {
    constructor(){}
}
