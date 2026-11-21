import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Request } from 'express';
import { LoggerService } from '../shared/services/logger.service';
@Injectable()
export class AppRequestLoggerInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    return next.handle().pipe(
      map((data: { [k: string]: any }) => {
        this.loggerService.appRequestInterceptor(
          'info',
          'app_incoming_request_processed_successfully',
          request,
          data,
        );
        return data;
      }),
    );
  }
}
