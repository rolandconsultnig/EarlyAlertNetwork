# Stop any existing Node.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Set environment variables
$env:NODE_ENV = "development"
$env:DATABASE_URL = "postgres://postgres:Samolan123@localhost:5456/ipcr"
$env:PORT = "3000"
$env:SESSION_SECRET = "dummy-secret-key-123"
$env:DEEPSEEK_API_KEY = "sk-dummy-deepseek-key-123"

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

# Build the application
Write-Host "Building the application..."
npm run build

# Start the development server
Write-Host "Starting the development server..."
npx tsx server/index.ts 