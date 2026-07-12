import 'dotenv/config'; // ← must be first so process.env is populated
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { logger } from '../utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('AssetFlow API')
    .setDescription('The AssetFlow API documentation')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  logger.info(`AssetFlow API running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
