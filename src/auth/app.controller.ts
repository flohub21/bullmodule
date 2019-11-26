import {Controller, Request, Post, UseGuards, Get} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {AuthService} from "./auth.service";

@Controller()
export class AppController {
    constructor(private readonly authService: AuthService,
                ){}

    @UseGuards(AuthGuard('local'))
    @Post('auth/login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('auth/isLogged')
    async isLogged(){
       // this.logService.readCsvFile();
        return true;
    }
}
