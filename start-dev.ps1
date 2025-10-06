# Set environment variables
$env:NODE_ENV = "development"
$env:DATABASE_URL = "postgres://postgres:Samolan123@localhost:5456/ipcr"
$env:PORT = "3000"
$env:SESSION_SECRET = "dummy-secret-key-123"
$env:DEEPSEEK_API_KEY = "sk-dummy-deepseek-key-123"

# Start the development server
Write-Host "Starting development server..."
npx tsx server/index.ts 