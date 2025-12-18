@echo off
REM Hifdh Quest Backend - Development Startup Script
REM This script loads .env variables and starts Spring Boot

echo.
echo ========================================
echo   Hifdh Quest Backend - Starting...
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please create one: cp .env.example .env
    echo.
    pause
    exit /b 1
)

echo [1/3] Loading environment variables from .env...
echo.

REM Load .env file and set variables
for /f "tokens=1,2 delims==" %%a in (.env) do (
    REM Skip comments and empty lines
    echo %%a | findstr /r "^#" >nul && (
        REM Skip comment line
    ) || (
        echo   Setting %%a
        set "%%a=%%b"
    )
)

echo.
echo [2/3] Verifying Java installation...
java -version
if errorlevel 1 (
    echo [ERROR] Java not found!
    echo Please install Java 17+ and set JAVA_HOME
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Spring Boot application...
echo.
echo Backend will be available at: http://localhost:%PORT%
echo Health check: http://localhost:%PORT%/api/test/health
echo WebSocket: ws://localhost:%PORT%/ws
echo.
echo Press Ctrl+C to stop the server
echo.

mvnw.cmd spring-boot:run

pause
