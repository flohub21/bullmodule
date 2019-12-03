
import {RequestService} from "./request-service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class FilterService {

    constructor(){}
    /**
     * Generate request form object
     * @param data any filter object , used to hgenerate the request
     */
    generateRequest(reqSelect : string, data: any, limit: number = null) {
        let req = reqSelect + ' WHERE ';
        let reqWhere = '';
        let condOp: string;
        let field: string;
        let firstCond1 = true;
        for (let key in data) {
            if (data[key].notInNormalRequest !== true) {
               if(key !== 'union')
               {
                    if (!firstCond1) {
                        reqWhere += condOp;
                    }
                    condOp = 'AND';
                    field = key;
                    if (data[key].separator !== undefined) {
                        condOp = data[key].separator;
                        reqWhere += ' ( ';
                        let reqWheretmp = reqWhere;
                        for (let i = 0; i < data[key].operator.length; i++) {
                            if (reqWheretmp !== reqWhere && data[key].value[i] != null && data[key].value[i] != undefined) {
                                reqWhere += condOp;
                            }

                            reqWhere += this.newCondition(data[key], key, data[key].operator[i], data[key].value[i]);
                        }
                        reqWhere += ' ) ';
                    } else {
                        reqWhere += this.newCondition(data[key], key, data[key].operator, data[key].value);
                    }
                    firstCond1 = false;
                }
            }
        }

        if (reqWhere !== '') {
            for (let key in data['union']) {
                let d = {};
                d[key] = data['union'][key];

                reqWhere += ' UNION ' + this.generateRequest(reqSelect,d,limit);
            }
            if(limit === null){
                return req + reqWhere;
            } else {
                return req + reqWhere + ' LIMIT ' + limit;
            }


        }
        for (let key in data['union']) {
            let d = {};
            d[key] = data['union'][key];
            reqWhere += this.generateRequest(reqSelect,d,limit);
        }
        return reqWhere;
    }

    /**
     * return a good condition for the where clause
     * @param param
     * @param key
     * @param operator
     * @param value
     */
    newCondition(param, key, operator, value): string {
        if (value !== undefined && value !== null) {
            if (value === 'null') {
                if (operator === '=') {
                    return " invoices." + key + " is null ";
                }
                if(operator === '!='){
                    return " invoices." + key + " is not null ";
                }
            }
            if (operator === "LIKE") {
                value = "'%" + value + "%'";
            } else if (operator === 'IN') {

                value = '(' + RequestService.prototype.getINForSql(value) + ')';
            }
            if (param.quote) {
                value = "'" + value + "'";
            }
            return " invoices." + key + " " + operator + " " + value + " ";
        }
        return '';


    }
}
