import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class InvoiceMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: any) {
        console.log('new request invoice ');
        next();
    }
}
