import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running migration: add data source schema updates");

  // Add lastFetchedAt column to data_sources table
  await db.execute(sql`
    ALTER TABLE IF EXISTS data_sources
    ADD COLUMN IF NOT EXISTS last_fetched_at timestamp;
  `);

  // Add processedAt and status columns to collected_data table
  await db.execute(sql`
    ALTER TABLE IF EXISTS collected_data
    ADD COLUMN IF NOT EXISTS processed_at timestamp,
    ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'unprocessed';
  `);

  console.log("Migration complete: data source schema updates");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });