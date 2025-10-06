import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Building Early Alert Network for Netlify (Simple Build)...\n');

try {
  // Set environment to production
  process.env.NODE_ENV = 'production';
  
  // Build only the frontend using Vite (which handles TypeScript more gracefully)
  console.log('📦 Building frontend with Vite...');
  execSync('npx vite build --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('✅ Frontend build completed\n');

  // Create _redirects file for SPA routing
  console.log('⚙️ Creating Netlify configuration files...');
  
  const redirectsContent = `# API routes
/api/* /.netlify/functions/api/:splat 200

# SPA fallback
/* /index.html 200
`;
  fs.writeFileSync('dist/_redirects', redirectsContent);
  console.log('✅ _redirects file created');

  // Create _headers file
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

  console.log('\n🎉 Build completed successfully!');
  console.log('📁 Build output: dist/');
  console.log('🚀 Ready for Netlify deployment!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
