# MediPulse Frontend

The frontend contains three role-based portals sharing one API configuration and authentication/session layer.

## Structure

- `index.html` — MediPulse portal hub.
- `patient/` — patient login, registration, dashboard, profile, appointments and records.
- `doctor/` — doctor login, dashboard and authorized clinical workflows.
- `admin/` — administrator dashboard and management tools.
- `shared/config.js` — single `API_BASE_URL` definition.
- `shared/auth.js` — common JWT, role guard, refresh-token and 401 handling.
- `assets/` — shared MediPulse logo, authentication theme, portal theme and toast utility.

## Running

Use VS Code Live Server or another static HTTP server. The default backend URL is `http://localhost:8080/api` and the usual frontend origin is `http://localhost:5500`.

Do not open the HTML files directly with `file://`; the portals are intended to run from an HTTP server so API requests and relative assets work consistently.

## Design rules

- Authentication pages share one dark-background design based on the Doctor Login reference.
- Patient and Doctor logged-in portals use a fixed light-blue/white theme and a left navigation bar.
- Patient and Doctor theme switches are intentionally removed.
- Admin also uses the unified light visual system and no theme switcher.
- Logout is red and remains visible.
- The MediPulse logo is shared from `assets/medipulse-logo.png`.
