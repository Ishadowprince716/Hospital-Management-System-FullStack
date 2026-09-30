@echo off
title MediCare HMS - Shutdown
color 0C
cls

echo.
echo  =====================================================
echo   HMS - Stopping All Services
echo  =====================================================
echo.

:: ─────────────────────────────────────────────────────────
:: STEP 1: Stop Frontend (Vite - ports 5173, 5174)
:: ─────────────────────────────────────────────────────────
echo  [1/4] Stopping Frontend (Vite)...
set "VITE_KILLED=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    echo         Killing PID %%a on port 5173...
    taskkill /PID %%a /F >nul 2>&1
    set "VITE_KILLED=1"
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174 " ^| findstr "LISTENING"') do (
    echo         Killing PID %%a on port 5174...
    taskkill /PID %%a /F >nul 2>&1
    set "VITE_KILLED=1"
)
:: Also kill any lingering node processes from Vite
taskkill /IM "node.exe" /FI "WINDOWTITLE eq HMS Frontend*" /F >nul 2>&1
if "%VITE_KILLED%"=="1" (
    echo  [OK]   Frontend stopped.
) else (
    echo  [--]   Frontend was not running.
)

echo.

:: ─────────────────────────────────────────────────────────
:: STEP 2: Stop Backend (Spring Boot - port 8080)
:: ─────────────────────────────────────────────────────────
echo  [2/4] Stopping Backend (Spring Boot)...
set "BACKEND_KILLED=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 " ^| findstr "LISTENING"') do (
    echo         Killing PID %%a on port 8080...
    taskkill /PID %%a /F >nul 2>&1
    set "BACKEND_KILLED=1"
)
:: Also kill any lingering java processes from Maven
taskkill /IM "java.exe" /FI "WINDOWTITLE eq HMS Backend*" /F >nul 2>&1
if "%BACKEND_KILLED%"=="1" (
    echo  [OK]   Backend stopped.
) else (
    echo  [--]   Backend was not running.
)

echo.

:: ─────────────────────────────────────────────────────────
:: STEP 3: Stop MySQL (optional)
:: ─────────────────────────────────────────────────────────
echo  [3/4] Checking MySQL...

netstat -ano | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo  [--]   MySQL was not running.
    goto mysql_stop_done
)

echo.
echo  MySQL is running on port 3306.
choice /C YN /M "  Stop MySQL too? (other apps may need it)"
if errorlevel 2 (
    echo  [--]   MySQL left running.
    goto mysql_stop_done
)

taskkill /IM mysqld.exe /F >nul 2>&1
:: Also try stopping via net stop
net stop MySQL84 >nul 2>&1
net stop MySQL80 >nul 2>&1
echo  [OK]   MySQL stop signal sent.

:mysql_stop_done
echo.

:: ─────────────────────────────────────────────────────────
:: STEP 4: Stop Docker containers (if running)
:: ─────────────────────────────────────────────────────────
echo  [4/4] Checking Docker containers...

docker ps -q --filter "name=hms-" >nul 2>&1
if %errorlevel% neq 0 (
    echo  [--]   Docker not running or no HMS containers found.
    goto docker_done
)

:: Check if any HMS containers are running
for /f %%i in ('docker ps -q --filter "name=hms-" 2^>nul') do (
    echo  [..]   Stopping Docker HMS containers...
    docker-compose down >nul 2>&1
    echo  [OK]   Docker containers stopped.
    goto docker_done
)
echo  [--]   No HMS Docker containers running.

:docker_done
echo.

:: ─────────────────────────────────────────────────────────
:: Close any leftover HMS command windows
:: ─────────────────────────────────────────────────────────
taskkill /FI "WINDOWTITLE eq HMS Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq HMS Frontend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq MySQL Server*" /F >nul 2>&1

echo  =====================================================
echo   All HMS services stopped successfully!
echo  =====================================================
echo.
echo   Ports freed:
echo     5173/5174  (Frontend)
echo     8080       (Backend)
echo     3306       (MySQL - if selected)
echo.
echo   TIP: Run start.bat to restart everything.
echo.
pause
