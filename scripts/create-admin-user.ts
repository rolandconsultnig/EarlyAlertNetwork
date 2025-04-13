import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { pool, db } from "../server/db";
import { users } from "../shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
  try {
    const hashedPassword = await hashPassword("admin123");
    
    const [admin] = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
        fullName: "IPCR Administrator",
        role: "admin",
      })
      .onConflictDoUpdate({
        target: users.username,
        set: { password: hashedPassword }
      })
      .returning();
    
    console.log("Admin user created or updated:", admin);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await pool.end();
  }
}

createAdmin();