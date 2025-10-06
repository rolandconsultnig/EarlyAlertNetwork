import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import 'dotenv/config';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
  let pool;
  try {
    console.log('Connecting to database...');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const db = drizzle(pool);

    // Hash the password using the same method as the auth system
    const password = 'admin123';
    const hashedPassword = await hashPassword(password);

    // Insert admin user
    console.log('Creating admin user...');
    await db.execute(sql`
      INSERT INTO users (
        id, username, email, first_name, last_name, role, 
        access_level, is_active, password_hash, created_at, updated_at
      ) VALUES (
        'admin', 'admin', 'admin@example.com', 'System', 'Administrator', 
        'admin', 'level_7', true, ${hashedPassword}, NOW(), NOW()
      ) ON CONFLICT (username) DO UPDATE SET
        password_hash = ${hashedPassword},
        role = 'admin',
        access_level = 'level_7',
        updated_at = NOW()
    `);

    console.log('✅ Admin user created successfully!');
    console.log('📋 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Access Level: level_7');

  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

createAdmin();