import {Body, Injectable, Post} from '@nestjs/common';
import {RequestService} from "../service/request-service";
import {Invoices} from "../../invoice/entity/invoices.entity";
import {Newbo_logs} from "./entity/newbo_logs.entity";

import * as dbConfig from "../../../ormconfig.json";
import {createConnection, getManager} from "typeorm";

@Injectable()
export class LogService{

    repLog: any;
    schema = 'portals';
    dbCfgPostgres  = dbConfig.local ? JSON.stringify(dbConfig.postgres_local) : JSON.stringify(dbConfig.postgres);
    connectionPostgres: any;
    managerPostgres: any;

    constructor() {
        this.createConnectionPostgres().then(()=>{
            this.repLog = this.connectionPostgres.getRepository(Newbo_logs);
        })
    }

    /**
     * create connection with postgres database
     * @return Promise <boolean>
     */
    createConnectionPostgres(schema: string = null): Promise<boolean> {
        let cfg:any = this.dbCfgPostgres;

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


    saveRequest(req: Newbo_logs){
        console.log('save -----');
        console.log('req');
        return this.repLog.save(req);
    }



}
