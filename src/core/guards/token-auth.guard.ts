import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IUserInfo } from '../types/user-info.type';
import { AppException } from '../exceptions/app.exception';
import { ConfigService } from 'node_modules/@nestjs/config/dist/config.service';
import * as jwt from 'jsonwebtoken';
export const DynamicAuthTokenGuard = (mustBeAuthenticated = true) => {
  @Injectable()
  class AuthTokenGuard implements CanActivate {
    constructor(readonly configService: ConfigService) {}
    canActivate(context: ExecutionContext): boolean {
      try {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const checkAuth =
          mustBeAuthenticated || request.headers['authorization'] !== undefined;
        if (!checkAuth) return true;
        const authroizationHeader = request.headers['authorization'];
        if (!authroizationHeader) {
          throw new AppException({
            msg: 'authorization header is missing',
            code: 401,
            isHidden: true,
            key: 'AUTH_TOKEN_MISSING',
          });
        }
        const jwtSecret = this.configService.get<string>('app.jwtSecret')!;
        const userInfo = jwt.verify(
          authroizationHeader.split(' ')[1],
          jwtSecret,
          { algorithms: ['HS256'] },
        ) as unknown as IUserInfo;
        request.userInfo = userInfo;
        return true;
      } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
          throw new AppException({
            msg: e.message,
            code: 401,
            isHidden: true,
            key: 'AUTH_TOKEN_INVALID',
          });
        }
        throw e;
      }
    }
  }
  return AuthTokenGuard;
};
