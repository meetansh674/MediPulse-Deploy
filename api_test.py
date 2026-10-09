
"""MediPulse live API test suite - exercises every backend endpoint across all roles."""
import json
import time
import urllib.request
import urllib.error

BASE = "http://localhost:8080/api"
RESULTS = []


def req(method, path, body=None, token=None, query="", origin=None, raw_query=False):
    url = BASE + path + (("?" + query) if query else "")
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        r.add_header("Content-Type", "application/json")
    if token:
        r.add_header("Authorization", f"Bearer {token}")
    if origin:
        r.add_header("Origin", origin)
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            raw = resp.read().decode()
            hdrs = dict(resp.headers)
            try:
                parsed = json.loads(raw) if raw else None
            except Exception:
                parsed = raw
            return resp.status, parsed, hdrs
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            parsed = json.loads(raw) if raw else None
        except Exception:
            parsed = raw
        return e.code, parsed, dict(e.headers)
    except Exception as e:
        return -1, str(e), {}


def check(name, cond, detail=""):
    RESULTS.append(("PASS" if cond else "FAIL", name, str(detail)[:160]))
    print(("  ok   " if cond else "  FAIL ") + name + (" | " + str(detail)[:140] if detail else ""))


def sec(title):
    print(f"\n=== {title} ===")


TS = str(int(time.time()) % 100000000)


sec("1. AUTH: login / register / refresh / rate limit")

st, admin, _ = req("POST", "/auth/login", {"email": "admin@medipulse.com", "password": "Admin@123"})
check("admin login", st == 200 and admin.get("token") and admin.get("refreshToken") and admin["user"]["role"] == "ADMIN", f"status={st}")
ADMIN_T = admin["token"]; ADMIN_R = admin["refreshToken"]; ADMIN_ID = admin["user"]["userId"]

st, doctor, _ = req("POST", "/auth/login", {"email": "doctor@medipulse.com", "password": "Doctor@123"})
check("doctor login", st == 200 and doctor.get("token") and doctor["user"]["role"] == "DOCTOR", f"status={st}")
DOC_T = doctor["token"]; DOC_ID = doctor["user"]["userId"]

st, patient, _ = req("POST", "/auth/login", {"email": "patient@medipulse.com", "password": "Patient@123"})
check("patient login", st == 200 and patient.get("token") and patient["user"]["role"] == "PATIENT", f"status={st}")
PAT_T = patient["token"]; PAT_ID = patient["user"]["userId"]

st, body, _ = req("POST", "/auth/login", {"email": "admin@medipulse.com", "password": "wrong"})
check("wrong password -> 401", st == 401, f"status={st} msg={body.get('message') if isinstance(body, dict) else body}")

st, body, _ = req("POST", "/auth/login", {"email": "nobody@medipulse.com", "password": "x"})
check("unknown email -> 401", st == 401, f"status={st}")


EMAIL_A = f"apitest{TS}@medipulse.com"
st, regA, _ = req("POST", "/auth/register", {"name": "API Test A", "email": EMAIL_A, "password": "Test@1234", "phone": "9000000001"})
check("register new patient", st == 201 and regA.get("userId"), f"status={st}")
A_ID = regA.get("userId")

st, dup, _ = req("POST", "/auth/register", {"name": "Dup", "email": EMAIL_A, "password": "Test@1234"})
check("duplicate email -> 409", st == 409, f"status={st}")

st, weak, _ = req("POST", "/auth/register", {"name": "Weak", "email": f"weak{TS}@medipulse.com", "password": "short"})
check("weak password -> 400", st == 400, f"status={st} msg={weak.get('message') if isinstance(weak, dict) else weak}")

st, badmail, _ = req("POST", "/auth/register", {"name": "X", "email": "not-an-email", "password": "Test@1234"})
check("invalid email -> 400", st == 400, f"status={st}")

st, loginA, _ = req("POST", "/auth/login", {"email": EMAIL_A, "password": "Test@1234"})
check("login as registered user", st == 200 and loginA.get("token"), f"status={st}")
A_T = loginA.get("token")

