import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Get current file directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Execute the migration file
const migrationFile = path.resolve(__dirname, '../migrations/01_update_users_schema.ts');

console.log(`Running migration: ${migrationFile}`);

exec(`npx tsx ${migrationFile}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing migration: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Migration stderr: ${stderr}`);
  }
  
  console.log(`Migration output: ${stdout}`);
  console.log('Migration completed successfully!');
});