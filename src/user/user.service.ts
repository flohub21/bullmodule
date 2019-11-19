import {Get, Injectable} from '@nestjs/common';
import {RequestService} from "../core/service/request-service";
import {Users} from "./entity/users.entity";

@Injectable()
export class UserService  extends RequestService {

    schema = 'portals';
    repUser: any;

    constructor() {
        super();
        this.createConnectionPostgres(this.schema).then(() => {
            this.repUser = this.connectionPostgres.getRepository(Users);
        });
    }

    /**
     * find one user by this id
     * @param id string
     * @return Promise<Users>
     */

    findOne(id: string): Promise<Users> {
        return new Promise((resolve, reject) => {
            this.repUser.findOne(id).then((rs) => {
                resolve(rs);
            });
        });
    }
    /**
     * find one user by this email
     * @param email string
     * @return Promise<Users>
     */
    async findByEmail(email: string): Promise<Users> {
        return this.repUser.find(user => user.email === email);
    }
}
