import { Module } from '@nestjs/common';
import {UserService} from "./user.service";
import {UserController} from "./user.controller";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {TransformInterceptor} from "../core/interceptor/transform.interceptor";

@Module({
    providers: [
        UserService,
        UserController,
        {
            provide:APP_INTERCEPTOR,
            useClass: TransformInterceptor
        }

    ],
    controllers: [UserController],
    exports: [UserService]
})

export class UserModule {}
