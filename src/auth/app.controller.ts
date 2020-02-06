import {Controller, Request, Post, UseGuards, Get} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {AuthService} from "./auth.service";

@Controller()
export class AppController {
    constructor(private readonly authService: AuthService
                ){}
    // use validate in LocalStrategy
    @UseGuards(AuthGuard('local'))
    @Post('auth/login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    // use validate in JwtStrategy
    @UseGuards(AuthGuard('jwt'))
    @Get('auth/isLogged')
    async isLogged(){
        console.log('islogged');
       // this.logService.readCsvFile();
        return true;
    }

    @Get('auth/pdf')
    async test(){
        return await this.authService.test();

    }
}
