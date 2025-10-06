#!/bin/bash

echo "🚀 Deploying Early Alert Network to Netlify..."

# Build the application
echo "📦 Building application..."
npx tsx scripts/build-for-netlify.js

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build output ready in: dist/"
    echo ""
    echo "🌐 To deploy to Netlify:"
    echo "1. Go to https://netlify.com"
    echo "2. Drag and drop the 'dist' folder"
    echo "3. Or connect your GitHub repo and set:"
    echo "   - Build command: npx tsx scripts/build-for-netlify.js"
    echo "   - Publish directory: dist"
    echo ""
    echo "🔧 Don't forget to set environment variables in Netlify:"
    echo "   - DATABASE_URL"
    echo "   - SESSION_SECRET"
    echo "   - Other API keys"
else
    echo "❌ Build failed!"
    exit 1
fi
