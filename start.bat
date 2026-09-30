@echo off
title MediCare HMS - Launcher
color 0A
cls

echo.
echo  =====================================================
echo   __  __          _ _  _____
echo  ^|  \/  ^|___  __/ ^| ^|__   ^|
echo  ^| ^|\/^| / _ \/  _  ^| / /  /
echo  ^|_^|  ^|_\___/\__,_^|_^|_^|_^|
echo   MediCare Hospital Management System
echo  =====================================================
echo.
echo  Starting all services... Please wait.
echo  =====================================================
echo.

:: ─────────────────────────────────────────────────────────
:: Resolve project root directory (where this .bat lives)
:: ─────────────────────────────────────────────────────────
set "HMS_ROOT=%~dp0"
:: Remove trailing backslash
if "%HMS_ROOT:~-1%"=="\" set "HMS_ROOT=%HMS_ROOT:~0,-1%"

:: ─────────────────────────────────────────────────────────
:: STEP 1: Check if MySQL is already running on port 3306
:: ─────────────────────────────────────────────────────────
echo  [1/3]  Checking MySQL...

netstat -ano | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 goto mysql_running

echo  [..]  MySQL not running. Attempting to start...

:: Try common MySQL install locations
set "MYSQL_FOUND="
for %%V in (8.4 8.3 8.2 8.1 8.0) do (
    if exist "C:\Program Files\MySQL\MySQL Server %%V\bin\mysqld.exe" (
        set "MYSQL_BIN=C:\Program Files\MySQL\MySQL Server %%V\bin\mysqld.exe"
        set "MYSQL_DATA=C:\ProgramData\MySQL\MySQL Server %%V\Data"
        set "MYSQL_FOUND=1"
        goto mysql_found
    )
)

:: Check if mysqld is on PATH
where mysqld.exe >nul 2>&1
if %errorlevel%==0 (
    set "MYSQL_BIN=mysqld.exe"
    set "MYSQL_DATA="
    set "MYSQL_FOUND=1"
    goto mysql_found_path
)

echo.
echo  [WARN] MySQL not found. Backend will use H2 in-memory database.
echo         Data will NOT persist after restart.
echo         Install MySQL 8.x for persistent storage.
echo.
goto mysql_done

:mysql_found
start "MySQL Server" /MIN "%MYSQL_BIN%" --datadir="%MYSQL_DATA%" --port=3306 --console
goto mysql_wait

:mysql_found_path
start "MySQL Server" /MIN mysqld.exe --port=3306 --console

:mysql_wait
echo  [..]  Waiting for MySQL to initialize (8 seconds)...
ping 127.0.0.1 -n 9 >nul

netstat -ano | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 goto mysql_started_ok

echo.
echo  [ERR]  MySQL FAILED to start!
echo         Please start MySQL manually, then re-run this script.
echo         Or continue anyway — backend will use H2 in-memory DB.
echo.
choice /C YN /M "Continue without MySQL?"
if errorlevel 2 exit /b 1

goto mysql_done

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
    echo  [..]  Killing old process on port 8080 ^(PID: %%a^)...
    taskkill /PID %%a /F >nul 2>&1
    ping 127.0.0.1 -n 2 >nul
)

:: Check if mvn is available
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERR]  Maven ^(mvn^) not found on PATH!
    echo         Install Apache Maven and add to PATH.
    echo         Download: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

start "HMS Backend" /D "%HMS_ROOT%\hospital-management-backend" cmd /k "color 0B && title HMS Backend (Spring Boot) && echo Starting Spring Boot... && mvn spring-boot:run"
echo  [..]  Backend starting in background window...
echo  [..]  Waiting for backend to be ready (polling up to 90s)...
echo.

:: ── Poll backend health endpoint every 5 seconds, up to 90s ──
set "BACKEND_READY=0"
set "WAIT_COUNT=0"
set "MAX_WAIT=18"

:backend_poll
if %WAIT_COUNT% geq %MAX_WAIT% goto backend_timeout

set /a ELAPSED=%WAIT_COUNT% * 5
set /a REMAINING=90 - %ELAPSED%
<nul set /p "=  [..]  Checking backend... (%ELAPSED%s elapsed) "

:: Check health endpoint
curl -s -o nul -w "%%{http_code}" http://localhost:8080/health 2>nul | findstr "200" >nul
if %errorlevel%==0 (
    set "BACKEND_READY=1"
    echo READY!
    goto backend_live
)

:: Fallback: check if port 8080 is listening at all
netstat -ano | findstr ":8080 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    :: Port is open, try auth endpoint
    curl -s -o nul -w "%%{http_code}" http://localhost:8080/api 2>nul | findstr "200" >nul
    if %errorlevel%==0 (
        set "BACKEND_READY=1"
        echo READY!
        goto backend_live
    )
)

echo waiting...
set /a WAIT_COUNT=%WAIT_COUNT% + 1
ping 127.0.0.1 -n 6 >nul
goto backend_poll

:backend_timeout
echo.
echo  [ERR]  Backend did not respond within 90 seconds!
echo         Check the "HMS Backend" window for errors.
echo.
choice /C YN /M "  Continue starting frontend anyway?"
if errorlevel 2 (
    echo  Exiting. Run stop.bat to clean up.
    pause
    exit /b 1
)
goto backend_done

:backend_live
echo  [OK]   Backend is live at http://localhost:8080/api

:backend_done
echo.

:: ─────────────────────────────────────────────────────────
:: STEP 3: Start React Frontend (Vite)
:: ─────────────────────────────────────────────────────────
echo  [3/3]  Starting React Frontend (Vite on port 5173)...

:: Kill any stale Vite processes on 5173/5174
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Check if node_modules exists, if not run npm install
if not exist "%HMS_ROOT%\hospital-management-react\node_modules" (
    echo  [..]  node_modules not found. Running npm install...
    start "HMS npm install" /D "%HMS_ROOT%\hospital-management-react" /WAIT cmd /c "npm install"
    echo  [OK]  npm install completed.
)

:: Check if npm is available
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERR]  npm not found on PATH!
    echo         Install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Set API origin so frontend can reach backend
set "VITE_API_ORIGIN=http://localhost:8080"

start "HMS Frontend" /D "%HMS_ROOT%\hospital-management-react" cmd /k "color 0E && title HMS Frontend (Vite) && set VITE_API_ORIGIN=http://localhost:8080 && echo Starting Vite dev server... && npm run dev -- --host 127.0.0.1 --port 5173"
echo  [..]  Frontend starting in background window...
echo  [..]  Waiting for Vite (6 seconds)...
ping 127.0.0.1 -n 7 >nul

echo  [OK]   Frontend starting at http://localhost:5173

echo.
echo  =====================================================
echo   All services launched successfully!
echo  =====================================================
echo.
echo   Frontend  :  http://localhost:5173
echo   Backend   :  http://localhost:8080/api
echo   Swagger   :  http://localhost:8080/swagger-ui.html
echo   H2 Console:  http://localhost:8080/h2-console  (if no MySQL)
echo   MySQL     :  localhost:3306  (DB: hospital_management)
echo.
echo   ---- Login Credentials ----
echo.
echo   Admin     :  whoami / iamgroot
echo   Doctor    :  doctor1 / doctor123
echo   Patient   :  patient1 / patient123
echo.
echo  =====================================================
echo.
echo  Opening browser in 3 seconds...
ping 127.0.0.1 -n 4 >nul
start "" "http://localhost:5173"

echo.
echo  [DONE] HMS is running!
echo.
echo  TIP: To stop all services, run stop.bat
echo       Backend and Frontend run in separate windows.
echo.
pause
