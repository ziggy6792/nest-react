import { sqliteTableCreator } from 'drizzle-orm/sqlite-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `demo_${name}`);

// Infer the builder type from createTable to preserve type information
type TableBuilder = Parameters<Parameters<typeof createTable>[1]>[0];

export const timestamps = (d: TableBuilder) => ({
  // Milliseconds since epoch; change mode if you prefer seconds or Date
  createdAt: d
    .integer({ mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d
    .integer({ mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const users = createTable('user', (d) => ({
  id: d.integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: d.text().notNull(),
  ...timestamps(d),
}));

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;

