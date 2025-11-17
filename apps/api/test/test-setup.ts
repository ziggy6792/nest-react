import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { App } from 'supertest/types';
import { unlinkSync } from 'fs';
import { AppModule } from '../src/app.module';
import type { Database } from '../src/server/db';
import { createTestDatabase } from './test-db';

export interface TestApp {
  app: INestApplication<App>;
  db: Database;
  cleanup: () => Promise<void>;
}

/**
 * Creates a NestJS application for e2e testing with the same configuration as main.ts
 * Uses a separate test database that is created and migrated automatically.
 * @returns Promise resolving to the configured application, database instance, and cleanup function
 */
export async function createTestApp(): Promise<TestApp> {
  // Create test database and apply migrations
  const testDb = await createTestDatabase();

  // Override the DB provider with the test database
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider('DB')
    .useValue(testDb.db)
    .compile();

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

  // Cleanup function to close connections and delete test database
  const cleanup = async () => {
    await app.close();
    testDb.client.close();
    // Clean up test database file
    try {
      unlinkSync(testDb.url);
      // libSQL may create additional files with -wal and -shm suffixes
      try {
        unlinkSync(`${testDb.url}-wal`);
      } catch {
        // Ignore if file doesn't exist
      }
      try {
        unlinkSync(`${testDb.url}-shm`);
      } catch {
        // Ignore if file doesn't exist
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Ignore errors if file doesn't exist or is already deleted
    }
  };

  return {
    app,
    db: testDb.db,
    cleanup,
  };
}
