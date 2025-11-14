import dotenv from 'dotenv';
dotenv.config();
import { type Config } from 'drizzle-kit';

export default {
  schema: './src/server/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ['demo_*'],
} satisfies Config;

