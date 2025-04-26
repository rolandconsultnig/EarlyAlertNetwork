import { storage } from "../server/storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function addUsers() {
  try {
    console.log("Starting user creation process...");
    
    // User 1: nuhu (admin)
    const nuhuExists = await storage.getUserByUsername("nuhu");
    if (!nuhuExists) {
      const nuhu = await storage.createUser({
        username: "nuhu",
        password: await hashPassword("nuhu123"),
        fullName: "Nuhu Administrator",
        role: "admin",
        securityLevel: 7,
        permissions: ["view", "edit", "create", "delete", "admin"],
        department: "Administration",
        position: "System Administrator",
        email: "nuhu@example.com",
        active: true,
      });
      console.log("Created admin user: nuhu");
    } else {
      console.log("User nuhu already exists");
    }
    
    // User 2: bako (analyst)
    const bakoExists = await storage.getUserByUsername("bako");
    if (!bakoExists) {
      const bako = await storage.createUser({
        username: "bako",
        password: await hashPassword("bako123"),
        fullName: "Bako Analyst",
        role: "analyst",
        securityLevel: 5,
        permissions: ["view", "edit", "create"],
        department: "Analysis",
        position: "Senior Analyst",
        email: "bako@example.com",
        active: true,
      });
      console.log("Created analyst user: bako");
    } else {
      console.log("User bako already exists");
    }
    
    // User 3: ipcr-dg (admin - director general)
    const dgExists = await storage.getUserByUsername("ipcr-dg");
    if (!dgExists) {
      const dg = await storage.createUser({
        username: "ipcr-dg",
        password: await hashPassword("dg123"),
        fullName: "Director General IPCR",
        role: "admin",
        securityLevel: 7,
        permissions: ["view", "edit", "create", "delete", "admin"],
        department: "Executive Office",
        position: "Director General",
        email: "dg@ipcr.gov.ng",
        active: true,
      });
      console.log("Created admin user: ipcr-dg");
    } else {
      console.log("User ipcr-dg already exists");
    }
    
    console.log("User creation process completed successfully!");
  } catch (error) {
    console.error("Error adding users:", error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addUsers();