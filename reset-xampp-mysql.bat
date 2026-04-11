@echo off
echo ========================================
echo CheckMate! SRMS - Reset XAMPP MySQL
echo ========================================
echo.
echo This script will reset the XAMPP MySQL root password to empty
echo.
echo WARNING: This will reset your MySQL root password!
echo Press Ctrl+C to cancel or any key to continue...
pause >nul
echo.

echo [1/6] Stopping XAMPP MySQL...
cd /d "C:\xampp"
if exist mysql_stop.bat (
    call mysql_stop.bat
) else (
    taskkill /f /im mysqld.exe >nul 2>&1
)
timeout /t 3 /nobreak >nul

echo [2/6] Starting MySQL in safe mode...
start "" /B "C:\xampp\mysql\bin\mysqld.exe" --skip-grant-tables
timeout /t 5 /nobreak >nul

echo [3/6] Connecting to MySQL...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "USE mysql; UPDATE user SET password=PASSWORD('') WHERE user='root'; FLUSH PRIVILEGES;" 2>nul
if errorlevel 1 (
    echo [3/6] Trying alternative method...
    "C:\xampp\mysql\bin\mysql.exe" -u root -e "USE mysql; ALTER USER 'root'@'localhost' IDENTIFIED BY ''; FLUSH PRIVILEGES;" 2>nul
)

echo [4/6] Stopping MySQL safe mode...
taskkill /f /im mysqld.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo [5/6] Starting XAMPP MySQL normally...
if exist mysql_start.bat (
    call mysql_start.bat
) else (
    start "" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini"
)
timeout /t 5 /nobreak >nul

echo [6/6] Testing connection...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT 'Connection successful!' as status;" 2>nul
if errorlevel 1 (
    echo.
    echo ❌ MySQL reset failed. Please try manually:
    echo 1. Open XAMPP Control Panel
    echo 2. Go to phpMyAdmin: http://localhost/phpmyadmin
    echo 3. User accounts -> Edit root -> Set no password
) else (
    echo.
    echo ✅ MySQL password reset successful!
    echo.
    echo Now run: node server.js
    echo.
    echo Or run: setup-xampp-simple.bat
)

echo.
echo Press any key to exit...
pause >nul
