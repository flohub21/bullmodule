import {HttpException, HttpStatus} from "@nestjs/common";


export class NoResultException extends HttpException {
    constructor() {
        let json ={
            ok:false,
            keyMsg: 'result.data_not_found'
        };
        super(json, HttpStatus.OK);
    }
}
