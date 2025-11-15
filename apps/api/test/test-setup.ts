import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import type { Database } from '../src/server/db';

export interface TestApp {
  app: INestApplication<App>;
  db: Database;
}

/**
 * Creates a NestJS application for e2e testing with the same configuration as main.ts
 * @returns Promise resolving to the configured application and database instance
 */
export async function createTestApp(): Promise<TestApp> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply the same global pipes and interceptors as main.ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    }),
  );

  await app.init();

  // Get the database instance for cleanup
  const db = app.get<Database>('DB');

  return { app, db };
}
