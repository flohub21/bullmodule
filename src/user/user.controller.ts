import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {UserService} from "./user.service";

@Controller('user')
export class UserController {

    constructor(private userService: UserService){}

    @Get('find_by_id/:id')
    async findOne(@Param() param){
        return await this.userService.findOne(param.id);
    }

    @Post('find_by_email')
    async findByEmail(@Body() body){
        return await this.userService.findByEmail(body.email);
    }
}
