import { createConnection, getManager} from 'typeorm';
import * as dbConfig from '../../../ormconfig.json';
import {MyLoggerService} from "../logger/MyLogger.service";

export abstract class  RequestService {
    dbCfgMysql  = JSON.stringify(dbConfig.mysql);
    dbCfgPostgres  = dbConfig.local ? JSON.stringify(dbConfig.postgres_local) : JSON.stringify(dbConfig.postgres);


    connectionMysql: any;
    connectionPostgres: any;
    managerPostgres: any;
    managerMySql: any;
    static firstCall: boolean = true;
    static logService = new MyLoggerService();

    /**
     * create connection with mysql database
     * @return Promise <boolean>
     */
    createConnectionMySql(): Promise<boolean> {
        return new Promise((resolve, reject) => {
           let  jsonCfg = JSON.parse(this.dbCfgMysql);
           jsonCfg.logger = RequestService.logService;
                createConnection(jsonCfg).then((connection) => {
                    this.connectionMysql = connection;
                    this.managerMySql= getManager("mysql");
                    resolve(true);
                });
        });
    }
    /**
     * create connection with postgres database
     * @return Promise <boolean>
     */
    createConnectionPostgres(schema: string = null): Promise<boolean> {
        let cfg:any = this.dbCfgPostgres;
        if(RequestService.firstCall){
            let c = JSON.parse(cfg);
            console.log(c.host);
            console.log(c.database);
            RequestService.firstCall = false;
        }

        if(schema){
            cfg = JSON.parse(this.dbCfgPostgres);
            cfg.schema = schema;
            cfg = JSON.stringify(cfg);
        }

        return new Promise((resolve, reject) => {
            createConnection(JSON.parse(cfg)).then((connection) => {
                this.connectionPostgres = connection;
                this.managerPostgres = getManager("postgres");
                resolve(true);
            });
        });
    }

    /**
     * get IN ('value') for where in request
     * @param data string [] | any[]
     *        if data is an simple object ( any) ( { key:value, key2:value, ...}, the key is required
     * @param key string | null (if not key in data), key in the data corresponding to the good value
     * @return str string (value)
     */
    getINForSql(data: string[] | any[], key: string = null) {
        let str = '';
        if (key === null) {
            for (let i = 0; i < data.length; i++) {
                str += "'" + data[i] + "'";
                if (i < data.length - 1 ) {
                    str  += ',';
                }
            }
        } else  {
            let i = 0;
            data.forEach((el) => {
                str += "'" + el[key] + "'";
                if (i < data.length - 1 ) {
                    str  += ',';
                }
                i++;
            });
        }
        return str;
    }

    parseStringToSql(str: string){
        return str.replace("'","''");
    }
}
