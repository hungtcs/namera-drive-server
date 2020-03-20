import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

const options = new DocumentBuilder()
  .setTitle('Namera Drive Service')
  .setDescription('namera drive server api')
  .setVersion('0.1')
  .setContact('鸿则', 'https://github.com/hungtcs', 'hungtcs@163.com')
  .addServer(`/api`, 'local')
  .addBearerAuth()
  .build();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  app.setGlobalPrefix('/api');

  await app.listen(3000);
}
bootstrap();
