# MediPulse

MediPulse is a multi-role healthcare management and monitoring platform with a Spring Boot + MySQL REST backend and three static frontend portals: Patient, Doctor and Admin.

## Project structure

- `backend/` — Spring Boot 4 + Java 21 REST API, Spring Security/JWT, JPA and MySQL.
- `frontend/` — static HTML/CSS/JavaScript portals.
  - `patient/` — patient login, registration, dashboard and health records.
  - `doctor/` — doctor login and clinical workflow.
  - `admin/` — administration, doctors, patients, appointments, monitoring and alerts.
  - `shared/` — common API configuration and authentication/session handling.
  - `assets/` — shared MediPulse branding, theme and toast styles.

## Backend setup

1. Install Java 21 and MySQL 8.
2. Create the database:

```sql
CREATE DATABASE medipulse;
```

3. Copy `backend/src/main/resources/application.properties.example` to `application.properties` if needed.
4. Set environment variables before starting the backend:

- `JWT_SECRET` — required; use a random secret of at least 32 bytes.
- `DB_URL` — defaults to `jdbc:mysql://localhost:3306/medipulse`.
- `DB_USERNAME` — defaults to `root`.
- `DB_PASSWORD` — your MySQL password.
- `CORS_ALLOWED_ORIGINS` — comma-separated frontend origins, normally `http://localhost:5500,http://127.0.0.1:5500`.
- `DDL_AUTO` — `update` for local development; use `validate` for a deployment with managed schema migrations.
- `SHOW_SQL` — `false` by default.

5. Start the backend on port 8080:

```text
backend/mvnw.cmd spring-boot:run
```

or run `run-backend.bat` from the project root on Windows.

Swagger UI is available at `/swagger-ui/index.html` when the backend is running.

## Frontend setup

Run the frontend through VS Code Live Server or another static HTTP server. The default configuration expects:

```text
http://localhost:5500
```

The shared API URL is defined only once in `frontend/shared/config.js`.

Run `run-frontend.bat` from the project root on Windows, or open `frontend/index.html` through Live Server.

## Demo accounts

The development data initializer creates/refreshes these accounts:

- Admin: `admin@medipulse.com`
- Doctor: `doctor@medipulse.com`
- Patient: `patient@medipulse.com`

Passwords are defined by the development data initializer and should be changed for any non-demo deployment.

## Main API groups

- `/api/auth` — registration, login and refresh token.
- `/api/me` and `/api/users/me` — authenticated user/profile operations.
- `/api/doctors` — doctors and authorized-patient workflow.
- `/api/patients` — patient profile access with role guards.
- `/api/appointments` — appointment creation, rescheduling, cancellation and status management.
- `/api/health-readings` — health readings, validation and automatic alerts.
- `/api/alerts` — patient alerts and doctor/admin resolution.
- `/api/medical-records`, `/api/prescriptions`, `/api/lab-reports` — clinical records.
- `/api/admin` — administrator operations and statistics.

## Security and UX rules

- JWT access tokens require `JWT_SECRET`; no fallback secret is committed.
- Refresh tokens provide silent renewal for the frontend.
- Failed login attempts are rate-limited for a short window.
- Patient and doctor portals use a fixed light-blue/white theme with no theme switcher.
- Authentication pages use a shared dark background and common MediPulse login design.
- Logout is consistently red and visible.
- Patient and doctor pages use role guards and shared 401 handling.
- Appointment dates cannot be in the past and a doctor cannot be double-booked at the same time.
- Cancellation keeps appointment history by setting `CANCELLED`.
- Health readings are numeric and validated by reading type; abnormal values create alerts automatically.
