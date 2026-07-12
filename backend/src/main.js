import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { logger } from '../utils/logger';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new DocumentBuilder()
        .setTitle('AssetFlow API')
        .setDescription('The AssetFlow API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory);
    await app.listen(process.env.PORT ?? 3000);
    logger.info(`AssetFlow API running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
