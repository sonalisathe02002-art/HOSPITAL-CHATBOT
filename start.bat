@echo off
title AuraCare Health Launcher

echo ========================================================
echo       Starting AuraCare Health System
echo       Backend + Frontend
echo ========================================================
echo.

echo [1/2] Launching FastAPI Backend...
start "AuraCare Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate.bat && uvicorn app.main:app --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Launching React Frontend...
start "AuraCare Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo                 PROJECT LINKS
echo ========================================================
echo.
echo Frontend:
echo http://127.0.0.1:5173
echo.
echo Backend:
echo http://127.0.0.1:8000
echo.
echo API Documentation:
echo http://127.0.0.1:8000/docs
echo.
echo ========================================================
echo Opening Frontend...
echo ========================================================

start http://localhost:5173

pause