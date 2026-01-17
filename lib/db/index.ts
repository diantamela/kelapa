import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// For production, use environment variables
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kelapa';

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });