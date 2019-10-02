import {Body, Injectable, Post} from '@nestjs/common';
import {RequestService} from "../core/service/request-service";
import {Operation_invoices_status} from "./entity/Operation-invoices-status.entity";
import {Operations_workflow} from "./entity/operations-workflow.entity";
import {Request} from "./entity/Request.entity";

@Injectable()
export class OperationsWorkflowService extends RequestService{

    repOperationStatus: any;
    repOperation: any;
    repRequest: any;
    constructor() {

        super();
        this.createConnectionMySql().then(() => {
            this.repOperationStatus = this.connectionMysql.getRepository(Operation_invoices_status);
            this.repOperation = this.connectionMysql.getRepository(Operations_workflow);
            this.repRequest = this.connectionMysql.getRepository(Request);
        });
        this.createConnectionPostgres();
    }

    save(operation: Operations_workflow) {
        return this.repOperation.save(operation);
        // return {value : 'create'};
    }

    /**
     * find all invoices
     * @return Promise<Invoices[]>
     */
    findAllStatus(): Promise<Operation_invoices_status[]> {
        return new Promise((resolve, reject) => {
            this.repOperationStatus.createQueryBuilder("operation_invoices_status").orderBy("description", "ASC").getMany().then((rs) => {
                resolve(rs);
            });
        });
    }

    getAllByInvoice(invoice_ref: string){
        const req = "SELECT  st.*, op.*, p.amount_paid from operations_workflow op "+
                    " LEFT JOIN  operation_invoices_status st ON op.status_id = st.id" +
                    " LEFT JOIN  payments_list p ON p.operation_id = op.id" +
                    " WHERE invoice_reference = '"+invoice_ref+"'"+
                    " ORDER BY op.date ASC, op.created_at ASC ";
        //console.log(req);

       return this.repOperation.query(req);
    }

    saveRequest(req: Request){

        return this.repRequest.save(req);
    }

    /**
     * get the number of the same operation for one 1 invoice
     * @param operation Operations_workflow the operation that we search
     */
    getNbSpecialOperation(operation: Operations_workflow): Promise<Request>{
        return new Promise((resolve) => {
            const req = "SELECT count('id') as nb from operations_workflow op" +
                " WHERE status_id = "+operation.status_id+" " +
                " AND invoice_reference = '"+operation.invoice_reference+"'";

            //console.log(req);

           this.repOperation.query(req).then((rs)=>{
              resolve(rs);
           });
        });

    }


}
