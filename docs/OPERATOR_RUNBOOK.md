# Operator Runbook (MediCare HMS)

## Deployment Target

- Platform: Railway
- Build method: root `Dockerfile`
- Container health endpoint: `/actuator/health`

---

## Required Environment Variables

### Core

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS`

### Recommended for Telehealth Reliability

- `TELEHEALTH_TURN_URL`
- `TELEHEALTH_TURN_USERNAME`
- `TELEHEALTH_TURN_PASSWORD`

---

## Startup/Runtime Profile

- `SPRING_PROFILES_ACTIVE=prod`
- `SPRING_FLYWAY_ENABLED=true`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=validate`
- `SPRING_SQL_INIT_MODE=never`

---

## Health Checks

- Quick API check: `GET /api`
- Health status: `GET /actuator/health`
- Readiness hint: `GET /ready`

Expected result:

- HTTP 200
- `status=UP` from actuator

---

## Telehealth Troubleshooting

If doctor/patient stay on “Waiting for participant”:

1. Confirm both opened the same `/telehealth/{appointmentId}`.
2. Check WebSocket path `/ws` is reachable.
3. Verify both browsers granted camera + mic permissions.
4. If cross-network/mobile fails, configure TURN env vars.
5. Confirm `/api/telehealth/ice-config` includes `turnConfigured: true`.

---

## Incident Response Checklist

1. Capture `requestId` from client or API response.
2. Review backend logs for that requestId.
3. Validate database connectivity.
4. Validate auth (`/api/auth/login`) and telehealth signaling path.
5. Re-run smoke test:
   - `/`
   - `/login`
   - `/register`
   - telehealth join from doctor + patient
