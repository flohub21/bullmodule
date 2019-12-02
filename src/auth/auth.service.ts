import { Injectable } from '@nestjs/common';
import {UserService} from "../user/user.service";
import {Users} from "../user/entity/users.entity";
import { JwtService } from '@nestjs/jwt';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
    constructor(private usersService: UserService, private readonly jwtService: JwtService) {}

    /**
     * check if the login is valid
     * @param email string
     * @param pass string
     * @return User | null
     */
    async validateUser(email: string, pass: string): Promise<any> {
        const user: Users = await this.usersService.findByEmail(email);
        if(user){
            let passwordUser = user.password;
            passwordUser = passwordUser.replace('$2y$', '$2b$');
            if (await bcrypt.compare(pass, passwordUser)) {
               return user;
            }
        }
        return null;
    }

    async login(user: Users) {
        const payload = { username: user.email, sub: user.id};
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

}
