import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { sql } from 'drizzle-orm';
import ws from "ws";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    console.log('Starting migration: Add source and category fields to alerts table');
    
    // Add source column with default value
    await db.execute(sql`
      ALTER TABLE alerts 
      ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'system'
    `);
    
    // Add category column (nullable)
    await db.execute(sql`
      ALTER TABLE alerts 
      ADD COLUMN IF NOT EXISTS category TEXT
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration script failed:', err);
  process.exit(1);
});