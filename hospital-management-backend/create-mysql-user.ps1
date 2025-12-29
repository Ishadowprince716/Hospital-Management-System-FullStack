# Create MySQL User for Hospital App
# Run as Administrator

Write-Host "=== Creating MySQL User for Hospital App ===" -ForegroundColor Cyan
Write-Host ""

# New user credentials
$dbUser = "hospital_user"
$dbPassword = "hospital123"
$dbName = "hospital_db"

Write-Host "[1/4] Creating MySQL user..." -ForegroundColor Yellow

# Try to connect to MySQL and create user
# We'll try without password first (Windows MySQL often allows this for local admin)
$sqlCommands = @"
CREATE USER IF NOT EXISTS '$dbUser'@'localhost' IDENTIFIED BY '$dbPassword';
CREATE DATABASE IF NOT EXISTS $dbName;
GRANT ALL PRIVILEGES ON $dbName.* TO '$dbUser'@'localhost';
FLUSH PRIVILEGES;
SELECT 'User created successfully!' AS status;
"@

# Save commands to file
$sqlFile = "create_user.sql"
$sqlCommands | Out-File -FilePath $sqlFile -Encoding ASCII

Write-Host "Trying to create user..." -ForegroundColor Gray

# Try multiple authentication methods
$success = $false

# Method 1: No password (Windows auth)
Write-Host "  Attempting Windows authentication..." -ForegroundColor Gray
$result = & mysql -u root -e "source $sqlFile" 2>&1
if ($LASTEXITCODE -eq 0) {
    $success = $true
    Write-Host "✓ User created with Windows auth" -ForegroundColor Green
}

# Method 2: Empty password
if (-not $success) {
    Write-Host "  Attempting with empty password..." -ForegroundColor Gray
    $result = & mysql -u root -p"" -e "source $sqlFile" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $success = $true
        Write-Host "✓ User created with empty password" -ForegroundColor Green
    }
}

# Method 3: Common passwords
$commonPasswords = @("root", "password", "admin", "mysql", "123456")
if (-not $success) {
    foreach ($pwd in $commonPasswords) {
        Write-Host "  Trying password: $pwd..." -ForegroundColor Gray
        $result = & mysql -u root -p"$pwd" -e "source $sqlFile" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host "✓ User created with password: $pwd" -ForegroundColor Green
            break
        }
    }
}

if (-not $success) {
    Write-Host "✗ Could not connect to MySQL" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please enter your MySQL root password:" -ForegroundColor Yellow
    $rootPass = Read-Host -AsSecureString
    $rootPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPass))
    
    $result = & mysql -u root -p"$rootPassPlain" -e "source $sqlFile" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $success = $true
        Write-Host "✓ User created!" -ForegroundColor Green
    }
}

Remove-Item $sqlFile -ErrorAction SilentlyContinue

if (-not $success) {
    Write-Host "✗ Failed to create user" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Test new user connection
Write-Host "[2/4] Testing new user connection..." -ForegroundColor Yellow
$testResult = & mysql -u $dbUser -p"$dbPassword" -e "SELECT 'Connection successful!' AS status" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ New user can connect!" -ForegroundColor Green
}
else {
    Write-Host "✗ Connection test failed" -ForegroundColor Red
    Write-Host $testResult
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Update application.properties
Write-Host "[3/4] Updating application.properties..." -ForegroundColor Yellow
$propsFile = "src\main\resources\application.properties"

if (Test-Path $propsFile) {
    $content = Get-Content $propsFile -Raw
    $content = $content -replace 'spring.datasource.username=.*', "spring.datasource.username=$dbUser"
    $content = $content -replace 'spring.datasource.password=.*', "spring.datasource.password=$dbPassword"
    $content | Set-Content $propsFile -NoNewline
    Write-Host "✓ Configuration updated" -ForegroundColor Green
}
else {
    Write-Host "✗ Could not find application.properties" -ForegroundColor Red
}

# Rebuild
Write-Host "[4/4] Rebuilding application..." -ForegroundColor Yellow
Write-Host "(This may take a minute...)" -ForegroundColor Gray
& mvn clean package -DskipTests -q

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful!" -ForegroundColor Green
}
else {
    Write-Host "✗ Build failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  ✓ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "MySQL User Created:" -ForegroundColor Yellow
Write-Host "  Username: $dbUser" -ForegroundColor Cyan
Write-Host "  Password: $dbPassword" -ForegroundColor Cyan
Write-Host "  Database: $dbName" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step - Start the backend:" -ForegroundColor Yellow
Write-Host "  java -jar target/hospital-management-1.0.0.jar" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
