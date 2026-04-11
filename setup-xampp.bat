@echo off
echo ========================================
echo CheckMate! SRMS XAMPP Setup Script
echo ========================================
echo.

echo [1/5] Starting XAMPP MySQL...
cd /d "C:\xampp"
if exist "mysql_start.bat" (
    call mysql_start.bat
) else (
    echo Starting MySQL manually...
    start "" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini"
)

echo.
echo [2/5] Waiting for MySQL to start...
timeout /t 5 /nobreak >nul

echo.
echo [3/5] Creating database...
cd /d "%~dp0"
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS checkmate_srms;"

echo.
echo [4/5] Importing database schema...
"C:\xampp\mysql\bin\mysql.exe" -u root checkmate_srms < database.sql

echo.
echo [5/5] Starting CheckMate! SRMS Server...
echo.
echo ========================================
echo CheckMate! SRMS is now running!
echo ========================================
echo.
echo Access the application at:
echo http://localhost:3000
echo.
echo Login Credentials:
echo Admin: admin@checkmate-srms.com / admin123
echo Teacher: teacher@checkmate-srms.com / teacher123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

pause
