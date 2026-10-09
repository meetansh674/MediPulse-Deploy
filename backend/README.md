# MediPulse Backend

## Requirements
- Java 21
- MySQL 8
- Maven (or `mvnw`)

## Database
Create a database named `medipulse`. Configure `DB_URL`, `DB_USERNAME` and `DB_PASSWORD` as needed.

## Required environment variables
- `JWT_SECRET` — required, at least 32 bytes; no fallback secret is provided.
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` — database settings.
- `CORS_ALLOWED_ORIGINS` — comma-separated frontend origins.
- `JWT_EXPIRATION_MS` — optional, defaults to 1 hour.
- `JWT_REFRESH_EXPIRATION_MS` — optional, defaults to 7 days.
- `DDL_AUTO` — optional, defaults to `update`; use `validate` for deployment.
- `SHOW_SQL` — optional, defaults to `false`.

## Run
Set `JWT_SECRET` and start Spring Boot on port 8080. The frontend can then run from Live Server on port 5500.

## API highlights
Authentication: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`
Login protection: five failed attempts per email/IP key within a five-minute window trigger a temporary block.
Current user: `/api/me`, `/api/users/me`, `/api/users/me/password`
Appointments: `/api/appointments`
Alerts: `/api/alerts/patient/{id}`, `/api/alerts/{id}`
Health readings: `/api/health-readings`
Doctor patients: `/api/doctors/patients`
Admin users: `/api/users`, `/api/users/{id}/status`, `/api/users/{id}`

Swagger/OpenAPI is exposed by springdoc at `/swagger-ui.html` and `/v3/api-docs`.

## Demo accounts
The initializer maintains demo accounts for local demonstration. Change their passwords before any non-local deployment.
