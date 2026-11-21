import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppExceptionFilter } from './core/exceptions/app-exception.filter';
import { AppRequestLoggerInterceptor } from './core/interceptors/app-request-logger.interceptor';
import { SharedModule } from './core/shared/shared.module';
import { AppEnvConfig } from './config/app-env.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [AppEnvConfig] }),
    SharedModule,
    DatabaseModule.register(),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ConfigService,
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AppRequestLoggerInterceptor,
    },
  ],
  exports: [ConfigService],
})
export class AppModule {}
