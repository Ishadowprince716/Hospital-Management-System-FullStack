# MediCare HMS (Production Stack)

MediCare HMS is a full-stack hospital management platform with:

- **Backend:** Spring Boot (Java 21), JWT auth, WebSocket signaling, MySQL/H2
- **Frontend:** React + TypeScript + Vite + Redux Toolkit
- **Telehealth:** Native HMS WebRTC rooms (doctor/patient username-password flow, no external Jitsi login)

---

## Monorepo Structure

```text
HMS/
├─ hospital-management-backend/   # Spring Boot API + WebSocket + DB
├─ hospital-management-react/     # Active React frontend
├─ hospital-management-frontend/  # Legacy frontend (not primary deploy target)
├─ Dockerfile                     # Railway production build (frontend + backend)
└─ railway.json                   # Railway deploy/healthcheck settings
```

---

## Local Development

### 1) Backend

```bash
cd hospital-management-backend
mvn spring-boot:run -Dspring-boot.run.profiles=test
```

Backend runs on `http://localhost:8080`.

### 2) Frontend

```bash
cd hospital-management-react
npm install
set VITE_API_ORIGIN=http://localhost:8080
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend runs on `http://127.0.0.1:5173`.

---

## Default Login Accounts

- Admin: `whoami` / `iamgroot`
- Doctor: `doctor1` / `doctor123`
- Patient: `patient1` / `patient123`

---

## Quality Checks

### Frontend

```bash
cd hospital-management-react
npm run lint
npm run test
npm run build
```

### Backend

```bash
cd hospital-management-backend
mvn verify
```

---

## Telehealth (WebRTC) Notes

- Signaling endpoint: `/app/telehealth.signal` via SockJS/STOMP (`/ws`)
- ICE config endpoint: `GET /api/telehealth/ice-config`
- For reliable mobile / cross-network calls, configure TURN in deploy env:
  - `TELEHEALTH_TURN_URL`
  - `TELEHEALTH_TURN_USERNAME`
  - `TELEHEALTH_TURN_PASSWORD`

---

## Production Deploy (Railway)

This repo deploys through the root `Dockerfile`:

1. Build React app
2. Copy frontend `dist` into backend static resources
3. Build Spring Boot jar
4. Run single production container

Health checks:

- App health: `/actuator/health`
- API info: `/api`
- readiness-style endpoint: `/ready`

---

## Environment Variables (Important)

At minimum for production:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`

Optional but recommended:

- `TELEHEALTH_TURN_URL`
- `TELEHEALTH_TURN_USERNAME`
- `TELEHEALTH_TURN_PASSWORD`
- `OPENAI_API_KEY` / `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`

---

## Canonical Project Docs

- [Developer Guide](/C:/Users/RAHUL%20KUSHWAH/OneDrive/Desktop/HMS/docs/DEVELOPER_GUIDE.md)
- [Operator Runbook](/C:/Users/RAHUL%20KUSHWAH/OneDrive/Desktop/HMS/docs/OPERATOR_RUNBOOK.md)

Older markdown files remain for reference, but the docs above are the current source of truth.
