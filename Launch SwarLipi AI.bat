@echo off
TITLE SwarLipi AI - Music Notation Computing Engine...

:: ── Color Scheme (Blue background, White text) ──
color 1F
echo.
echo  =============================================================
echo  🎵  SwarLipi AI: Music Computing Engine (Anil Khichar)
echo  =============================================================
echo.
echo  🚀  STARTING NOTATION CALCULATION SERVERS...
echo.

:: ── SET ENVIRONMENT ──
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

:: ── START BACKEND (FASTAPI) ──
echo  ➜  Launching Analytical Backend (Port 8000)...
start "SwarLipi Backend Engine" /D "%PROJECT_DIR%backend" cmd /c "%PROJECT_DIR%backend\.venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: ── START FRONTEND (NEXT.JS) ──
echo  ➜  Launching Instrumentation UI (Port 3000)...
start "SwarLipi Frontend UI" /D "%PROJECT_DIR%frontend" cmd /c "npm run dev"

:: ── WAIT FOR STARTUP ──
echo  ⌚  Waiting for logical warm up...
timeout /t 5 /nobreak > nul

:: ── OPEN BROWSER ──
echo  🌐  Opening Platform in Browser: http://localhost:3000
start http://localhost:3000

echo.
echo  ✅  SwarLipi AI is now running.
echo  ❌  Close the other two console windows to stop the servers.
echo.
echo  -------------------------------------------------------------
echo  Lead Engineer: Anil Khichar (Software Engineer)
echo  Contact: 9049069577
echo  -------------------------------------------------------------
echo.
pause
