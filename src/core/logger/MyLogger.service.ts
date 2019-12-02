import {Logger, QueryRunner} from "typeorm";
import * as moment from 'moment';

const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

export interface InterfaceLog {
    user:string;
    time: string;
    query: string;

}

export class MyLoggerService implements Logger {

    filename:string = moment().format('YYYY-MM-DD')+'.log.csv';
    mailUser: string;
    header = [
        { id:'user', title:'User'},
        { id:'time', title:'Time'},
        { id:'query', title:'Query'}
    ];



    constructor(){}

    /**
     * read data from csv file
     */
    readCsvFile(){
        let isHeader = true; // allow to not get the header in the file
        let data: InterfaceLog[] = [];
        return new Promise((resolve)=>{
            if(fs.existsSync(this.filename)){
                fs.createReadStream(this.filename)
                    .pipe(csv({headers: false, separator: ';'}))
                    .on('data', (row) => {

                        if(!isHeader){
                            let dataTmp: InterfaceLog = {
                                user:row[0],
                                time:row[1],
                                query: row[2]
                            }
                            data.push(dataTmp);
                        } else {
                            isHeader = false;
                        }
                    })
                    .on('end', () => {
                        console.log('data read length : ' +data.length);
                        resolve(data);
                    })
            }else
            {
                resolve([]);
            }
        });
    }

    /**
     * write data to csv file
     */
    writeCsvFile(log: InterfaceLog[]){

        let csvWriter = createCsvWriter({
            path: this.filename,
            header: this.header,
            fieldDelimiter:';'

        });
        this.readCsvFile().then((data:InterfaceLog[])=>{
             log.forEach((row: InterfaceLog)=>{
                data.push(row);
            });
             console.log('log length : ' +log.length);
             console.log('data write length : ' +data.length);
             console.log(data);
            csvWriter.writeRecords(data).then(()=> console.log('The CSV file was written successfully'));
        });

    }

    /**
     * Logs query and parameters used in it.
     */
    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any{
        if(this.isNeedToWrite(query)){
            let log:InterfaceLog={
                user: this.mailUser,
                time: moment().format('YYYY-MM-DD - hh:mm:ss'),
                query: query
            }
            this.writeCsvFile([log]);
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
