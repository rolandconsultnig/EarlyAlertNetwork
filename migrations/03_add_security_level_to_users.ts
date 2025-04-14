import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  // Required for serverless environments
  neonConfig.webSocketConstructor = ws;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Add security_level column to users table
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS security_level INTEGER NOT NULL DEFAULT 1;
    `);

    console.log('Migration successful: Added security_level column to users table');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('Migration script failed:', err);
  process.exit(1);
});