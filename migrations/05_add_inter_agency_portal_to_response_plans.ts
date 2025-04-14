import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";
import * as schema from "../shared/schema";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Make sure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  console.log("Running migration: Adding interAgencyPortal column to response_plans table");
  
  try {
    // Add interAgencyPortal as JSONB column to response_plans table
    await db.execute(sql`
      ALTER TABLE response_plans
      ADD COLUMN IF NOT EXISTS inter_agency_portal JSONB;
    `);
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});