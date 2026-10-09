@echo off
title MediPulse - Backend Server
echo ========================================================
echo  Starting MediPulse Backend (Spring Boot :8080)
echo ========================================================
cd /d "%~dp0backend"


echo Starting Spring Boot... (first start takes ~15 seconds)
if not exist "%TEMP%\opencode" mkdir "%TEMP%\opencode"
set JAVA_TOOL_OPTIONS=-Djava.io.tmpdir=%TEMP%\opencode
if "%JWT_SECRET%"=="" (
    set /p JWT_SECRET="Enter JWT secret (32+ characters): "
)
if "%JWT_SECRET%"=="" (
    echo JWT_SECRET is required.
    pause
    exit /b 1
)
if "%DB_PASSWORD%"=="" (
    set /p DB_PASSWORD="Enter your MySQL password: "
)
mvn spring-boot:run
pause
