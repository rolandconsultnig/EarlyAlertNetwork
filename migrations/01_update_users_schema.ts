import { db, pool } from "../server/db";

async function main() {
  console.log("Starting migration...");
  
  try {
    // Begin transaction
    await pool.query('BEGIN');
    
    // Add new columns to users table
    console.log("Adding new columns to users table...");
    
    // Add permissions column
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["view"]'`);
    
    // Add department column
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT');
    
    // Add position column
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS position TEXT');
    
    // Add phoneNumber column
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT');
    
    // Add email column
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT');
    
    // Add active column
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE');
    
    // Add lastLogin column
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP');
    
    // Commit transaction
    await pool.query('COMMIT');
    
    console.log("Migration completed successfully!");
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    console.error("Migration failed:", error);
    throw error;
  } finally {
    // Close the pool
    await pool.end();
  }
}

main().catch(console.error);