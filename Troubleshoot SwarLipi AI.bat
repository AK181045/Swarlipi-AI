@echo off
TITLE SwarLipi AI - TroubleShooting & Update...
color 0E

echo.
echo  =============================================================
echo  🛠️  SwarLipi AI: Troubleshooting & Update Utility
echo  =============================================================
echo.

:: ── CHECK PORTS ──
echo  ➜  1. Checking Port 8000 (Backend)...
netstat -ano | findstr :8000 > nul
if %errorlevel% equ 0 (
    echo     [!] Port 8000 is ALREADY BUSY. Please close other instances.
) else (
    echo     [OK] Port 8000 is free.
)

echo  ➜  2. Checking Port 3000 (Frontend)...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo     [!] Port 3000 is ALREADY BUSY. Please close other instances.
) else (
    echo     [OK] Port 3000 is free.
)

:: ── CHECK DEPENDENCIES ──
echo  ➜  3. Verifying Node.js...
node -v > nul 2>&1
if %errorlevel% neq 0 (
    echo     [ERR] Node.js is NOT found. Please install Node.js.
) else (
    echo     [OK] Node.js is ready.
)

echo  ➜  4. Verifying FFmpeg...
ffmpeg -version > nul 2>&1
if %errorlevel% neq 0 (
    echo     [ERR] FFmpeg is NOT found. Please install FFmpeg.
) else (
    echo     [OK] FFmpeg is ready.
)

:: ── UPDATE ──
echo.
echo  🚀  Updating Frontend Dependencies (npm install)...
cd /d "%~dp0frontend"
call npm install --silent

echo.
echo  🚀  Updating Backend Dependencies (pip install)...
cd /d "%~dp0backend"
call .venv\Scripts\activate.bat && pip install -r requirements.txt --quiet

echo.
echo  🚀  Checking Database Health...
call .venv\Scripts\activate.bat && alembic upgrade head

echo.
echo  =============================================================
echo  ✅  UPDATE COMPLETE. 
echo      Try running "Launch SwarLipi AI.bat" now.
echo  =============================================================
echo  Developer: Anil Khichar (9049069577)
echo.
pause
