import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // set prefix url mac dinh thành /api/v1
  app.setGlobalPrefix('api/v1')

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  // Setting cors
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_DEV_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })

  const port = process.env.PORT || 3000

  await app.listen(port);

  console.log(`Server is runng at: localhost:${port}/api/v1`);
  // Check Connect DB thành công hay không
  const dataSource = app.get(DataSource);

  if (dataSource.isInitialized) {
    console.log("Connect DB thành công")
  } else {
    console.log("Connect DB thất bại")
  }
}
void bootstrap();
