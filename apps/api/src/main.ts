import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import { contract } from './contracts/users.contract';

async function bootstrap() {
  const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [
      new ZodToJsonSchemaConverter(),
    ],
  });

  const spec = await openAPIGenerator.generate(contract, {
    info: {
      title: 'API',
      version: '1.0.0',
    },
    servers: [
      { url: '/api' }, /** Should use absolute URLs in production */
    ],
  });

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(3000);
}

void bootstrap();
