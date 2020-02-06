import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

export interface Response<T> {
    ok:boolean;
    result:T;
}

@Injectable()
/**
 * Transform the result of api to send a response in a good format to the client
 */
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<any>> {
        console.log('new request : ' + moment().format('hh:mm:ss'));
        return next.handle().pipe(map((result) => {
            console.log('intercept result');
            if(result){
                if(result.error){
                    return {
                        ok:false,
                        result: result.error
                    }
                }

                return {
                    ok:true,
                    result: result
                };
            }

        }));
    }
}
