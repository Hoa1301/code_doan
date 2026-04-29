import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResolveExceptionFilter } from './common/exceptions/resolve.exception';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { Logger } from '@nestjs/common';
import { AUTH_JWT } from './common/constants/app.constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new ResolveExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('POS NDM')
    .setDescription('Hệ thống POS')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT access token',
        in: 'header',
      },
      AUTH_JWT,
    )
    .setVersion('1.0')
    .addTag('POS')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  Logger.log(`[bootstrap] run with port::${process.env.PORT}`);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