st, refreshed, _ = req("POST", "/auth/refresh", query=f"refreshToken={urllib.parse.quote(admin['refreshToken'])}")
check("refresh token -> new tokens", st == 200 and refreshed.get("token"), f"status={st}")

st, _, _ = req("POST", "/auth/refresh", query="refreshToken=garbage.token.here")
check("garbage refresh token -> 401", st == 401, f"status={st}")


st, _, _ = req("POST", "/auth/refresh", query=f"refreshToken={ADMIN_T}")
check("access token as refresh -> 401", st == 401, f"status={st}")


for i in range(5):
    req("POST", "/auth/login", {"email": f"ratelimit{TS}@medipulse.com", "password": "bad"})
st, body, _ = req("POST", "/auth/login", {"email": f"ratelimit{TS}@medipulse.com", "password": "bad"})
msg = body.get("message", "") if isinstance(body, dict) else ""
check("rate limit blocks after 5 failures", st == 401 and "Too many" in msg, f"status={st} msg={msg}")


sec("2. AUTH GUARDS: 401 / 403 matrix")

st, _, _ = req("GET", "/me")
check("GET /me no token -> 401", st == 401, f"status={st}")

st, _, _ = req("GET", "/appointments")
check("GET /appointments no token -> 401", st == 401, f"status={st}")

st, _, _ = req("GET", "/admin/stats", token=PAT_T)
check("patient -> /admin/stats = 403", st == 403, f"status={st}")

st, _, _ = req("GET", "/admin/stats", token=DOC_T)
check("doctor -> /admin/stats = 403", st == 403, f"status={st}")

st, _, _ = req("GET", "/users", token=DOC_T)
check("doctor -> /users = 403", st == 403, f"status={st}")

st, _, _ = req("GET", "/users", token=PAT_T)
check("patient -> /users = 403", st == 403, f"status={st}")

st, _, _ = req("POST", "/medical-records", {"patientId": PAT_ID, "diagnosis": "x", "recordDate": "2026-12-01T10:00"}, token=PAT_T)
check("patient -> create medical record = 403", st == 403, f"status={st}")

st, _, _ = req("POST", "/prescriptions", {"patientId": PAT_ID, "medication": "x", "dosage": "1", "frequency": "1", "duration": "1d"}, token=PAT_T)
check("patient -> create prescription = 403", st == 403, f"status={st}")

st, _, _ = req("POST", "/health-readings", {"patientId": PAT_ID, "readingType": "HEART_RATE", "value": "72", "recordedAt": "2026-12-01T10:00"}, token=A_T)
check("other patient -> create reading for someone else = 403", st == 403, f"status={st}")

st, _, _ = req("GET", "/users/me", token="not.a.jwt")
check("garbage token -> 401", st == 401, f"status={st}")

st, _, _ = req("POST", "/admin/doctors", {"name": "X", "email": "x@x.com", "password": "Test@1234", "specialization": "S", "department": "D"}, token=PAT_T)
check("patient -> create doctor = 403", st == 403, f"status={st}")


sec("3. PROFILE: /users/me ops (on throwaway A)")

st, me, _ = req("GET", "/me", token=A_T)
check("GET /me", st == 200 and me.get("email") == EMAIL_A, f"status={st}")

st, me2, _ = req("GET", "/users/me", token=A_T)
check("GET /users/me", st == 200 and me2.get("role") == "PATIENT", f"status={st}")

st, upd, _ = req("PUT", "/users/me", {"name": "API Test Renamed", "email": EMAIL_A, "phone": "9000000002"}, token=A_T)
check("PUT /users/me profile update", st == 200 and upd.get("name") == "API Test Renamed", f"status={st}")

st, upd2, _ = req("PUT", "/users/me", {"name": "X", "email": "patient@medipulse.com", "phone": None}, token=A_T)
check("profile email conflict -> 409", st == 409, f"status={st}")

st, body, _ = req("PUT", "/users/me/password", {"currentPassword": "WRONG", "newPassword": "NewPass@123"}, token=A_T)
check("wrong current password (server: 401)", st == 401, f"status={st} msg={body.get('message') if isinstance(body, dict) else body}")

