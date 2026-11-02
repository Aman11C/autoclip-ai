# AutoClip AI — Launcher Script for Windows PowerShell
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       AUTOCLIP AI PRODUCTION LAUNCHER       " -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$BASE_DIR = $PSScriptRoot
$PYTHON_EXE = "A:\5.2\python\bin\python.exe"
if (-not (Test-Path $PYTHON_EXE)) {
    $PYTHON_EXE = "python"
}

# 1. Start FastAPI Backend in background
Write-Host "[1/2] Starting AutoClip AI FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
$backendJob = Start-Process -FilePath $PYTHON_EXE -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 8000" -WorkingDirectory "$BASE_DIR\backend" -PassThru

Start-Sleep -Seconds 3

# 2. Start Next.js Frontend
Write-Host "[2/2] Starting Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
Write-Host "Open http://localhost:3000 in your browser to start generating viral shorts!" -ForegroundColor Magenta
Write-Host "Press Ctrl+C to terminate both servers." -ForegroundColor Yellow
Write-Host ""

Set-Location "$BASE_DIR\frontend"
try {
    npm run start
} finally {
    Write-Host "`nStopping backend server..." -ForegroundColor Yellow
    if ($backendJob -and -not $backendJob.HasExited) {
        Stop-Process -Id $backendJob.Id -Force
    }
}
