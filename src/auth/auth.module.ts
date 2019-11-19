import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import {UserModule} from "../user/user.module";
import { PassportModule } from '@nestjs/passport';
import {LocalPassportStrategy} from "./local-passport.strategy";

@Module({
  imports: [UserModule, PassportModule],
  providers: [AuthService, LocalPassportStrategy]
})
export class AuthModule {}
