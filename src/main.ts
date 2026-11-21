import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app
    .setGlobalPrefix('api', { exclude: ['health'] })
    .enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'v',
    })
    .enableCors({
      // Let the browser read the downloaded file's name
      exposedHeaders: ['Content-Disposition', 'file-name'],
    });
  const configService = app.get(ConfigService);
  const port = configService.get<string>('app.port')!;

  const config = new DocumentBuilder()
    .setTitle('gafi pil service')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'bearer', // <-- this key MUST match @ApiBearerAuth('bearer')
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/ui', app, documentFactory);
  await app.listen(port);
  console.log(`server is running , port `, port);
}
bootstrap();
