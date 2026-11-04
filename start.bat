@echo off
title AutoClip AI Launcher
echo ========================================================
echo               STARTING AUTOCLIP AI
echo ========================================================
echo.
echo [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "AutoClip Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && "A:\5.2\python\bin\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting Next.js Frontend on http://localhost:3000 ...
start "AutoClip Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo [3/3] Opening browser in 4 seconds...
timeout /t 4 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================================
echo AutoClip AI is running!
echo Keep the backend and frontend terminal windows open.
echo ========================================================
pause
