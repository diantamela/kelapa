import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '@/lib/db';

async function runMigrations() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations complete!');
}

runMigrations()
  .then(() => {
    console.log('Migration process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running migrations:', error);
    process.exit(1);
  });