st, _, _ = req("PUT", "/users/me/password", {"currentPassword": "Test@1234", "newPassword": "NewPass@123"}, token=A_T)
check("change password -> 204", st == 204, f"status={st}")

st, relogin, _ = req("POST", "/auth/login", {"email": EMAIL_A, "password": "NewPass@123"})
check("login with new password", st == 200, f"status={st}")
A_T = relogin.get("token", A_T)

st, _, _ = req("PUT", "/users/me/password", {"currentPassword": "NewPass@123", "newPassword": "Test@1234"}, token=A_T)
check("restore password", st == 204, f"status={st}")


sec("4. DOCTORS: read + admin CRUD")

st, docs, _ = req("GET", "/doctors", token=PAT_T)
check("GET /doctors (as patient)", st == 200 and isinstance(docs, list) and len(docs) > 0, f"status={st} count={len(docs) if isinstance(docs, list) else '?'}")
DOCS = docs if isinstance(docs, list) else []
TARGET_DOC = DOCS[0]["doctorId"] if DOCS else None

st, d1, _ = req("GET", f"/doctors/{TARGET_DOC}", token=DOC_T)
check("GET /doctors/{id}", st == 200 and d1.get("doctorId") == TARGET_DOC, f"status={st}")

st, _, _ = req("GET", "/doctors/999999", token=DOC_T)
check("GET nonexistent doctor -> 404", st == 404, f"status={st}")

st, apats, _ = req("GET", "/doctors/patients", token=DOC_T)
check("GET /doctors/patients (doctor)", st == 200 and isinstance(apats, list), f"status={st} count={len(apats) if isinstance(apats, list) else '?'}")

st, _, _ = req("GET", "/doctors/patients", token=PAT_T)
check("patient -> /doctors/patients = 403", st == 403, f"status={st}")

st, upd, _ = req("PUT", "/doctors/me", {"phone": "9876543210"}, token=DOC_T)
check("PUT /doctors/me self update", st == 200, f"status={st}")

st, nd, _ = req("POST", "/admin/doctors", {"name": "Temp Test Doc", "email": f"tdoc{TS}@medipulse.com", "password": "Temp@1234", "phone": "9111111111", "specialization": "Neurology", "department": "Neuro"}, token=ADMIN_T)
check("admin creates doctor -> 201", st == 201 and nd.get("doctorId"), f"status={st}")
TDOC_ID = nd.get("doctorId")

st, _, _ = req("POST", "/admin/doctors", {"name": "Dup Doc", "email": f"tdoc{TS}@medipulse.com", "password": "Temp@1234", "specialization": "S", "department": "D"}, token=ADMIN_T)
check("duplicate doctor email -> 409", st == 409, f"status={st}")

st, nud, _ = req("PUT", f"/admin/doctors/{TDOC_ID}", {"name": "Temp Test Doc II", "phone": "9222222222", "specialization": "Neurology", "department": "Neuro"}, token=ADMIN_T)
check("admin updates doctor", st == 200 and nud.get("name") == "Temp Test Doc II", f"status={st}")

st, tlogin, _ = req("POST", "/auth/login", {"email": f"tdoc{TS}@medipulse.com", "password": "Temp@1234"})
check("new doctor can login", st == 200 and tlogin.get("user", {}).get("role") == "DOCTOR", f"status={st}")


sec("5. PATIENTS: profile access rules")

st, _, _ = req("GET", f"/patients/{PAT_ID}", token=PAT_T)
check("patient views own profile -> 200", st == 200, f"status={st}")

st, _, _ = req("GET", f"/patients/{A_ID}", token=PAT_T)
check("patient views other profile -> 403", st == 403, f"status={st}")

st, _, _ = req("GET", f"/patients/{PAT_ID}", token=DOC_T)
check("doctor views patient profile -> 200", st == 200, f"status={st}")

st, _, _ = req("GET", "/patients/999999", token=DOC_T)
check("nonexistent patient -> 404", st == 404, f"status={st}")


