import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

        return next.handle().pipe(map((result) => {
          /* console.log('----------------------------');
            console.log(result);
            console.log('transform interceptor end ');*/
                return {
                    ok:true,
                    result: result
                };
            })
        );
    }
}
