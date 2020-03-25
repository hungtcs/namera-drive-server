import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@shared/logger/public_api';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const options = new DocumentBuilder()
  .setTitle('Namera Drive Service')
  .setDescription('namera drive server api')
  .setVersion('0.1')
  .setContact('鸿则', 'https://github.com/hungtcs', 'hungtcs@163.com')
  .addServer(`/api`, 'local')
  .addBearerAuth()
  .build();


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['warn', 'error', 'log', 'debug', 'verbose'],
  });

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: false,
  }));

  app.setGlobalPrefix('/api');

  app.useLogger(new LoggerService());

  await app.listen(3000);
}
bootstrap();
