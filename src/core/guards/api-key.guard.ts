import { ExecutionContext, Injectable } from '@nestjs/common';
import { AppException } from '../exceptions/app.exception';
import { ConfigService } from '@nestjs/config';

export const DynamicApiKeyGuard = (apiKey: string) => {
  @Injectable()
  class ApiKeyGuard {
    constructor(public configService: ConfigService) {}
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const apiKeyHeader = request.headers['x-api-key'];
      const isAuth = this.configService.get(apiKey) === apiKeyHeader;
      if (!isAuth) {
        throw new AppException({
          msg: `auth failed  ${apiKeyHeader} !== ${this.configService.get(apiKey)}`,
          code: 401,
          key: 'AUTH_FAILED',
        });
      }
      return isAuth;
    }
  }
  return ApiKeyGuard;
};
