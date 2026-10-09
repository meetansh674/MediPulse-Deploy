# MediPulse Doctor Portal

The Doctor portal uses the shared MediPulse authentication/configuration helpers and the Spring Boot backend.

## Run
- Start MySQL 8.
- Set `JWT_SECRET` and start the backend on port 8080.
- Serve `frontend/` with Live Server (port 5500 by default).
- Open `doctor/index.html`.

## Workflows
- JWT login with Doctor role guard and centralized 401 handling
- Dashboard and doctor profile
- Authorized patient list
- Appointment status management
- Medical records, prescriptions and lab reports
- Health history, health-reading entry and automatic monitoring alerts
- Alert resolve/acknowledge action

The portal keeps its left-side navigation and existing page layout while sharing the common MediPulse visual system.