sec("6. APPOINTMENTS: full lifecycle")

FUTURE1 = "2027-03-15T10:30"
FUTURE2 = "2027-03-16T11:00"

st, appt, _ = req("POST", "/appointments", {"doctorId": TARGET_DOC, "appointmentDate": FUTURE1, "reason": "Persistent cough"}, token=PAT_T)
check("patient books appointment -> 201", st == 201 and appt.get("status") == "SCHEDULED", f"status={st} appt={appt if st != 201 else appt.get('appointmentId')}")
APPT_ID = appt.get("appointmentId")

st, conf, _ = req("POST", "/appointments", {"doctorId": TARGET_DOC, "appointmentDate": FUTURE1, "reason": "Double"}, token=PAT_T)
check("double booking same slot -> 409", st == 409, f"status={st} msg={conf.get('message') if isinstance(conf, dict) else conf}")

st, past, _ = req("POST", "/appointments", {"doctorId": TARGET_DOC, "appointmentDate": "2020-01-01T10:00", "reason": "Past"}, token=PAT_T)
check("past date booking -> 400", st == 400, f"status={st} msg={past.get('message') if isinstance(past, dict) else past}")

st, nodoc, _ = req("POST", "/appointments", {"doctorId": 999999, "appointmentDate": FUTURE2, "reason": "x"}, token=PAT_T)
check("booking unknown doctor -> 404", st == 404, f"status={st}")

st, _, _ = req("POST", "/appointments", {"doctorId": TARGET_DOC, "appointmentDate": FUTURE2, "reason": "x"}, token=DOC_T)
check("doctor cannot book -> 403", st == 403, f"status={st}")

st, list_p, _ = req("GET", "/appointments", token=PAT_T)
mine = [a for a in list_p if a.get("patientId") == PAT_ID] if isinstance(list_p, list) else []
check("patient lists appointments (only own)", st == 200 and len(list_p) >= 1 and len(mine) == len(list_p), f"status={st} total={len(list_p) if isinstance(list_p, list) else '?'}")

st, list_d, _ = req("GET", "/appointments", token=DOC_T)
dmine = [a for a in list_d if a.get("doctorId") == TARGET_DOC] if isinstance(list_d, list) else []
check("doctor lists appointments (only own)", st == 200 and len(dmine) == len(list_d), f"status={st} total={len(list_d) if isinstance(list_d, list) else '?'}")

st, list_a, _ = req("GET", "/appointments", token=ADMIN_T)
check("admin lists all appointments", st == 200 and len(list_a) >= len(list_p), f"status={st} total={len(list_a) if isinstance(list_a, list) else '?'}")

st, one, _ = req("GET", f"/appointments/{APPT_ID}", token=PAT_T)
check("patient GET own appointment", st == 200 and one.get("reason") == "Persistent cough", f"status={st}")


st, _, _ = req("GET", f"/appointments/{APPT_ID}", token=A_T)
check("other patient views appointment -> 403", st == 403, f"status={st}")

st, resch, _ = req("PUT", f"/appointments/{APPT_ID}", {"appointmentDate": FUTURE2}, token=PAT_T)
check("patient reschedules -> 200", st == 200 and resch.get("appointmentDate", "").startswith("2027-03-16"), f"status={st} date={resch.get('appointmentDate') if isinstance(resch, dict) else resch}")

st, _, _ = req("PUT", f"/appointments/{APPT_ID}", {"status": "COMPLETED"}, token=PAT_T)
check("patient cannot change status -> 403", st == 403, f"status={st}")

st, _, _ = req("PUT", f"/appointments/{APPT_ID}", {"appointmentDate": "2027-03-20T09:00"}, token=DOC_T)
check("doctor cannot change date -> 403", st == 403, f"status={st}")

st, dstat, _ = req("PUT", f"/appointments/{APPT_ID}", {"status": "COMPLETED"}, token=DOC_T)
check("doctor sets status COMPLETED", st == 200 and dstat.get("status") == "COMPLETED", f"status={st}")

