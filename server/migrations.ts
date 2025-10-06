import { db } from "./db";
import * as schema from "@shared/schema";

async function runMigrations() {
  try {
    // Create all tables
    await db.insert(schema.users).values({
      id: "admin-user-id",
      username: "admin",
      password: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNuWkW", // admin123
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      accessLevel: "level_7",
      email: "admin@example.com",
      isActive: true
    }).onConflictDoNothing();

    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
}

runMigrations(); 