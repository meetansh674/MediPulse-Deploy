@echo off
title MediPulse - Unified Frontend
echo ========================================================
echo  Starting MediPulse Frontend on http://localhost:5500
echo ========================================================
cd /d "%~dp0frontend"

start "" http://localhost:5500
python -m http.server 5500
pause
