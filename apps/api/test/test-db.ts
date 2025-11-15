import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { join } from 'path';
import * as schema from '../src/server/db/schema';
import type { Database } from '../src/server/db';

export interface TestDatabase {
  db: Database;
  client: Client;
  url: string;
}

/**
 * Creates a test database and applies migrations using Drizzle's migrate API
 * @returns Promise resolving to the test database instance, client, and file path
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  // Create test database file path (relative to project root)
  const testDbPath = join(process.cwd(), 'test.db');
  const testDbUrl = `file:${testDbPath}`;

  // Create libSQL client for test database
  const client = createClient({
    url: testDbUrl,
  });

  // Create drizzle instance with schema
  const db = drizzle(client, { schema });

  // Apply migrations programmatically
  await migrate(db, {
    migrationsFolder: join(process.cwd(), 'drizzle'),
  });

  return {
    db,
    client,
    url: testDbPath,
  };
}
