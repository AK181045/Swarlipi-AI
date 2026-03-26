# SwarLipi AI - Local Run Script
# This starts the Backend and Frontend concurrently.

Write-Host "🎵 Starting SwarLipi AI Platform..." -ForegroundColor Cyan

# 1. Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit -Command `"`$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User'); cd backend; .\.venv\Scripts\activate; uvicorn app.main:app --host 0.0.0.0 --port 8000`"" -WindowStyle Normal

Write-Host "➜ Backend API starting at http://localhost:8000" -ForegroundColor Green

# 2. Wait for backend
Start-Sleep -Seconds 3

# 3. Start Frontend in current window/terminal
Write-Host "➜ Frontend starting at http://localhost:3000" -ForegroundColor Green
cd frontend
npm run dev
