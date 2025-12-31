# 🔧 API Testing Guide - Hospital Management System

## Quick Start

### Step 1: Open the Test Panel
Open this file in your browser (or use Live Server):
```
hospital-management-frontend/test-api.html
```

### Step 2: Test the API Flow
The test panel will guide you through:

1. **Server Health Check** - Verifies backend is running
2. **User Login** - Try login with `doctor1` / `password123`
3. **Get Doctor Info** - Retrieves doctor details
4. **Get Doctor Appointments** - Shows doctor's appointments
5. **Get All Appointments** - Admin view of all appointments
6. **AI Health Check** - Verifies AI endpoint

---

## What to Look For

### ✅ Success Signs:
- Backend responds on http://localhost:8080
- Login returns token and user object
- Doctor info is retrievable
- Appointments show in the list

### ❌ Failure Signs:
- "Cannot connect to backend" → Backend not running
- "Login failed (401)" → Wrong credentials or auth issue
- "No appointments found" → Appointments not being saved
- "Failed (404)" → Endpoint doesn't exist

---

## If Backend Not Running

Open terminal and run:
```bash
cd hospital-management-backend
mvn clean install -DskipTests
mvn spring-boot:run
```

Wait for message: `Started HospitalApplication in X seconds`

---

## Key Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Doctor | doctor1 | password123 |
| Doctor | doctor2 | password123 |
| Patient | patient1 | password123 |
| Admin | admin1 | password123 |

---

## Browser Console Debugging

Press `F12` in browser and go to **Console** tab to see:
- Detailed API request/response logs
- Appointment fetch logs (from dashboards)
- Error stack traces
- Actual responses from backend

---

## Common Issues & Fixes

### Issue: "Error loading appointments"

**Check in Console (F12):**
1. Look for red ❌ error messages
2. Note the API URL that failed
3. Check the exact error message

**Likely Causes:**
- Backend not running → Restart with `mvn spring-boot:run`
- Wrong doctor ID → Verify ID in login response
- Appointments not saved → Check server logs
- CORS issue → Backend has `@CrossOrigin(origins = "*")`

### Issue: Login fails

**Check:**
1. Backend is running
2. Username/password are correct
3. MySQL database is accessible
4. Server logs for login errors

### Issue: No appointments found

**Check:**
1. Doctor ID is correct (from login)
2. Appointments were actually booked
3. Server logs show "✓ Appointment booked successfully"
4. Database has entries in `appointments` table

---

## Advanced: Manual API Testing

You can also test directly in browser console:

```javascript
// Test doctor appointments
const token = localStorage.getItem('token');
const doctorId = 1;

fetch(`http://localhost:8080/api/appointments/doctor/${doctorId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('Appointments:', data))
.catch(e => console.error('Error:', e));
```

---

## Next Steps

1. ✅ Open test-api.html in browser
2. ✅ Click "Test Backend Availability"
3. ✅ Verify "✅ Backend is running"
4. ✅ Click "Test Login" with doctor1/password123
5. ✅ Click "Get Doctor Appointments"
6. ✅ Check the result
7. ✅ If error, note the exact message and check server logs

Then report back with:
- Screenshot of test results
- Any error messages shown
- Server log output (from terminal)
