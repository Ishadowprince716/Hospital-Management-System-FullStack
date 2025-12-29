# Testing & Setup Guide

## ⚠️ Prerequisites Check

### Current Status:
- ✅ **Java**: Installed (Version 25)
- ❌ **Maven**: Not installed
- ❓ **MySQL**: Not verified
- ❓ **MongoDB**: Not verified

## 🔧 Option 1: Install Required Tools

### Install Maven
1. Download Maven from: https://maven.apache.org/download.cgi
2. Extract to `C:\Program Files\Apache\maven`
3. Add to PATH: `C:\Program Files\Apache\maven\bin`
4. Verify: `mvn --version`

### Install MySQL
1. Download from: https://dev.mysql.com/downloads/installer/
2. Install with default settings
3. Set root password to: `root`
4. Start MySQL service

### Install MongoDB
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service

## 🚀 Option 2: Quick Frontend Test (No Backend Required)

You can test the **frontend UI** without running the backend:

```bash
# Navigate to frontend folder
cd "hospital-management-frontend"

# Open index.html directly in browser
start index.html
```

**Note**: Without backend, you'll see errors when trying to login, but you can:
- View the premium login page design
- See the glassmorphism effects
- Test responsive design
- View UI/UX elements

## 🏃 Option 3: Use IDE (Recommended)

### IntelliJ IDEA / Eclipse:
1. Open `hospital-management-backend` folder as Maven project
2. Let IDE download dependencies automatically
3. Run `HospitalManagementApplication.java`
4. Start MySQL and MongoDB services first

## 📝 Manual Testing Checklist

### Frontend Only:
- [ ] Open index.html in browser
- [ ] Check login page design loads correctly
- [ ] Verify responsive layout works
- [ ] Test role selector buttons
- [ ] Check animations and effects

### Backend (After Setup):
- [ ] Backend starts successfully on port 8080
- [ ] MySQL connection establishes
- [ ] MongoDB connection establishes
- [ ] Default users are created
- [ ] API endpoints are accessible

### Full Integration:
- [ ] Login works for all three roles
- [ ] Dashboard redirects correctly
- [ ] Appointment booking works
- [ ] Data persistence in databases

## 🐛 Common Issues

### "Maven not found"
- Install Maven or use an IDE with Maven support

### "Port 8080 already in use"
- Change port in `application.properties`: `server.port=8081`
- Update frontend `API_BASE_URL` accordingly

### "Cannot connect to MySQL"
- Verify MySQL is running
- Check username/password in `application.properties`
- Ensure database exists or allow auto-creation

### "Cannot connect to MongoDB"
- Verify MongoDB service is running
- Check connection string in `application.properties`

## 💡 Simplified Testing Approach

**For immediate frontend testing:**

1. Open `hospital-management-frontend/index.html`
2. Enjoy the premium UI design
3. Note: Backend features won't work until services are running

**For full testing:**

1. Install all prerequisites (Java 17, Maven, MySQL, MongoDB)
2. Follow QUICKSTART.md
3. Run backend first, then open frontend

---

**Developer**: Rahul Singh Kushwaha  
**Status**: Awaiting prerequisites installation
