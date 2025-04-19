import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);
  
  try {
    console.log('Adding description column to data_sources table...');
    
    // Add description column to data_sources table
    await pool.query(`
      ALTER TABLE data_sources
      ADD COLUMN description TEXT;
    `);
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  await pool.end();
}

main();