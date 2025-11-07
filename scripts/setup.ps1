# Exit immediately if a command fails
$ErrorActionPreference = "Stop"

# Get the directory where this script is located
$ScriptDir = $PSScriptRoot
# Get the project root directory (one level up)
$ProjectRoot = (Get-Item $ScriptDir).Parent.FullName

Write-Host "🚀 Starting Full-Stack Setup (PowerShell)..."
Write-Host "Project Root: $ProjectRoot"

# 1. Setup Backend
Write-Host "--- Setting up Backend ---"
$BackendDir = Join-Path -Path $ProjectRoot -ChildPath "backend"
Set-Location -Path $BackendDir

# Create virtual environment
if (-not (Test-Path -Path "venv" -PathType Container)) {
    Write-Host "Creating Python virtual environment..."
    py -m venv venv
} else {
    Write-Host "Virtual environment 'venv' already exists."
}

# Activate virtual environment
Write-Host "Activating venv..."
.\venv\Scripts\Activate.ps1

# Install backend dependencies
Write-Host "Installing backend requirements..."
pip install -r requirements.txt

# Initialize the database
Write-Host "Initializing SQLite database..."
py init_db.py

# Deactivate
deactivate
Write-Host "Backend setup complete."

# 2. Setup Frontend
Write-Host "--- Setting up Frontend ---"
$FrontendDir = Join-Path -Path $ProjectRoot -ChildPath "frontend"
Set-Location -Path $FrontendDir

if (-not (Test-Path -Path "node_modules" -PathType Container)) {
    Write-Host "Installing frontend dependencies..."
    npm install
} else {
    Write-Host "Frontend dependencies already installed."
}

Write-Host "Frontend setup complete."
Set-Location -Path $ProjectRoot # Return to root at the end

Write-Host "✅ All setup tasks completed successfully!" -ForegroundColor Green