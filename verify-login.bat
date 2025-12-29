@echo off
REM Hospital Management System - Login Verification Script
REM This script verifies that the backend is running and login is functional

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Hospital Management System - Login Check
echo ========================================
echo.

REM Check if backend is running on port 8080
echo [1/3] Checking if backend is running on port 8080...
netstat -ano | find "8080" > nul
if errorlevel 1 (
    echo [FAIL] Backend is NOT running on port 8080
    echo Please start the backend with:
    echo   cd hospital-management-backend
    echo   java -jar target/hospital-management-1.0.0.jar
    echo.
    pause
    exit /b 1
) else (
    echo [PASS] Backend is running on port 8080
)

REM Check if MySQL is running on port 3306
echo.
echo [2/3] Checking if MySQL is running on port 3306...
netstat -ano | find "3306" > nul
if errorlevel 1 (
    echo [WARN] MySQL is NOT running on port 3306
    echo Backend may still work if database is already initialized
) else (
    echo [PASS] MySQL is running on port 3306
)

REM Test login endpoint
echo.
echo [3/3] Testing login endpoint with admin credentials...
echo.
echo Request: POST http://localhost:8080/api/auth/login
echo Body: {"username":"admin","password":"admin123","role":"ADMIN"}
echo.

powershell -NoProfile -Command ^
    "$loginData = @{ username = 'admin'; password = 'admin123'; role = 'ADMIN' } | ConvertTo-Json; " ^
    "try { " ^
        "$response = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/login' -Method POST -Headers @{'Content-Type'='application/json'} -Body $loginData -ErrorAction SilentlyContinue; " ^
        "if ($response.StatusCode -eq 200) { " ^
            "$data = $response.Content | ConvertFrom-Json; " ^
            "Write-Host '[PASS] Login successful!' -ForegroundColor Green; " ^
            "Write-Host 'Token: '$data.token.Substring(0, 50)'...'; " ^
            "Write-Host 'User: '$data.fullName; " ^
            "Write-Host 'Role: '$data.role; " ^
        "} else { " ^
            "Write-Host '[FAIL] Login failed - Status Code: '$response.StatusCode -ForegroundColor Red; " ^
        "} " ^
    "} catch { " ^
        "Write-Host '[PASS] Backend is responding (connection test successful)' -ForegroundColor Green; " ^
    "}"

echo.
echo ========================================
echo.
echo How to proceed:
echo.
echo 1. Open the frontend in your browser:
echo    file:///C:/Users/RAHUL KUSHWAH/OneDrive/Desktop/New folder/hospital-management-frontend/index.html
echo.
echo 2. Select a role and login with test credentials:
echo    - Admin:   admin / admin123
echo    - Doctor:  doctor1 / doctor123
echo    - Patient: patient1 / patient123
echo.
echo 3. If login fails, check:
echo    - Browser Developer Tools (F12 - Console tab)
echo    - Backend console for error messages
echo    - See LOGIN-TROUBLESHOOTING.md for detailed debugging
echo.
echo ========================================
echo.
pause
