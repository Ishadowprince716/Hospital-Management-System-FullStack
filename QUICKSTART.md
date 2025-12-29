# 🚀 Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Check Prerequisites
Ensure you have installed:
- ✅ Java 17+
- ✅ Maven 3.6+
- ✅ MySQL 8.0+
- ✅ MongoDB 6.0+

### Step 2: Start Databases

**MySQL:**
```bash
# Start MySQL service
# Windows: Use MySQL Workbench or Services
# Linux: sudo systemctl start mysql
# macOS: brew services start mysql

# Default credentials: root/root
# Database 'hospital_db' will be auto-created
```

**MongoDB:**
```bash
# Start MongoDB service
# Windows: Use MongoDB Compass or Services
# Linux: sudo systemctl start mongod
# macOS: brew services start mongodb-community

# Database 'hospital_records' will be auto-created
```

### Step 3: Start Backend

```bash
# Navigate to backend folder
cd "C:\Users\RAHUL KUSHWAH\OneDrive\Desktop\New folder\hospital-management-backend"

# Build and run
mvn spring-boot:run

# Wait for: "Hospital Management System Started Successfully!"
# Backend API: http://localhost:8080/api
```

### Step 4: Open Frontend

```bash
# Navigate to frontend folder
cd "C:\Users\RAHUL KUSHWAH\OneDrive\Desktop\New folder\hospital-management-frontend"

# Open index.html in your browser
# Or start a simple server:
python -m http.server 8000

# Access: http://localhost:8000
```

### Step 5: Login & Test

**Try these credentials:**

**Patient Portal:**
- Username: `patient1`
- Password: `patient123`
- Features: Book appointments, view records

**Doctor Panel:**
- Username: `doctor1`  
- Password: `doctor123`
- Features: View schedule, manage appointments

**Admin Dashboard:**
- Username: `admin`
- Password: `admin123`
- Features: System overview, analytics

---

## 🎯 What to Test

### Patient Flow:
1. Login as patient
2. View dashboard statistics
3. Go to "Book Appointment"
4. Select a doctor
5. Choose date & time
6. Enter reason for visit
7. Click "Book Appointment"
8. View appointment in "My Appointments"

### Doctor Flow:
1. Login as doctor
2. View today's schedule
3. Check all appointments
4. See patient details

### Admin Flow:
1. Login as admin
2. View system statistics
3. Monitor all appointments
4. Check total doctors & patients

---

## 🔧 Troubleshooting

**Backend won't start:**
- Check MySQL is running on port 3306
- Check MongoDB is running on port 27017
- Verify Java 17 is installed: `java -version`
- Check Maven: `mvn -version`

**Login not working:**
- Ensure backend is running
- Check backend console for "Hospital Management System Started Successfully!"
- Open browser console (F12) to see any errors
- Verify API URL in index.html matches backend

**Port conflicts:**
- Backend uses port 8080
- Change in application.properties: `server.port=8081`
- Update frontend API_BASE_URL accordingly

---

## 📞 Need Help?

Check the detailed [README.md](file:///c:/Users/RAHUL%20KUSHWAH/OneDrive/Desktop/New%20folder/README.md) for:
- Detailed setup instructions
- Architecture overview
- API documentation
- Feature list

---

**Developer**: Rahul Singh Kushwaha  
**Status**: ✅ Ready to Run
