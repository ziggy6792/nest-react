import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Demo API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Write OpenAPI schema to file in dev mode (non-blocking)
  if (process.env.NODE_ENV !== 'production') {
    const outDir = join(process.cwd(), 'out');
    const outFile = join(outDir, 'openapi.json');
    void (async () => {
      try {
        await mkdir(outDir, { recursive: true });
        await writeFile(outFile, JSON.stringify(document, null, 2), 'utf-8');
        console.log(`OpenAPI schema written to ${outFile}`);
      } catch (error) {
        console.warn('Failed to write OpenAPI schema to file:', error);
      }
    })();
  }

  // Setup Swagger UI at /api/swagger with JSON spec at /api/swagger/json
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: '/swagger/json',
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // throw an error if a non-whitelisted property is found
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      // Critical: strips properties that are not @Expose()'d in the target class
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    }),
  );

  const port = process.env.PORT ?? 3001;

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}

void bootstrap();
