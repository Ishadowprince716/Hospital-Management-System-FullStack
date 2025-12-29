# 🔧 Fix "Unable to Connect to Server" Error

## Problem
The error "Unable to connect to server. Please try again later." appears because the **backend server is not running**.

Your frontend is working perfectly! The backend just needs to be started.

---

## ✅ Quick Solution (Use Chocolatey Package Manager)

### Step 1: Install Chocolatey (if not already installed)
Open **PowerShell as Administrator** and run:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Step 2: Install Maven using Chocolatey
```powershell
choco install maven -y
```

### Step 3: Install MySQL
```powershell
choco install mysql -y
```

### Step 4: Install MongoDB
```powershell
choco install mongodb -y
```

### Step 5: Verify Installations
```powershell
mvn --version
mysql --version
mongod --version
```

### Step 6: Start Services
```powershell
# Start MySQL
net start MySQL

# Start MongoDB
net start MongoDB
```

### Step 7: Run Backend
```powershell
cd "C:\Users\RAHUL KUSHWAH\OneDrive\Desktop\New folder\hospital-management-backend"
mvn spring-boot:run
```

Wait for: **"Hospital Management System Started Successfully!"**

### Step 8: Refresh Frontend
Go back to your browser at `http://127.0.0.1:5500` and login again!

---

## 🚀 Alternative: Manual Maven Installation

If you prefer manual installation:

1. **Download Maven**:
   - Go to: https://maven.apache.org/download.cgi
   - Download `apache-maven-3.9.6-bin.zip`

2. **Extract**:
   - Extract to `C:\Program Files\Apache\maven`

3. **Set Environment Variables**:
   - Open System Properties → Environment Variables
   - Add to PATH: `C:\Program Files\Apache\maven\bin`
   - Add JAVA_HOME: `C:\Program Files\Java\jdk-25`

4. **Verify**:
   ```powershell
   mvn --version
   ```

5. **Continue with Step 6 above**

---

## 🎯 Alternative: Use IntelliJ IDEA (Easiest!)

If you have IntelliJ IDEA installed:

1. Open IntelliJ IDEA
2. Click **File → Open**
3. Select: `C:\Users\RAHUL KUSHWAH\OneDrive\Desktop\New folder\hospital-management-backend`
4. Wait for Maven dependencies to download (bottom right progress bar)
5. Right-click `HospitalManagementApplication.java`
6. Click **Run 'HospitalManagement...Application'**

**Note**: Make sure MySQL and MongoDB are running first!

---

## 📝 Quick MySQL & MongoDB Setup

### MySQL:
1. Download: https://dev.mysql.com/downloads/installer/
2. Install with default settings
3. Set root password: `root`
4. Start MySQL service from Services app

### MongoDB:
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings  
3. Start MongoDB service from Services app

---

## 🔍 Verify Backend is Running

When backend starts successfully, you'll see:
```
🏥 Hospital Management System Started Successfully!
📍 Backend API: http://localhost:8080/api
```

Then your login will work perfectly!

---

## ⚡ Temporary Test Without Backend

If you just want to see the UI working, I can create a **mock mode** where the frontend works with dummy data (no real database needed). Would you like me to create that?

---

**Current Status**: Frontend ✅ | Backend ❌ (not running)  
**Fix**: Install Maven → Start MySQL/MongoDB → Run Backend

Let me know which solution you prefer!
