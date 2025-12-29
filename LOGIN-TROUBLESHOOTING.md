# Login Troubleshooting Guide

## Issue: Unable to Login

### What Was Fixed
1. **Backend Security Configuration** - Updated `/api/auth/**` pattern in SecurityConfig to ensure the login endpoint is properly authorized
2. **Frontend API URL** - Ensured `API_BASE_URL` points to `http://localhost:8080/api`
3. **CORS Configuration** - Verified CORS is properly configured to accept requests from the frontend

### Prerequisites to Login

#### 1. **Backend Server Running**
Ensure the Spring Boot backend is running on port 8080:
```bash
cd hospital-management-backend
mvn clean package
java -jar target/hospital-management-1.0.0.jar
```

You should see:
```
Tomcat initialized with port 8080 (http)
```

#### 2. **MySQL Database**
The backend requires MySQL running on `localhost:3306` with:
- **Database**: `hospital_db`
- **User**: `hospital_user`
- **Password**: `hospital123`

Verify MySQL is running:
```powershell
netstat -ano | Select-String "3306"
```

#### 3. **Credentials**
Use these test credentials:

| Role | Username | Password |
|------|----------|----------|
| Patient | patient1 | patient123 |
| Doctor | doctor1 | doctor123 |
| Admin | admin | admin123 |

### Debugging Steps

#### Step 1: Test Backend Directly (PowerShell)
```powershell
$loginData = @{ username = "admin"; password = "admin123"; role = "ADMIN" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $loginData -SkipCertificateCheck | ConvertFrom-Json | Format-List
```

If successful, you'll see:
```
token    : eyJhbGciOiJIUzI1NiJ9...
username : admin
role     : ADMIN
userId   : 1
fullName : System Administrator
message  : Login successful
```

#### Step 2: Check Browser Console (F12)
1. Open browser (Chrome/Firefox)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for any errors related to:
   - Network failures: "Failed to fetch"
   - CORS errors: "Access to XMLHttpRequest blocked by CORS"
   - Invalid credentials: "Invalid username or password"

#### Step 3: Check Network Tab (F12 > Network)
1. Go to **Network** tab
2. Try logging in
3. Look for the POST request to `/api/auth/login`
4. Check the **Response** tab for error messages
5. Check **Status Code**:
   - `200` = Success
   - `400` = Bad request (invalid credentials)
   - `401` = Unauthorized
   - `500` = Server error

#### Step 4: Check Server Logs
Monitor the backend console for errors:
```
ERROR ... HikariPool-1 - Exception during pool initialization
java.sql.SQLException: Access denied for user...
```

This indicates database connection issues.

### Common Issues & Solutions

#### Issue: "Unable to connect to server"
**Cause**: Backend not running or wrong URL
- Verify backend is running: `netstat -ano | Select-String "8080"`
- Check API_BASE_URL in `js/auth.js` is `http://localhost:8080/api`

#### Issue: "Invalid username or password"
**Cause**: Wrong credentials or user not in database
- Verify you're using correct credentials (see table above)
- Backend should auto-create default users on startup
- Check backend console for initialization messages

#### Issue: CORS Error in Console
**Cause**: Cross-Origin request blocked
- Already fixed in SecurityConfig
- If still occurring, verify `corsConfigurationSource()` allows all origins
- Browser may be caching - do hard refresh (Ctrl+Shift+R)

#### Issue: Database Connection Error
**Cause**: MySQL not running or wrong credentials
- Start MySQL server
- Verify credentials in `application.properties`:
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/hospital_db
  spring.datasource.username=hospital_user
  spring.datasource.password=hospital123
  ```

### Reset to Default State

If login is still not working, try resetting:

**1. Clear Browser Storage**
```javascript
// In browser console (F12 > Console)
localStorage.clear();
sessionStorage.clear();
```

**2. Rebuild Backend**
```powershell
cd hospital-management-backend
mvn clean package
```

**3. Restart Backend Service**
Kill the running process and restart from jar file

### Success Indicators

✅ Backend returns valid JWT token (starts with `eyJ`)
✅ Login redirects to dashboard (patient/doctor/admin)
✅ User information displayed in dashboard
✅ No console errors when logged in

### Files Modified
- `hospital-management-backend/src/main/java/com/hospital/config/SecurityConfig.java`
- `hospital-management-frontend/js/auth.js`