st, adminedit, _ = req("PUT", f"/appointments/{APPT_ID}", {"appointmentDate": FUTURE1, "reason": "Persistent cough (reviewed)", "status": "SCHEDULED"}, token=ADMIN_T)
check("admin full edit", st == 200 and adminedit.get("status") == "SCHEDULED" and adminedit.get("reason") == "Persistent cough (reviewed)", f"status={st}")

st, bad, _ = req("PUT", f"/appointments/{APPT_ID}", {"status": "NOT_A_STATUS"}, token=ADMIN_T)
check("invalid status value -> 400", st == 400, f"status={st}")

st, page1, _ = req("GET", "/appointments", query="page=0&size=1", token=ADMIN_T)
check("pagination size=1", st == 200 and len(page1) <= 1, f"status={st} len={len(page1) if isinstance(page1, list) else '?'}")

st, _, _ = req("GET", "/appointments", query="page=0&size=9999", token=ADMIN_T)
check("invalid size -> 400", st == 400, f"status={st}")

st, _, _ = req("DELETE", f"/appointments/{APPT_ID}", token=PAT_T)
check("patient cancels appointment -> 204", st == 204, f"status={st}")

st, after_del, _ = req("GET", f"/appointments/{APPT_ID}", token=ADMIN_T)
check("cancelled appointment kept in history (soft delete)", st == 200 and after_del.get("status") == "CANCELLED", f"status={st} status={after_del.get('status') if isinstance(after_del, dict) else after_del}")

st, _, _ = req("DELETE", f"/appointments/{APPT_ID}", token=A_T)
check("other patient delete -> 403", st == 403, f"status={st}")


st, appt2, _ = req("POST", "/appointments", {"doctorId": TARGET_DOC, "appointmentDate": "2027-04-20T14:00", "reason": "Follow-up"}, token=PAT_T)
check("re-book for clinical tests", st == 201, f"status={st}")
APPT2_ID = appt2.get("appointmentId")


sec("7. HEALTH READINGS + ALERTS")

st, hr, _ = req("POST", "/health-readings", {"patientId": PAT_ID, "readingType": "HEART_RATE", "value": "72", "unit": "bpm", "recordedAt": "2027-01-10T09:00"}, token=PAT_T)
check("patient creates normal reading -> 201", st == 201 and hr.get("value") == "72", f"status={st}")

st, hr2, _ = req("POST", "/health-readings", {"patientId": PAT_ID, "readingType": "HEART_RATE", "value": "150", "unit": "bpm", "recordedAt": "2027-01-10T10:00"}, token=PAT_T)
check("abnormal reading -> 201 (alert expected)", st == 201, f"status={st}")

st, alerts, _ = req("GET", f"/alerts/patient/{PAT_ID}", token=PAT_T)
n_alerts = len(alerts) if isinstance(alerts, list) else -1
check("abnormal reading auto-created alert", st == 200 and n_alerts >= 1, f"status={st} alerts={n_alerts}")

st, body, _ = req("POST", "/health-readings", {"patientId": PAT_ID, "readingType": "HEART_RATE", "value": "abc", "recordedAt": "2027-01-10T11:00"}, token=PAT_T)
check("non-numeric value -> 400", st == 400, f"status={st} msg={body.get('message') if isinstance(body, dict) else body}")

st, body, _ = req("POST", "/health-readings", {"patientId": PAT_ID, "readingType": "HEART_RATE", "value": "500", "recordedAt": "2027-01-10T11:00"}, token=PAT_T)
check("out-of-range value -> 400", st == 400, f"status={st} msg={body.get('message') if isinstance(body, dict) else body}")

st, body, _ = req("POST", "/health-readings", {"patientId": A_ID, "readingType": "HEART_RATE", "value": "72", "recordedAt": "2027-01-10T11:00"}, token=DOC_T)
check("doctor without appointment -> reading 403", st == 403, f"status={st}")

