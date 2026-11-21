import { Global, Module } from '@nestjs/common';
import { CorrelationIdService } from './services/correlation-id.service';
import { LoggerService } from './services/logger.service';
import { AppHttpService } from './services/http.service';
import { ConfigService } from '@nestjs/config';
import { BootstrapService } from './services/bootstrap.service';
import { MailService } from './services/email.service';
@Global()
@Module({
  providers: [
    ConfigService,
    CorrelationIdService,
    LoggerService,
    AppHttpService,
    BootstrapService,
    MailService,
  ],
  exports: [
    ConfigService,
    CorrelationIdService,
    LoggerService,
    AppHttpService,
    BootstrapService,
    MailService,
  ],
})
export class SharedModule {}
