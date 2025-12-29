# Hospital Appointment & Patient Record Management System

## 🏥 Overview
A comprehensive full-stack hospital management system built by **Rahul Singh Kushwaha** (Senior Web Developer). This system features three role-based portals for Patients, Doctors, and Admins.

## 🚀 Features

### Patient Portal (16+ Features)
- ✅ User authentication with JWT
- ✅ View medical dashboard
- ✅ Book appointments with doctors
- ✅ View appointment history
- ✅ Access medical records
- ✅ Billing and payment management
- ✅ Messaging system
- ✅ Update profile information

### Doctor Panel (14+ Features)
- ✅ Doctor dashboard with statistics
- ✅ View and manage schedule
- ✅ View all appointments
- ✅ Manage patient list
- ✅ Create prescriptions
- ✅ View performance metrics
- ✅ Patient medical records access

### Admin Dashboard (12+ Features)
- ✅ System analytics and overview
- ✅ User management (Patients, Doctors, Staff)
- ✅ Appointment oversight
- ✅ Revenue reports
- ✅ System configuration
- ✅ Monitor system health

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **ORM**: Hibernate (JPA)
- **Databases**: 
  - MySQL 8.x (Relational data)
  - MongoDB (Medical records & documents)
- **Security**: Spring Security + JWT
- **Build Tool**: Maven

### Frontend
- **Structure**: HTML5
- **Styling**: CSS3 (Vanilla CSS with modern design)
- **Scripting**: Vanilla JavaScript
- **Design**: Glassmorphism, Gradients, Animations
- **Icons**: Font Awesome 6.5.1
- **Fonts**: Google Fonts (Inter, Poppins)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Java JDK 17 or higher
- Maven 3.6+
- MySQL 8.0+
- MongoDB 6.0+
- A modern web browser (Chrome, Firefox, Edge)

## ⚙️ Installation & Setup

### 1. Database Setup

#### MySQL
```sql
# Create database (or let Spring Boot auto-create)
CREATE DATABASE hospital_db;

# Update credentials in application.properties if needed
# Default: root/root
```

#### MongoDB
```bash
# Ensure MongoDB is running on localhost:27017
# Database 'hospital_records' will be created automatically
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd hospital-management-backend

# Install dependencies and build
mvn clean install

# Run the application
mvn spring-boot:run

# Backend will start at: http://localhost:8080/api
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd hospital-management-frontend

# Open index.html in your browser
# Or use a simple HTTP server:
# Python 3:
python -m http.server 8000

# Node.js:
npx serve .

# Access at: http://localhost:8000
```

## 🔐 Default Test Credentials

### Patient Login
- **Username**: `patient1`
- **Password**: `patient123`

### Doctor Login
- **Username**: `doctor1`
- **Password**: `doctor123`
- **Profile**: Dr. Rahul Singh Kushwaha - General Physician

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`

## 📁 Project Structure

```
hospital-management-system/
├── hospital-management-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hospital/
│   │   │   │   ├── config/          # Security, JWT config
│   │   │   │   ├── controller/      # REST Controllers
│   │   │   │   ├── model/           # JPA Entities
│   │   │   │   ├── document/        # MongoDB Documents
│   │   │   │   ├── repository/      # JPA & MongoDB Repos
│   │   │   │   ├── service/         # Business Logic
│   │   │   │   └── dto/             # Data Transfer Objects
│   │   │   └── resources/
│   │   │       └── application.properties
│   └── pom.xml
│
└── hospital-management-frontend/
    ├── index.html                    # Login Page
    ├── patient-dashboard.html        # Patient Portal
    ├── doctor-dashboard.html         # Doctor Panel
    ├── admin-dashboard.html          # Admin Dashboard
    ├── css/
    │   ├── style.css                 # Login page styles
    │   └── dashboard.css             # Dashboard styles
    └── js/
        ├── auth.js                   # Authentication logic
        ├── patient-dashboard.js      # Patient features
        ├── doctor-dashboard.js       # Doctor features
        └── admin-dashboard.js        # Admin features
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/initialize` - Initialize default users

### Doctors
- `GET /api/doctors/list` - Get all active doctors
- `GET /api/doctors/{id}` - Get doctor by ID
- `GET /api/doctors/specialization/{spec}` - Get doctors by specialization

### Appointments
- `POST /api/appointments/book` - Book new appointment
- `GET /api/appointments/patient/{id}` - Get patient appointments
- `GET /api/appointments/doctor/{id}` - Get doctor appointments
- `PUT /api/appointments/{id}/cancel` - Cancel appointment
- `GET /api/appointments/all` - Get all appointments (Admin)

## 🎨 Design Features

### Premium UI/UX
- **Glassmorphism effects** for modern look
- **Animated gradient backgrounds** with floating blobs
- **Smooth transitions** and hover effects
- **Responsive design** for all screen sizes
- **Role-based color theming**
- **Toast notifications** for user feedback

### Color Palette
- Primary: #6366f1 (Indigo)
- Secondary: #06b6d4 (Cyan)
- Accent: #ec4899 (Pink), #a855f7 (Purple)
- Success: #10b981 (Green)
- Error: #ef4444 (Red)

## 🔒 Security Features
- JWT-based authentication
- Password encryption with BCrypt
- Role-based access control (RBAC)
- CORS configuration
- Session management

## 📊 Database Schema

### MySQL Tables (Hibernate Auto-Generated)
- `users` - Base user information
- `patients` - Patient-specific details
- `doctors` - Doctor-specific details
- `appointments` - Appointment bookings
- `billing` - Payment records

### MongoDB Collections
- `medical_records` - Patient medical history, prescriptions, lab results

## 🚧 Known Limitations
- Medical records feature (basic implementation)
- Billing system (basic implementation)
- Messaging system (basic implementation)
- File upload for medical documents
- Real-time notifications

## 🔮 Future Enhancements
- Real-time chat system
- Video consultation integration
- Email notifications
- Payment gateway integration
- Mobile application
- Advanced analytics and reporting
- Lab results integration
- Prescription management system

## 👨‍💻 Developer

**Rahul Singh Kushwah**
- Role: Senior Web Developer
- Email: Contact through project

## 📝 License
This project is created for educational and portfolio purposes.

## 🙏 Acknowledgments
- Spring Boot Team
- MongoDB Team
- Font Awesome
- Google Fonts

---

**Made with ❤️ by Rahul Singh Kushwaha**
