import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './shared/schema.ts';
import 'dotenv/config';

async function setupDatabase() {
  let pool;
  try {
    // Validate environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Connecting to database...');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test connection
    await pool.query('SELECT 1');
    console.log('Database connection successful');

    // Create Drizzle instance
    const db = drizzle(pool, { schema });

    // Run migrations
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully');

    // Insert admin user if it doesn't exist
    const adminUser = {
      username: 'admin',
      password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNuWkW', // hashed password
      fullName: 'Administrator',
      role: 'admin',
      securityLevel: 7,
      permissions: ['view', 'create', 'edit', 'delete'],
      department: 'Administration',
      position: 'System Administrator',
      email: 'admin@example.com',
      active: true
    };

    console.log('Setting up admin user...');
    await db.insert(schema.users)
      .values(adminUser)
      .onConflictDoNothing();
    console.log('Admin user setup completed');

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('Database connection closed');
    }
  }
}

setupDatabase(); 