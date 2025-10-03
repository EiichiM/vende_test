import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS para que el frontend pueda conectarse
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  // Validación automática en todas las rutas
  // whitelist quita propiedades que no están en los DTOs
  // transform convierte tipos automáticamente (string -> number, etc)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger para tener la documentación automática
  const config = new DocumentBuilder()
    .setTitle('API de Productos')
    .setDescription('API para gestionar productos y compañías')
    .setVersion('1.0')
    .addTag('products', 'Todo lo relacionado con productos')
    .addTag('companies', 'Info de compañías')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`API funcionando en puerto ${port}`);
  console.log(`Docs de Swagger: http://localhost:${port}/api/docs`);
}

bootstrap().catch(console.error);