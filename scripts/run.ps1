# Exit immediately if a command fails
$ErrorActionPreference = "Stop"

# Get the directory where this script is located
$ScriptDir = $PSScriptRoot
# Get the project root directory (one level up)
$ProjectRoot = (Get-Item $ScriptDir).Parent.FullName

Write-Host "🚀 Starting Full-Stack Application (PowerShell)..."
Write-Host "Project Root: $ProjectRoot"

$BackendJob = $null

try {
    # 1. Start Backend as a background job
    Write-Host "--- Starting FastAPI Backend (as a background job) ---"
    $BackendDir = Join-Path -Path $ProjectRoot -ChildPath "backend"
    
    # Script block to run in the background
    $ScriptBlock = {
        param($BackendDir)
        # Go to the backend directory to run
        Set-Location -Path $BackendDir
        # Activate venv
        .\venv\Scripts\Activate.ps1
        # Run the server
        uvicorn main:app --port 8000
    }

    # Start the job
    $BackendJob = Start-Job -ScriptBlock $ScriptBlock -ArgumentList $BackendDir
    
    Write-Host "Backend job started... (Job Name: $($BackendJob.Name))"
    Write-Host "API Docs at http://localhost:8000/docs"
    
    # Give the backend a moment to start
    Write-Host "Waiting 4 seconds for backend to initialize..."
    Start-Sleep -Seconds 4

    # 2. Start Frontend in the foreground
    Write-Host "--- Starting React Frontend (in this window) ---"
    $FrontendDir = Join-Path -Path $ProjectRoot -ChildPath "frontend"
    Set-Location -Path $FrontendDir
    
    # This command will take over the current terminal
    # Press Ctrl+C to stop the frontend
    npm start

} catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
} finally {
    # This block runs when you press Ctrl+C to stop the frontend
    Write-Host "Frontend process stopped."
    if ($BackendJob) {
        Write-Host "Stopping backend job (Name: $($BackendJob.Name))..."
        Stop-Job -Job $BackendJob
        Remove-Job -Job $BackendJob
        Write-Host "Backend job stopped."
    }
}