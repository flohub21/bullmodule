import {Logger, QueryRunner} from "typeorm";
import * as moment from 'moment';
import {LogService} from "./log.service";
import {RequestService} from "../service/request-service";
import {Newbo_logs} from "./entity/newbo_logs.entity";

const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

export class MyLoggerService  implements Logger {

    mailUser: string;
    logService: LogService =  new LogService();

    constructor(){
    }

    /**
     * read data from csv file
     */
    /*readCsvFile(){
        let isHeader = true; // allow to not get the header in the file
        let data: newbo_logsEntity[] = [];
        return new Promise((resolve)=>{
            if(fs.existsSync(this.filename)){
                fs.createReadStream(this.filename)
                    .pipe(csv({headers: false, separator: ';'}))
                    .on('data', (row) => {

                        if(!isHeader){
                            let dataTmp: newbo_logsEntity = {
                                userMail:row[0],
                                time:row[1],
                                query: row[2]
                            }
                            data.push(dataTmp);
                        } else {
                            isHeader = false;
                        }
                    })
                    .on('end', () => {
                        resolve(data);
                    })
            }else
            {
                resolve([]);
            }
        });
    }*/

    /**
     * write data to csv file
     */
  /*  writeCsvFile(log: newbo_logsEntity[]){

        let csvWriter = createCsvWriter({
            path: this.filename,
            header: this.header,
            fieldDelimiter:';'

        });
        this.readCsvFile().then((data:newbo_logsEntity[])=>{
             log.forEach((row: newbo_logsEntity)=>{
                data.push(row);
            });
            csvWriter.writeRecords(data).then(()=> console.log('The CSV file was written successfully'));
        });

    }*/

    /**
     * Logs query and parameters used in it.
     */
    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any{
        if(this.isNeedToWrite(query)){
            let log: Newbo_logs = {
                userMail: this.mailUser,
                time: new Date(),
                query: query
            };
           this.logService.saveRequest(log);

        }

    }
    /**
     * Logs query that is failed.
     */
    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): any{

    }
    /**
     * Logs query that is slow.
     */
    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any{
        console.log('query slow');
    }
    /**
     * Logs events from the schema build process.
     */
    logSchemaBuild(message: string, queryRunner?: QueryRunner): any{

    }
    /**
     * Logs events from the migrations run process.
     */
    logMigration(message: string, queryRunner?: QueryRunner): any{

    }
    /**
     * Perform logging using given logger, or by default to the console.
     * Log has its own level and message.
     */
    log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner): any{}

    isNeedToWrite(query: string){
        return query.indexOf('SELECT') !== 0 && query.indexOf('select') !== 0 && query !== 'START TRANSACTION' && query !== 'COMMIT';
    }

}
