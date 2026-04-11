@echo off
echo ========================================
echo CheckMate! SRMS XAMPP Setup
echo ========================================
echo.

echo Checking if XAMPP MySQL is running...
tasklist | find "mysqld" >nul
if errorlevel 1 (
    echo MySQL is not running. Please start XAMPP and start MySQL service.
    echo.
    echo Steps:
    echo 1. Open XAMPP Control Panel
    echo 2. Click "Start" next to MySQL
    echo 3. Run this script again
    echo.
    pause
    exit /b
)

echo MySQL is running! Continuing setup...
echo.

echo Creating database...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS checkmate_srms;" 2>nul

echo Importing database schema...
"C:\xampp\mysql\bin\mysql.exe" -u root checkmate_srms < database.sql

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Starting CheckMate! SRMS Server...
echo.
echo Access: http://localhost:3000
echo.
echo Login:
echo Admin: admin@checkmate-srms.com / admin123
echo Teacher: teacher@checkmate-srms.com / teacher123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js
