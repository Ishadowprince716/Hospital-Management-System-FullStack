# Hospital Appointment & Patient Record Management System

A comprehensive, full-stack web application designed to streamline hospital operations, manage patient records, and facilitate appointment scheduling.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Features

### 👨‍⚕️ For Doctors
- **Dedicated Dashboard**: View upcoming appointments and patient history.
- **Patient Management**: Access digitally stored patient records securely.
- **Appointment Handling**: Approve, reschedule, or cancel appointments.

### 🏥 For Patients
- **Easy Registration**: Immediate account activation (No OTP required).
- **Appointment Booking**: Book appointments with specific doctors.
- **Medical History**: View personal medical records and prescriptions.

### 🛡️ For Admins
- **Secure Access**: Specific `whoami` admin account for enhanced security.
- **Doctor Approval**: Verify and approve new doctor registrations.
- **System Oversight**: Monitor system activity and user management.

## 🛠️ Technology Stack

- **Backend**: Java Spring Boot
- **Database**: MySQL (Hibernate/JPA)
- **Security**: Spring Security, JWT (JSON Web Tokens), BCrypt encryption
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Modern Glassmorphism UI)
- **Build Tool**: Maven

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/lshadowprince716/Hospital-Management-System-FullStack.git
    cd Hospital-Management-System-FullStack
    ```

2.  **Backend Setup**
    - Configure `application.properties` with your MySQL database credentials.
    - Run the application:
      ```bash
      cd hospital-management-backend
      mvn spring-boot:run
      ```

3.  **Frontend Setup**
    - Open `hospital-management-frontend/index.html` in your browser.
    - Or use Live Server in VS Code.

## 🔐 Default Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `whoami` | `iamgroot` |
| **Doctor** | `doctor1` | `doctor123` |
| **Patient** | `patient1` | `patient123` |

## 🤝 Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