st, readings, _ = req("GET", f"/health-readings/patient/{PAT_ID}", token=PAT_T)
sorted_ok = isinstance(readings, list) and all(
    readings[i].get("recordedAt", "") >= readings[i + 1].get("recordedAt", "")
    for i in range(len(readings) - 1)
)
check("GET readings sorted newest first", st == 200 and len(readings) >= 2 and sorted_ok, f"status={st} count={len(readings) if isinstance(readings, list) else '?'}")

st, _, _ = req("GET", f"/health-readings/patient/{PAT_ID}", token=A_T)
check("other patient reads readings -> 403", st == 403, f"status={st}")

ALERT_ID = None
for a in (alerts or []):
    if not a.get("resolved"):
        ALERT_ID = a["alertId"]
        break

st, _, _ = req("PUT", f"/alerts/{ALERT_ID}", token=PAT_T) if ALERT_ID else (0, None, None)
check("patient cannot resolve alert -> 403", st == 403, f"status={st}")

st, resolved, _ = req("PUT", f"/alerts/{ALERT_ID}", token=DOC_T) if ALERT_ID else (0, None, None)
check("doctor resolves alert", st == 200 and resolved.get("resolved") is True, f"status={st}")

st, reread, _ = req("GET", f"/alerts/patient/{PAT_ID}", token=PAT_T)
check("resolved alert persisted", any(a.get("resolved") for a in (reread or [])), f"status={st}")

st, _, _ = req("PUT", "/alerts/999999", token=DOC_T)
check("resolve nonexistent alert -> 404", st == 404, f"status={st}")


sec("8. CLINICAL RECORDS: medical-records / prescriptions / lab-reports")

st, rec, _ = req("POST", "/medical-records", {"patientId": PAT_ID, "diagnosis": "Viral infection", "treatment": "Fluids + rest", "recordDate": "2027-01-12T10:00"}, token=DOC_T)
check("doctor creates medical record -> 201", st == 201 and rec.get("diagnosis") == "Viral infection", f"status={st}")

st, recs, _ = req("GET", f"/medical-records/patient/{PAT_ID}", token=PAT_T)
check("patient reads own records", st == 200 and isinstance(recs, list) and len(recs) >= 1, f"status={st} count={len(recs) if isinstance(recs, list) else '?'}")

st, _, _ = req("GET", f"/medical-records/patient/{PAT_ID}", token=A_T)
check("other patient reads records -> 403", st == 403, f"status={st}")

st, _, _ = req("POST", "/medical-records", {"patientId": A_ID, "diagnosis": "x", "recordDate": "2027-01-12T10:00"}, token=DOC_T)
check("doctor + unauthorized patient -> 403", st == 403, f"status={st}")

st, pres, _ = req("POST", "/prescriptions", {"patientId": PAT_ID, "medication": "Amoxicillin", "dosage": "500mg", "frequency": "3x daily", "duration": "5 days", "instructions": "After food"}, token=DOC_T)
check("doctor creates prescription -> 201", st == 201 and pres.get("medication") == "Amoxicillin", f"status={st}")

st, presses, _ = req("GET", f"/prescriptions/patient/{PAT_ID}", token=PAT_T)
check("patient reads prescriptions", st == 200 and isinstance(presses, list) and len(presses) >= 1, f"status={st} count={len(presses) if isinstance(presses, list) else '?'}")

st, body, _ = req("POST", "/prescriptions", {"patientId": PAT_ID, "medication": "X", "dosage": "", "frequency": "", "duration": ""}, token=DOC_T)
check("prescription missing fields -> 400", st == 400, f"status={st}")

st, lab, _ = req("POST", "/lab-reports", {"patientId": PAT_ID, "testName": "CBC", "result": "Normal", "reportDate": "2027-01-13T08:00", "fileReference": "labs/cbc.pdf"}, token=DOC_T)
check("doctor creates lab report -> 201", st == 201 and lab.get("testName") == "CBC", f"status={st}")

st, labs, _ = req("GET", f"/lab-reports/patient/{PAT_ID}", token=PAT_T)
check("patient reads lab reports", st == 200 and isinstance(labs, list) and len(labs) >= 1, f"status={st} count={len(labs) if isinstance(labs, list) else '?'}")

