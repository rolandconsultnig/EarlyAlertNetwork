import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building Early Alert Network for Netlify (TypeScript check disabled)...');

try {
  // Build only the frontend (Vite build) - skip TypeScript checking
  console.log('1. Building frontend (skipping TypeScript check)...');
  execSync('npx vite build --mode production', { stdio: 'inherit' });

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

  console.log('\n🎉 Netlify build completed successfully!');
  console.log('📁 Build output: dist/');
  console.log('🚀 Ready for Netlify deployment!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
