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
     * find all invoices
     * @return Promise<Invoices[]>
     */

    findOne(id: string): Promise<Users> {
        return new Promise((resolve, reject) => {
            this.repUser.findOne(id).then((rs) => {
                resolve(rs);
            });
        });
    }
}
