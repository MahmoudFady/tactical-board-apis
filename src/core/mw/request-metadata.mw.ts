import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { nanoid } from 'nanoid';
import { CorrelationIdService } from '../shared/services/correlation-id.service';
@Injectable()
export class RequestMetadataMw implements NestMiddleware {
  constructor(private readonly correlationIdService: CorrelationIdService) {}
  use(req: Request, res: Response, next: NextFunction) {
    req.startTime = Date.now();
    const correlationId = nanoid(24);
    return this.correlationIdService.run(correlationId, () => {
      res.setHeader(
        'x-correlation-id',
        req['x-correlation-id'] || correlationId,
      );
      next();
    });
  }
}
