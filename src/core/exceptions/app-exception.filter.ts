import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { AppException } from './app.exception';
import { Request, Response } from 'express';
import { CorrelationIdService } from '../shared/services/correlation-id.service';
import { LoggerService } from '../shared/services/logger.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly correlationIdService: CorrelationIdService,
    private readonly configService: ConfigService,
  ) {}
  catch(exception: Error | HttpException | AppException, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>();
    const res = host.switchToHttp().getResponse<Response>();
    let err: { [k: string]: any } = {};
    const isProdEnv = this.configService.get('server.env') === 'prod';
    if (
      exception.constructor.name == 'AppException' &&
      exception instanceof AppException
    ) {
      err = exception.error;
    } else {
      err = {
        msg: isProdEnv
          ? 'unknown error occurred , try later'
          : exception.message,
        code:
          exception instanceof HttpException
            ? (exception as HttpException).getStatus()
            : 400,
      };
    }
    this.loggerService.appRequestInterceptor(
      'error',
      'app_incoming_request_processed_with_error',
      req,
      { ...err, stack: exception.stack, originalError: exception.message },
    );
    err.details = isProdEnv ? undefined : err.details;
    return res.status(Number(err.code)).json({
      ...err,
      timestamp: new Date().toLocaleString(),
      correlationId: this.correlationIdService.correlationId,
    });
  }
}
