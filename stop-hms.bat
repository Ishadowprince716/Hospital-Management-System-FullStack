@echo off
title MediCare HMS - Shutdown
color 0C
cls

echo.
echo  =====================================================
echo   HMS - Stopping All Services
echo  =====================================================
echo.

:: Stop Vite (port 5173 / 5174)
echo  [1/3] Stopping Frontend (Vite)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo  [OK]  Frontend stopped.

:: Stop Spring Boot (port 8080)
echo  [2/3] Stopping Backend (Spring Boot)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo  [OK]  Backend stopped.

:: Stop MySQL
echo  [3/3] Stopping MySQL...
taskkill /IM mysqld.exe /F >nul 2>&1
echo  [OK]  MySQL stopped.

echo.
echo  =====================================================
echo   All HMS services stopped. Safe to close.
echo  =====================================================
echo.
pause
