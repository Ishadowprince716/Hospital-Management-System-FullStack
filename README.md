# Hospital Appointment & Patient Record Management System

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Java](https://img.shields.io/badge/Java-Spring%20Boot-orange)
![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow)
![Database](https://img.shields.io/badge/Database-MySQL-blue)

*A comprehensive, full-stack hospital management solution designed to streamline appointments, patient records, and doctor workflows.*

[Features](#features) • [Tech Stack](#-technology-stack) • [Installation](#%EF%B8%8F-installation--setup) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contribution)

</div>

---

## 📋 Overview

The Hospital Appointment & Patient Record Management System is a modern, full-stack web application built with **Spring Boot** backend and **Vanilla JavaScript** frontend. It provides a seamless experience for managing hospital operations including patient registration, appointment scheduling, medical records, and doctor management.

### Key Highlights
- ✅ Role-based access control (Admin, Doctor, Patient)
- 🔐 Secure authentication with JWT tokens & BCrypt encryption
- 📱 Responsive, modern UI with Glassmorphism design
- ⚡ Spring Security integration for comprehensive security
- 💾 MySQL database with Hibernate/JPA ORM

---

## 🚀 Features

### 👨‍⚕️ For Doctors
- **Dedicated Dashboard**: View upcoming appointments and comprehensive patient history
- **Patient Management**: Access digitally stored patient records securely and efficiently
- **Appointment Handling**: Approve, reschedule, or cancel appointments with ease
- **Medical Records**: Review and update patient medical history and prescriptions

### 🏥 For Patients
- **Easy Registration**: Immediate account activation without OTP requirement
- **Appointment Booking**: Schedule appointments with specific doctors at preferred times
- **Medical History**: View personal medical records, prescriptions, and previous appointments
- **User Dashboard**: Track appointment status and medical information

### 🛡️ For Admins
- **Secure Access**: Dedicated admin credentials with enhanced security measures
- **Doctor Approval**: Verify and approve new doctor registrations
- **User Management**: Manage patients, doctors, and system users
- **System Oversight**: Monitor system activity, logs, and user actions

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Java Spring Boot (REST API)
- **Security**: Spring Security, JWT (JSON Web Tokens), BCrypt password encryption
- **Database**: MySQL with Hibernate/JPA ORM
- **Build Tool**: Maven
- **API**: RESTful architecture

### Frontend
- **Languages**: Vanilla JavaScript, HTML5, CSS3
- **Design**: Modern Glassmorphism UI
- **Server**: Live Server / HTTP Server

### Database
- **DBMS**: MySQL
- **ORM**: Hibernate/JPA
- **Connection Pooling**: HikariCP

---

## ⚙️ Installation & Setup

### Prerequisites
- Java 11 or higher
- MySQL 8.0+
- Maven 3.6+
- Node.js (for Live Server) or any HTTP server
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ishadowprince716/Hospital-Management-System-FullStack.git
cd Hospital-Management-System-FullStack
```

### Step 2: Backend Setup

1. **Configure Database**
   ```bash
   cd hospital-management-backend
   ```
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/hospital_db
   spring.datasource.username=root
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

2. **Install Dependencies & Run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`

### Step 3: Frontend Setup

1. **Open Frontend Directory**
   ```bash
   cd ../hospital-management-frontend
   ```

2. **Start the Application**
   - **Option A**: Using Live Server (VS Code)
     - Install Live Server extension
     - Right-click on `index.html` → "Open with Live Server"
   
   - **Option B**: Using Python HTTP Server
     ```bash
     python -m http.server 5500
     ```
   
   - **Option C**: Using Node.js
     ```bash
     npx http-server
     ```

3. **Access the Application**
   - Open browser and navigate to `http://localhost:5500` (or your server port)

---

## 🔐 Default Credentials

Use these credentials to test different user roles:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `whoami` | `iamgroot` |
| **Doctor** | `doctor1` | `doctor123` |
| **Patient** | `patient1` | `patient123` |

⚠️ **Note**: Change these credentials in production!

---

## 🚀 Quick Start

1. **Backend Running**: Verify backend is running on port 8080
2. **Frontend Running**: Start the frontend server
3. **Login**: Use the default credentials above
4. **Explore**:
   - **Admin**: Approve doctors, manage users
   - **Doctor**: View appointments, manage patient records
   - **Patient**: Book appointments, view medical history

---

## 📁 Project Structure

```
Hospital-Management-System-FullStack/
├── hospital-management-backend/      # Spring Boot REST API
│   ├── src/main/java/
│   │   ├── controller/              # REST endpoints
│   │   ├── service/                 # Business logic
│   │   ├── repository/              # Data access layer
│   │   ├── model/                   # Entity classes
│   │   └── config/                  # Security & app config
│   └── resources/
│       └── application.properties    # Database config
│
├── hospital-management-frontend/     # Vanilla JS Frontend
│   ├── index.html                   # Main page
│   ├── css/                         # Styling (Glassmorphism)
│   ├── js/                          # Client-side logic
│   └── assets/                      # Images & icons
│
└── Documentation/
    ├── QUICKSTART.md
    ├── TESTING.md
    └── API-DOCUMENTATION.md
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/{id}` - Get patient details
- `PUT /api/patients/{id}` - Update patient info

### Doctors
- `GET /api/doctors` - List all doctors
- `POST /api/doctors` - Register doctor
- `PUT /api/doctors/{id}/approve` - Approve doctor

For detailed API documentation, see [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)

---

## 🧪 Testing

### Running Tests
```bash
cd hospital-management-backend
mvn test
```

### Manual Testing
1. Refer to [TESTING.md](./TESTING.md) for comprehensive test scenarios
2. Use Postman/Insomnia for API testing
3. Test all CRUD operations for each entity

---

## 🔒 Security Features

- **JWT Authentication**: Stateless, secure token-based authentication
- **Password Encryption**: BCrypt for password hashing
- **Spring Security**: Role-based access control (RBAC)
- **CORS Configuration**: Secure cross-origin requests
- **SQL Injection Prevention**: JPA parameterized queries
- **XSS Protection**: Input validation and output encoding

---

## 📚 Documentation

Detailed documentation files are available:

- [QUICKSTART.md](./QUICKSTART.md) - Get running in 5 minutes
- [TESTING.md](./TESTING.md) - Complete test scenarios
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Architecture overview
- [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - Complete API reference
- [TROUBLESHOOTING.md](./LOGIN-TROUBLESHOOTING.md) - Common issues & solutions

---

## 🐛 Troubleshooting

### Backend Won't Start
- Verify MySQL is running: `mysql --version`
- Check database connection in `application.properties`
- Ensure port 8080 is not in use: `netstat -ano | findstr :8080`

### Frontend Can't Connect to Backend
- Verify backend is running on port 8080
- Check CORS configuration in Spring Security config
- Verify API endpoint URLs in frontend JavaScript files

### Database Connection Failed
- MySQL credentials must match `application.properties`
- Database `hospital_db` must exist
- User must have appropriate permissions

For more help, see [LOGIN-TROUBLESHOOTING.md](./LOGIN-TROUBLESHOOTING.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Hospital-Management-System-FullStack.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Commit your changes**
   ```bash
   git commit -m "Add: Description of your changes"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/YourFeatureName
   ```

5. **Submit a Pull Request**
   - Describe changes clearly
   - Reference related issues

### Contribution Guidelines
- Follow Java naming conventions
- Write clean, documented code
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Ishadowprince716

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
```

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Ishadowprince716/Hospital-Management-System-FullStack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ishadowprince716/Hospital-Management-System-FullStack/discussions)
- **Email**: [Contact Me](mailto:your-email@example.com)

---

## 🙏 Acknowledgments

- Spring Boot community for excellent framework
- MySQL documentation
- Hibernate/JPA for ORM capabilities
- Open-source contributors

---

<div align="center">

**[⬆ back to top](#hospital-appointment--patient-record-management-system)**

Made with ❤️ by [Ishadowprince716](https://github.com/Ishadowprince716)

</div>