st, lab2, _ = req("POST", "/lab-reports", {"patientId": PAT_ID, "testName": "XRay", "result": "Clear", "reportDate": "2027-01-13T09:00"}, token=ADMIN_T)
check("admin creates lab report -> 201", st == 201, f"status={st}")

st, _, _ = req("POST", "/lab-reports", {"patientId": PAT_ID, "testName": "X", "result": "Y", "reportDate": "2027-01-13T09:00"}, token=PAT_T)
check("patient creates lab report -> 403", st == 403, f"status={st}")


sec("9. ADMIN: stats + user management")

st, stats, _ = req("GET", "/admin/stats", token=ADMIN_T)
keys = ["totalUsers", "totalPatients", "totalDoctors", "totalAppointments", "totalMedicalRecords", "totalPrescriptions", "totalLabReports", "totalHealthReadings", "totalAlerts"]
check("GET /admin/stats all fields", st == 200 and all(k in stats for k in keys), f"status={st} stats={ {k: stats.get(k) for k in keys} if st == 200 else stats }")

st, users, _ = req("GET", "/users", token=ADMIN_T)
check("GET /users (admin)", st == 200 and isinstance(users, list) and len(users) >= 3, f"status={st} count={len(users) if isinstance(users, list) else '?'}")

st, _, _ = req("PATCH", f"/users/{A_ID}/status?active=false", token=ADMIN_T)
check("admin disables account", st == 200, f"status={st}")

st, _, _ = req("POST", "/auth/login", {"email": EMAIL_A, "password": "Test@1234"})
check("disabled account cannot login", st == 401, f"status={st}")

st, _, _ = req("PATCH", f"/users/{A_ID}/status?active=true", token=ADMIN_T)
check("admin re-enables account", st == 200, f"status={st}")

st, _, _ = req("PATCH", f"/users/{ADMIN_ID}/status?active=false", token=ADMIN_T)
check("admin cannot disable admin -> 409", st == 409, f"status={st}")

st, _, _ = req("DELETE", f"/users/{ADMIN_ID}", token=ADMIN_T)
check("admin cannot delete admin -> 409", st == 409, f"status={st}")

st, _, _ = req("DELETE", f"/users/{A_ID}", token=ADMIN_T)
check("admin deletes throwaway user -> 204", st == 204, f"status={st}")

st, _, _ = req("DELETE", f"/users/{A_ID}", token=ADMIN_T)
check("delete nonexistent user -> 404", st == 404, f"status={st}")

st, _, _ = req("DELETE", f"/users/{PAT_ID}", token=ADMIN_T)
check("delete user with clinical history -> 409 (FK) or 204", st in (204, 409), f"status={st}")


sec("10. MISC: swagger, CORS, 404s")

st, _, _ = req("GET", "/does-not-exist", token=ADMIN_T)
check("unknown API path -> 404/401", st in (401, 404), f"status={st}")


import urllib.request as ur
r = ur.Request("http://localhost:8080/api/appointments", method="OPTIONS")
r.add_header("Origin", "http://localhost:5500")
r.add_header("Access-Control-Request-Method", "GET")
try:
    with ur.urlopen(r, timeout=10) as resp:
        acao = resp.headers.get("Access-Control-Allow-Origin")
        check("CORS preflight allows localhost:5500", resp.status in (200, 204) and acao == "http://localhost:5500", f"status={resp.status} acao={acao}")
except urllib.error.HTTPError as e:
    check("CORS preflight allows localhost:5500", False, f"status={e.code}")


print("\n" + "=" * 60)
npass = sum(1 for r in RESULTS if r[0] == "PASS")
nfail = sum(1 for r in RESULTS if r[0] == "FAIL")
print(f"TOTAL: {npass} passed, {nfail} failed, {len(RESULTS)} checks")
if nfail:
    print("\nFAILED CHECKS:")
    for status, name, detail in RESULTS:
        if status == "FAIL":
            print(f"  - {name} | {detail}")
print("=" * 60)
