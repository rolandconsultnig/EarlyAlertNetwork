/**
 * Update Package.json Script for cPanel Deployment
 * 
 * This script updates the package.json file in the cpanel-deploy directory
 * with the correct dependencies for deployment. It reads from the template
 * and allows you to easily add more dependencies if needed.
 */

const fs = require('fs');
const path = require('path');

// Define paths
const templatePath = path.join(__dirname, 'package.json.template');
const packagePath = path.join(__dirname, 'package.json');

// Additional dependencies to include (extend as needed)
const additionalDependencies = {
  // Add any additional dependencies here in the format:
  // "package-name": "^version"
};

// Read template file
console.log('Reading package template...');
let packageTemplate;
try {
  packageTemplate = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
  console.log('Template loaded successfully.');
} catch (error) {
  console.error('Error reading template file:', error.message);
  process.exit(1);
}

// Add additional dependencies
if (Object.keys(additionalDependencies).length > 0) {
  console.log('Adding additional dependencies:');
  for (const [pkg, version] of Object.entries(additionalDependencies)) {
    console.log(`  - ${pkg}: ${version}`);
    packageTemplate.dependencies[pkg] = version;
  }
}

// Write updated package.json
console.log('Writing updated package.json...');
try {
  fs.writeFileSync(packagePath, JSON.stringify(packageTemplate, null, 2));
  console.log('Package.json updated successfully!');
} catch (error) {
  console.error('Error writing package.json:', error.message);
  process.exit(1);
}

console.log('\nNext steps:');
console.log('1. Run "npm install" to install dependencies');
console.log('2. Initialize database with "npm run init-db"');
console.log('3. Test database connection with "npm run test-db"');
console.log('4. Start the application with "npm start"');