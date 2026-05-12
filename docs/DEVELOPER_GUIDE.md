# Developer Guide (MediCare HMS)

## Tech Stack

- Frontend: React 19, TypeScript, Redux Toolkit, RTK Query, Vite
- Backend: Spring Boot 3, Spring Security, JPA, WebSocket, Flyway
- Database: MySQL in production, H2 for local tests/dev

---

## Setup

### Backend

```bash
cd hospital-management-backend
mvn spring-boot:run -Dspring-boot.run.profiles=test
```

### Frontend

```bash
cd hospital-management-react
npm install
set VITE_API_ORIGIN=http://localhost:8080
npm run dev -- --host 127.0.0.1 --port 5173
```

---

## Test Commands

### Frontend

```bash
npm run lint
npm run test
npm run build
```

### Backend

```bash
mvn verify
```

---

## Telehealth Development Notes

- Room route: `/telehealth/:appointmentId`
- Signaling messages: `join`, `leave`, `offer`, `answer`, `candidate`, `renegotiate`, `end`
- API ICE config: `/api/telehealth/ice-config`
- TURN support comes from:
  - `TELEHEALTH_TURN_URL`
  - `TELEHEALTH_TURN_USERNAME`
  - `TELEHEALTH_TURN_PASSWORD`

---

## API Envelope Contract

All standard API responses use:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "error": {
    "code": "SOME_CODE",
    "details": "Context"
  },
  "requestId": "uuid-or-n/a",
  "timestamp": "2026-05-12T12:34:56.789"
}
```

---

## Coding Guidelines Used in This Repo

- Keep UI role flows explicit (Patient / Doctor / Admin)
- Use RTK Query slices for API integration
- Use `ApiResponse` envelope for backend endpoints
- Add tests for auth, telehealth, and error paths for every major feature update
