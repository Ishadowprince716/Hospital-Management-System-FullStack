# ⚠️ IMPORTANT: Right-click on PowerShell and select "Run as Administrator"

# Quick MySQL Password Reset
# This script must run with Administrator privileges

Write-Host "Checking admin privileges..." -ForegroundColor Cyan
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host "  ✗ ERROR: This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host ""
    Write-Host "How to fix:" -ForegroundColor Yellow
    Write-Host "1. Press Windows + X" -ForegroundColor White
    Write-Host "2. Click 'Terminal (Admin)' or 'PowerShell (Admin)'" -ForegroundColor White
    Write-Host "3. Navigate to this folder:" -ForegroundColor White
    Write-Host "   cd 'C:\Users\RAHUL KUSHWAH\OneDrive\Desktop\New folder\hospital-management-backend'" -ForegroundColor Cyan
    Write-Host "4. Run this script again:" -ForegroundColor White
    Write-Host "   .\reset-mysql-password.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""
Write-Host "=== MySQL Password Reset Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop MySQL
Write-Host "[1/6] Stopping MySQL service..." -ForegroundColor Yellow
try {
    Stop-Service -Name MySQL80 -Force -ErrorAction Stop
    Write-Host "✓ MySQL service stopped" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to stop MySQL: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Start-Sleep -Seconds 2

# Step 2: Create init file
Write-Host "[2/6] Creating password reset file..." -ForegroundColor Yellow
$initFile = "C:\mysql-init.txt"
@"
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
"@ | Out-File -FilePath $initFile -Encoding ASCII
Write-Host "✓ Init file created" -ForegroundColor Green

# Step 3: Find mysqld.exe
Write-Host "[3/6] Locating MySQL..." -ForegroundColor Yellow
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysqld.exe"
)

$mysqldPath = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqldPath = $path
        break
    }
}

if (-not $mysqldPath) {
    Write-Host "✗ Could not find mysqld.exe" -ForegroundColor Red
    Remove-Item $initFile -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
Write-Host "✓ Found MySQL at: $mysqldPath" -ForegroundColor Green

# Step 4: Start MySQL with init file
Write-Host "[4/6] Resetting password..." -ForegroundColor Yellow
$process = Start-Process -FilePath $mysqldPath -ArgumentList "--init-file=$initFile" -PassThru -NoNewWindow
Start-Sleep -Seconds 10
Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✓ Password reset completed" -ForegroundColor Green

# Step 5: Start MySQL service
Write-Host "[5/6] Starting MySQL service..." -ForegroundColor Yellow
try {
    Start-Service -Name MySQL80 -ErrorAction Stop
    Start-Sleep -Seconds 3
    Write-Host "✓ MySQL service started" -ForegroundColor Green
}
catch {
    Write-Host "✗ Failed to start MySQL: $_" -ForegroundColor Red
    Remove-Item $initFile -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Clean up
Remove-Item $initFile -ErrorAction SilentlyContinue

# Step 6: Test connection
Write-Host "[6/6] Testing connection..." -ForegroundColor Yellow
$testResult = & mysql -u root -proot -e "SELECT 'SUCCESS' AS status" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Connection successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "  ✓ PASSWORD RESET SUCCESSFUL!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "MySQL root password is now: " -NoNewline
    Write-Host "root" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "The backend is ready to start!" -ForegroundColor Yellow
    Write-Host ""
}
else {
    Write-Host "✗ Connection test failed" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
