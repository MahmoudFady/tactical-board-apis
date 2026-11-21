import { Injectable } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
@Injectable()
export class BootstrapService {
  constructor() {}
  configureSwagger(
    app: NestApplication,
    title: string,
    description: string,
    url = 'api/ui',
  ) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion('1.0')
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(url, app, swaggerDocument);
  }
}
