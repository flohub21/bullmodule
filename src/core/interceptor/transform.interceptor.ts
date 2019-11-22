import {Injectable, NestInterceptor, ExecutionContext, CallHandler, UseGuards} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { AuthGuard } from '@nestjs/passport';

export interface Response<T> {
    ok:boolean;
    result:T;
}

@Injectable()
/**
 * Transform the result of api to send a response in a good format to the client
 */
@UseGuards(AuthGuard('jwt'))
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<any>> {
        console.log('new request' + moment().format('hh:mm:ss'));
        return next.handle().pipe(map((result) => {
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
            })
        );
    }

}
