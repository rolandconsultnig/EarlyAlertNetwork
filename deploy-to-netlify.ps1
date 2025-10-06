Write-Host "🚀 Deploying Early Alert Network to Netlify..." -ForegroundColor Green

# Build the application
Write-Host "📦 Building application..." -ForegroundColor Yellow
npx tsx scripts/build-for-netlify.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Build output ready in: dist/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 To deploy to Netlify:" -ForegroundColor Yellow
    Write-Host "1. Go to https://netlify.com" -ForegroundColor White
    Write-Host "2. Drag and drop the 'dist' folder" -ForegroundColor White
    Write-Host "3. Or connect your GitHub repo and set:" -ForegroundColor White
    Write-Host "   - Build command: npx tsx scripts/build-for-netlify.js" -ForegroundColor Gray
    Write-Host "   - Publish directory: dist" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 Don't forget to set environment variables in Netlify:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL" -ForegroundColor White
    Write-Host "   - SESSION_SECRET" -ForegroundColor White
    Write-Host "   - Other API keys" -ForegroundColor White
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
