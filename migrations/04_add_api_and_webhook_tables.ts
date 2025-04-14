import { Pool } from "@neondatabase/serverless";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Create api_keys table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      key TEXT NOT NULL,
      permissions JSONB NOT NULL,
      expires_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      last_used TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'active'
    );
  `);
  
  // Create webhooks table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      secret TEXT NOT NULL,
      events JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      last_triggered TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'active'
    );
  `);
  
  await pool.end();
  
  console.log("Migration completed: API keys and webhooks tables created");
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});