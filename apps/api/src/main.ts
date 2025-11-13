import { NestFactory } from '@nestjs/core';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import { contract } from './contracts/users.contract';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  
  app.enableCors();
  app.setGlobalPrefix('api');

  // Generate OpenAPI spec from oRPC contract
  const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });

  const orpcSpec = await openAPIGenerator.generate(contract, {
    info: {
      title: 'API',
      version: '1.0.0',
    },
    servers: [{ url: '/api' }],
  }) as OpenAPIObject;

  // Setup Swagger UI at /api/swagger with JSON spec at /api/swagger/json
  SwaggerModule.setup('api/swagger', app, orpcSpec, {
    jsonDocumentUrl: '/api/swagger/json',
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js',
    ],
  });

  await app.listen(3000);
}

void bootstrap();
