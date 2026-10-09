# MediPulse deployment guide

## 1. Environment variables (backend)

| Variable | Required | Example |
|---|---|---|
| `JWT_SECRET` | Yes — random 32+ chars | `openssl rand -base64 48` |
| `DB_URL` | No (default local) | `jdbc:mysql://db:3306/medipulse` |
| `DB_USERNAME` | No | `medipulse` (dedicated user, not root) |
| `DB_PASSWORD` | Yes | — |
| `CORS_ALLOWED_ORIGINS` | Yes | `https://app.example.com` |
| `UPLOAD_DIR` | No | `/data/lab-reports` (persistent volume) |
| `DEMO_DATA_ENABLED` | No (`true` local, forced `false` in prod) | `false` |
| `ALERT_MAIL_ENABLED` | No | `false` (log-only) — set `true` + SMTP below to email doctors on ATTENTION alerts |
| `SMTP_HOST` / `SMTP_PORT` | Only if mail on | e.g. `smtp.gmail.com` / `587` |
| `SMTP_SSL` / `SMTP_STARTTLS` | No | `false` / `true` (use `SMTP_SSL=true`, port `465` for implicit SSL) |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | Only if mail on | SMTP credentials (e.g. Gmail app password) |
| `ALERT_MAIL_FROM` | No | `MediPulse <noreply@example.com>` |
| `ALERT_MAIL_COOLDOWN_MINUTES` | No | `60` (one mail per patient per hour max) |
| `SPRING_PROFILES_ACTIVE` | Yes in prod | `prod` |
| `SERVER_PORT` | No | `8080` |
| `DDL_AUTO` / `SHOW_SQL` | No (prod forces `validate`, no SQL) | — |

Copy-paste starter (do NOT commit real values):

```bash
export SPRING_PROFILES_ACTIVE=prod
export JWT_SECRET="$(openssl rand -base64 48)"
export DB_URL="jdbc:mysql://db:3306/medipulse"
export DB_USERNAME="medipulse"
export DB_PASSWORD="..."
export CORS_ALLOWED_ORIGINS="https://app.example.com"
export UPLOAD_DIR="/data/lab-reports"
```

## 2. Database

- Prod uses the `prod` profile: `ddl-auto=validate` + Flyway.
- Baseline schema: `backend/src/main/resources/db/migration/V1__baseline.sql`.
- Every schema change = new `V2__...`, `V3__...` file. Never edit V1 after it has run anywhere.
- Existing database that predates Flyway: `flyway baseline` once, then migrate normally.
- Back up MySQL before each deploy. Uploads live under `UPLOAD_DIR` — back that up too (or move to object storage later).

## 3. Backend (Docker)
```bash
docker build -t medipulse-backend ./backend
docker run -d -p 8080:8080 --env-file .env \
  -e SPRING_PROFILES_ACTIVE=prod \
  -v medipulse-uploads:/data/lab-reports \
  medipulse-backend
```

Health check: `GET /v3/api-docs` is disabled in prod; verify login via `POST /api/auth/login`.

## 4. Frontend (static)

No build step. Easiest path: change the **one fallback line** in
`frontend/shared/config.js` to your deployed API URL, then upload:

```js
// before:
"http://localhost:8080/api"
// after:
"https://<your-backend>.railway.app/api"
```

(Alternative without editing: define `window.MediPulseConfig = { API_BASE_URL: "..." }`
in a `<script>` tag before `shared/config.js` loads on each page.)
Host the contents of `frontend/` on Netlify Drop / Vercel / any static host over HTTPS.

## 5. Go-live checklist

- [ ] Strong `JWT_SECRET`, dedicated DB user, real admin passwords (no `Admin@123`).
- [ ] `SPRING_PROFILES_ACTIVE=prod` set (validates schema, disables Swagger).
- [ ] CORS + API URL point at the real HTTPS domains.
- [ ] `UPLOAD_DIR` on a persistent volume + backup job.
- [ ] MySQL backup job + Flyway history table (`flyway_schema_history`) present.
- [ ] No `*.env`/secret files committed.
