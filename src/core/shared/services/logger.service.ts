import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { CorrelationIdService } from './correlation-id.service';
@Injectable()
export class LoggerService {
  private logger = winston.createLogger({
    level: 'info',
    levels: {
      error: 0,
      debug: 1,
      warn: 2,
      info: 3,
      http: 3,
      verbose: 4,
      silly: 6,
    },

    format: winston.format.combine(
      winston.format.printf(({ message }) => {
        return (message as string).replace(/"([^"]+)":/g, '$1:');
      }),
    ),
    transports: [new winston.transports.Console({ level: 'info' })],
  });
  constructor(
    private readonly configService: ConfigService,
    private readonly correlationIdService: CorrelationIdService,
  ) {}

  async log(
    level: string,
    message: string,
    data: { [k: string]: any },
    mask = true,
  ) {
    try {
      const correlationId = this.correlationIdService.correlationId;
      this.logger.log(
        level,
        JSON.stringify({
          message,
          time: new Date(),
          service: this.configService.get('server.name'),
          level,
          correlationId,
          data,
        }),
      );
    } catch (e: any) {
      console.log('logger_error', e.message);
    }
  }
  async appRequestInterceptor(
    level: string,
    message: string,
    req: Request,
    res: { [k: string]: any },
    mask = true,
  ) {
    let request = {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
    };
    this.log(level, message, { request, response: res }, mask);
  }
}
