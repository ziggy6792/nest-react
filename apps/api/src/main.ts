import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received");
    await app.close();
    process.exit(0);
  });

  await app.listen(3000);
}

void bootstrap();
