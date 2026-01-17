import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// For production, use environment variables
// Use DIRECT_URL for migrations, DATABASE_URL for application
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kelapa';

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });