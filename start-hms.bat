@echo off
title MediCare HMS - Launcher
color 0A
cls

echo.
echo  =====================================================
echo   __  __          _ _ _____
echo  ^|  \/  ^|___  __/ ^| ^|__   ^|
echo  ^| ^|\/^| / _ \/ _  ^| / /  /
echo  ^|_^|  ^|_\___/\__,_^|_^|_^|_^|
echo   Hospital Management System
echo  =====================================================
echo.
echo  Starting all services... Please wait.
echo  =====================================================
echo.

:: ─────────────────────────────────────────────────────────
:: STEP 1: Check if MySQL is already running on port 3306
:: ─────────────────────────────────────────────────────────
echo  [1/3]  Checking MySQL...

netstat -ano | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 goto mysql_running

echo  [..] MySQL not running. Starting MySQL 8.4...
start "MySQL Server" /MIN "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --datadir="C:\ProgramData\MySQL\MySQL Server 8.4\Data" --port=3306 --console
echo  [..] Waiting for MySQL to initialize (8 seconds)...
ping 127.0.0.1 -n 9 >nul

rem Verify MySQL started
netstat -ano | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 goto mysql_started_ok

echo.
echo  [ERR]  MySQL FAILED to start!
echo         Please start MySQL manually via MySQL Workbench
echo         then re-run this script.
echo.
pause
exit /b 1

:mysql_started_ok
echo  [OK]   MySQL started successfully on port 3306.
goto mysql_done

:mysql_running
echo  [OK]   MySQL already running on port 3306.

:mysql_done
echo.

:: ─────────────────────────────────────────────────────────
:: STEP 2: Start Spring Boot Backend
:: ─────────────────────────────────────────────────────────
echo  [2/3]  Starting Spring Boot Backend (port 8080)...

:: Kill any stale backend process on 8080
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 " ^| findstr "LISTENING"') do (
    echo  [..] Killing old process on port 8080 PID: %%a ...
    taskkill /PID %%a /F >nul 2>&1
    ping 127.0.0.1 -n 2 >nul
)

start "HMS Backend" /D "C:\Users\RAHUL KUSHWAH\OneDrive\Desktop\HMS\hospital-management-backend" cmd /k "color 0B && title HMS Backend (Spring Boot) && echo Starting Spring Boot... && mvn spring-boot:run"
echo  [..] Backend starting in background window...
echo  [..] Waiting for backend to be ready (20 seconds)...
ping 127.0.0.1 -n 21 >nul

:: Check if backend is up
curl -s -o nul -w "%%{http_code}" http://localhost:8080/api/auth/login -X POST -H "Content-Type: application/json" -d "{}" 2>nul | findstr "400" >nul
if %errorlevel%==0 goto backend_live

echo  [WARN] Backend may still be starting. Continuing anyway...
goto backend_done

:backend_live
echo  [OK]   Backend is live at http://localhost:8080/api

:backend_done

echo.

:: ─────────────────────────────────────────────────────────
:: STEP 3: Start React Frontend (Vite)
:: ─────────────────────────────────────────────────────────
echo  [3/3]  Starting React Frontend (Vite)...

:: Kill any stale Vite processes on 5173/5174
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

start "HMS Frontend" /D "C:\Users\RAHUL KUSHWAH\OneDrive\Desktop\HMS\hospital-management-react" cmd /k "color 0E && title HMS Frontend (Vite) && echo Starting Vite dev server... && npm run dev"
echo  [..] Frontend starting in background window...
echo  [..] Waiting for Vite (6 seconds)...
ping 127.0.0.1 -n 7 >nul

echo  [OK]   Frontend starting at http://localhost:5173

echo.
echo  =====================================================
echo   All services launched!
echo  =====================================================
echo.
echo   Frontend  :  http://localhost:5173
echo   Backend   :  http://localhost:8080/api
echo   MySQL     :  localhost:3306  (DB: hospital_management)
echo.
echo   Admin Login:
echo     Username : whoami
echo     Password : iamgroot
echo     Role     : ADMIN
echo.
echo  =====================================================
echo.
echo  Opening browser in 3 seconds...
ping 127.0.0.1 -n 4 >nul
start "" "http://localhost:5173"

echo.
echo  [DONE] HMS is running. Close this window anytime.
echo         (Backend and Frontend windows will keep running)
echo.
pause
