import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

async function checkDatabase() {
  let pool;
  try {
    console.log('Connecting to database...');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const db = drizzle(pool);

    // Check if users table exists and what columns it has
    console.log('Checking users table structure...');
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Users table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });

    // Check if there are any users
    console.log('\nChecking existing users...');
    const users = await db.execute(sql`SELECT username, role FROM users LIMIT 5;`);
    console.log('Existing users:');
    users.rows.forEach(row => {
      console.log(`- ${row.username} (${row.role})`);
    });

  } catch (error) {
    console.error('Error checking database:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

checkDatabase();
