import { Injectable } from '@nestjs/common';
import {UserService} from "../user/user.service";

@Injectable()
export class AuthService {
    constructor(private usersService: UserService) {}

    /**
     * check if the login is valid
     * @param email string
     * @param pass string
     * @return User | null
     */
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && user.password === pass) {
            const result = user;
            return result;
        }
        return null;
    }}
