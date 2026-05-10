# 🚀 HMS Enterprise Deployment Guide

This project has been upgraded to a professional, cloud-ready architecture. You can now deploy the entire system (Frontend, Backend, and Database) with a single command.

## 🛠️ Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

## ⚡ Quick Start
Open your terminal in the project root and run:

```bash
docker-compose up --build
```

## 🏗️ What happens under the hood?
The system uses a **Multi-Stage Docker Architecture**:
1.  **Frontend Build**: Node.js compiles your React/Tailwind code into optimized production chunks.
2.  **Backend Build**: Amazon Corretto (Java 21) & Maven compile your Spring Boot API.
3.  **Deployment Injection**: The optimized frontend is automatically injected into the backend's static folder.
4.  **Final Image**: A secure, minimal Alpine Linux image is created containing ONLY the necessary files to run the app.
5.  **Database**: A MySQL 8.0 container is automatically provisioned and health-checked.

## 🌐 Accessing the System
- **Frontend & API**: [http://localhost:8080](http://localhost:8080) (The single JAR serves both)
- **API Documentation**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Database**: localhost:3306 (user: root, pass: root)

## 🎖️ Professional Features Active
- **Zero-Downtime Ready**: Multi-instance compatible.
- **Security Hardened**: Non-root user execution in containers.
- **Optimized**: Multi-chunk frontend loading and JPA caching.
