import {Controller, Get, Param} from '@nestjs/common';
import {UserService} from "./user.service";

@Controller('user')
export class UserController {

    constructor(private userService: UserService){}

    @Get('get_by_id/:id')
    async findOne(@Param() param){
        return await this.userService.findOne(param.id);
    }
}
