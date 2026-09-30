# MediCare HMS – Enterprise Full-Stack Hospital Operating System

[![Tests: 44/44 Passed](https://img.shields.io/badge/Tests-44%2F44%20Passed%20(100%25)-success?style=for-the-badge&logo=checkmarx)](test-report.md)
[![Spring Boot: 3.2.4](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React: 19.2.0](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js: 3D WebGL](https://img.shields.io/badge/Three.js-WebGL%203D-cyan?style=for-the-badge&logo=threedotjs)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

MediCare HMS is a modern, enterprise-ready Hospital Management Operating System engineered with **Spring Boot 3 (Java 21)**, **React 19**, **Three.js / ThreeUI 3D WebGL visualizations**, **WebRTC Telehealth**, and **Google Gemini AI clinical triage**.

---

## 🌟 Modern UI/UX Highlights

- **Interactive 3D Wireframe Dotted Globe**: Fibonacci lattice with 1,200 particle points, glowing international hospital nodes (NYC, London, Tokyo, Singapore, Mumbai, Sydney), connecting flight arcs, and interactive mouse-drag rotation.
- **ThreeUI WebGL Ambient Layers**: High-performance, hardware-accelerated constellation particle networks and neural connectivity graphs.
- **Illuminated Bento Grid Layout**: Asymmetric card architecture with radial gradient border glow (`.bento-card`), interactive triage stratification, and real-time telemetry.
- **Anti-Slop Clinical Typography**: Strict typography hierarchy utilizing `Plus Jakarta Sans` / `Outfit` for display headings, `Inter` for clinical body, and `JetBrains Mono` for tabular metrics and telemetry.
- **Dynamic Doctor Weekday Availability**: Single-click weekday pills in doctor settings syncing directly to database JSON availability.

---

## 🏗️ Architecture & Tech Stack

```text
C:\Users\RAHUL KUSHWAH\OneDrive\Desktop\HMS
├── hospital-management-backend/   # Spring Boot 3.2.4 (Java 21, Hibernate 6, JWT, WebSocket STOMP)
├── hospital-management-react/     # Active React 19 Frontend (Vite 7, Tailwind v4, Three.js, Vitest)
├── hospital-management-frontend/  # Legacy static frontend archive
├── run-tests.ps1                 # Automated CI/CD test runner script (100% Pass Rate)
├── test-report.md                # Comprehensive verification report (44/44 Tests Passed)
├── start.bat                     # 1-Click Launch Script (Spring Boot + Vite)
├── stop.bat                      # Graceful shutdown script
├── docker-compose.yml            # Multi-container orchestration
└── Dockerfile                    # Single-container production build (Vite + Spring Boot)
```

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | Spring Boot 3.2.4, Java 21, Spring Security (JWT), Spring Data JPA, Hibernate 6, Lucene |
| **Frontend SPA** | React 19, TypeScript, Vite 7, Tailwind CSS v4, Redux Toolkit, Recharts, Lucide Icons |
| **3D & Visuals** | Three.js, `@designcodeio/threeui`, Custom Fibonacci Dotted Wireframe Globe |
| **Realtime & Video** | Native WebRTC Peer-to-Peer, SockJS / STOMP WebSocket signaling |
| **AI Intelligence** | Google Gemini 2.5 Flash / Pro clinical symptom triage and urgency calculation |
| **Testing** | JUnit 5, SpringBootTest, MockMvc, Vitest v8, JSDOM, Playwright E2E |

---

## ⚡ Quick Start (Local Development)

### 1-Click Automated Startup (Windows)
Double-click [`start.bat`](start.bat) or run from PowerShell:
```powershell
.\start.bat
```
This automatically boots:
- Spring Boot Backend on **`http://localhost:8080`**
- React 19 Frontend on **`http://localhost:5173`**

To stop all services cleanly:
```powershell
.\stop.bat
```

---

### Manual Startup

#### 1) Spring Boot Backend
```powershell
cd hospital-management-backend
mvn spring-boot:run
```
*Health probe:* `http://localhost:8080/ready`

#### 2) React Frontend
```powershell
cd hospital-management-react
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
*Application URL:* `http://localhost:5173`

---

## 🔑 Pre-Configured Test Credentials

| Role | Username | Password | Direct Portal |
| :--- | :--- | :--- | :--- |
| **Doctor** | `doctor1` | `doctor123` | [http://localhost:5173/doctor](http://localhost:5173/doctor) |
| **Patient** | `patient1` | `patient123` | [http://localhost:5173/patient](http://localhost:5173/patient) |
| **Administrator** | `whoami` | `iamgroot` | [http://localhost:5173/admin](http://localhost:5173/admin) |

---

## 🧪 Comprehensive Automated Test Suite

Run the full end-to-end test suite anytime:
```powershell
powershell -ExecutionPolicy Bypass -File .\run-tests.ps1
```

### Verified Test Results (100% Pass Rate):
- **Backend JUnit 5 Tests (`mvn test`)**: 15/15 Passed
  - `AppointmentControllerTest` (5 tests)
  - `PaymentControllerTest` (2 tests)
  - `SecurityIntegrationTest` (3 tests)
  - `TelehealthControllerIntegrationTest` (2 tests)
  - `TelehealthSignalControllerTest` (2 tests)
  - `StripeServiceTest` (1 test)
- **Frontend Vitest Suite (`npm test`)**: 20/20 Passed (100% statement coverage)
  - `src/api.test.ts` (10 tests)
  - `src/formatDays.test.ts` (10 tests)
- **Live End-to-End API Verifications**: 9/9 Passed
  - Backend readiness probe (`/ready`)
  - Admin, Doctor, and Patient authentication
  - Negative auth & unauthenticated access prevention
  - Dynamic registration & login lifecycle
  - Clinical roster queries
  - Frontend SPA asset delivery

Detailed test diagnostics, stack traces, and root-cause analyses are documented in [`test-report.md`](test-report.md).

---

## 🚀 Production Deployment (Docker & Railway)

The root [`Dockerfile`](Dockerfile) builds the complete production bundle:
1. Compiles React 19 frontend into static assets (`npm run build`).
2. Copies bundled assets into Spring Boot's `src/main/resources/static`.
3. Compiles Spring Boot backend into an optimized executable JAR.
4. Exposes unified HTTP port `8080` for single-container hosting.

```bash
docker build -t medicare-hms:latest .
docker run -p 8080:8080 medicare-hms:latest
```

---

## 👨‍💻 Developer & Author

- **Lead Architect & Engineer**: Rahul Singh Kushwah
- **GitHub**: [@Ishadowprince716](https://github.com/Ishadowprince716)
- **LinkedIn**: [Rahul Singh Kushwah](https://www.linkedin.com/in/rahul-singh-kushwah-233b36283)
- **Email**: `patelmrrahul199@gmail.com`
