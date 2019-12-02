import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super();
    }

    /**
     * check if the user name and the password are good
     * @param email string
     * @param password string
     */
    async validate(email: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
           throw new UnauthorizedException();
        }
        return user;
    }

}
