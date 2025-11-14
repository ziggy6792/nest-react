import { NestFactory, Reflector } from "@nestjs/core";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("Demo API")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI at /api/swagger with JSON spec at /api/swagger/json
  SwaggerModule.setup("api/swagger", app, document, {
    jsonDocumentUrl: "/api/swagger/json",
    customCssUrl: "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css",
    customJs: [
      "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js",
      "https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js",
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      // Critical: strips properties that are not @Expose()'d in the target class
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
