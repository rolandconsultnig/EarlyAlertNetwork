import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building Early Alert Network for Netlify...');

try {
  // Build the application
  console.log('1. Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });

  // Create _redirects file for SPA routing
  console.log('2. Creating _redirects file...');
  const redirectsContent = `# API routes
/api/* /.netlify/functions/api/:splat 200

# SPA fallback
/* /index.html 200
`;
  
  fs.writeFileSync('dist/_redirects', redirectsContent);
  console.log('✅ _redirects file created');

  // Create _headers file for security headers
  console.log('3. Creating _headers file...');
  const headersContent = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
`;
  
  fs.writeFileSync('dist/_headers', headersContent);
  console.log('✅ _headers file created');

  // Create netlify.toml in dist folder
  console.log('4. Creating netlify.toml...');
  const netlifyConfig = `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
`;
  
  fs.writeFileSync('dist/netlify.toml', netlifyConfig);
  console.log('✅ netlify.toml created');

  console.log('\n🎉 Netlify build completed successfully!');
  console.log('📁 Build output: dist/');
  console.log('🚀 Ready for Netlify deployment!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
