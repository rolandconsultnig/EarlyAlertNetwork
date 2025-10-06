import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Preparing Early Alert Network for Netlify deployment...\n');

try {
  // 1. Build the application
  console.log('📦 Step 1: Building application...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed\n');

  // 2. Create Netlify configuration files
  console.log('⚙️ Step 2: Creating Netlify configuration files...');
  
  // Create _redirects file
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

  // 3. Display deployment instructions
  console.log('\n🎉 Preparation completed successfully!\n');
  console.log('📋 Next steps for Netlify deployment:\n');
  console.log('1. Go to https://app.netlify.com');
  console.log('2. Click "New site from Git"');
  console.log('3. Connect your GitHub repository');
  console.log('4. Set build settings:');
  console.log('   - Build command: npx tsx scripts/build-for-netlify.js');
  console.log('   - Publish directory: dist');
  console.log('   - Node version: 18');
  console.log('5. Add environment variables:');
  console.log('   - DATABASE_URL: Your Neon database URL');
  console.log('   - SESSION_SECRET: A random secret string');
  console.log('6. Deploy!');
  console.log('\n📁 Build output ready in: dist/');
  console.log('🔗 Your site will be available at: https://your-site-name.netlify.app');

} catch (error) {
  console.error('❌ Preparation failed:', error.message);
  process.exit(1);
}
