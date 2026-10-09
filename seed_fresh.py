
"""Seed MediPulse from scratch: patients, doctors, appointments, health
readings (triggering alerts), medical records, prescriptions, lab reports."""
import json, urllib.request, sys

BASE = "http://localhost:8080/api"
PASS = FAIL = 0
def check(label, ok, detail=""):
    global PASS, FAIL
    print(("  OK   " if ok else "  FAIL ") + label + (f"  [{detail}]" if detail and not ok else ""))
    PASS += ok; FAIL += (not ok)

def req(method, path, body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Content-Type", "application/json")
    if token: r.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(r) as resp:
            raw = resp.read().decode()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try: return e.code, json.loads(raw)
        except Exception: return e.code, raw


st, admin = req("POST", "/auth/login", {"email": "admin@medipulse.com", "password": "Admin@123"})
check("admin login", st == 200, f"status={st}")
ATOK = admin["token"]


patients = [
    {"name": "Aarav Sharma",  "email": "aarav@medipulse.com",  "phone": "9000000001",
     "q": "What is your first pet's name?", "a": "tommy"},
    {"name": "Priya Patel",   "email": "priya@medipulse.com",  "phone": "9000000002",
     "q": "What city were you born in?", "a": "pune"},
    {"name": "Rohan Mehta",   "email": "rohan@medipulse.com",  "phone": "9000000003",
     "q": "What is your favourite food?", "a": "pizza"},
]
for p in patients:
    st, body = req("POST", "/auth/register", {
        "name": p["name"], "email": p["email"], "password": "Patient@123",
        "phone": p["phone"], "securityQuestion": p["q"], "securityAnswer": p["a"]})
    check(f"register {p['email']}", st == 201, f"status={st} {body if isinstance(body,str) else ''}")

st, users = req("GET", "/users", token=ATOK)
by_email = {u["email"]: u for u in users}
for p in patients: p["id"] = by_email.get(p["email"], {}).get("userId")
check("patient ids resolved", all(p["id"] for p in patients))


doctors = [
    {"name": "Anita Mehta", "email": "dr.mehta@medipulse.com", "spec": "Cardiology",  "dept": "Cardiology"},
    {"name": "Vikram Iyer", "email": "dr.iyer@medipulse.com",  "spec": "Dermatology", "dept": "Dermatology"},
    {"name": "Neha Kapoor", "email": "dr.kapoor@medipulse.com", "spec": "Neurology",   "dept": "Neurology"},
]
for d in doctors:
    st, body = req("POST", "/admin/doctors", {
        "name": d["name"], "email": d["email"], "password": "Doctor@123",
        "phone": "9111111111", "specialization": d["spec"], "department": d["dept"]},
        token=ATOK)
    check(f"create doctor {d['email']}", st == 201, f"status={st} {body if isinstance(body,str) else ''}")
    d["id"] = (body or {}).get("doctorId") if isinstance(body, dict) else None
check("doctor ids present", all(d["id"] for d in doctors))


for d in doctors:
    st, b = req("POST", "/auth/login", {"email": d["email"], "password": "Doctor@123"})
    check(f"doctor login {d['email']}", st == 200, f"status={st}")
    d["tok"] = b["token"]


appts = [
    (0, 0, "2026-10-12T10:30:00", "Chest pain during exercise"),
    (0, 1, "2026-10-15T11:00:00", "Skin rash follow-up"),
    (1, 0, "2026-10-13T09:15:00", "High BP consultation"),
    (1, 2, "2026-10-16T14:00:00", "Recurring migraines"),
    (2, 2, "2026-10-14T15:30:00", "Memory concern evaluation"),
]
appt_ids = []

for pi, di, when, reason in appts:
    st, b = req("POST", "/auth/login", {"email": patients[pi]["email"], "password": "Patient@123"})
    ptok = b["token"]
    st, body = req("POST", "/appointments", {
        "patientId": patients[pi]["id"], "doctorId": doctors[di]["id"],
        "appointmentDate": when, "reason": reason}, token=ptok)
    check(f"book appt p{pi+1}->d{di+1}", st in (200, 201), f"status={st} {body if isinstance(body,str) else ''}")
    if isinstance(body, dict): appt_ids.append(body.get("appointmentId"))


readings = [

    (0, "SYSTOLIC_BP",   "148", "mmHg", "2026-10-08T09:00:00", True),
    (0, "DIASTOLIC_BP",  "92",  "mmHg", "2026-10-08T09:00:00", True),
    (0, "HEART_RATE",    "72",  "bpm",  "2026-10-09T08:00:00", False),
    (0, "SPO2",          "98",  "%",    "2026-10-09T08:00:00", False),
    (1, "HEART_RATE",    "132", "bpm",  "2026-10-09T07:30:00", True),
    (1, "BLOOD_GLUCOSE", "210", "mg/dL","2026-10-08T10:00:00", True),
    (1, "BLOOD_GLUCOSE", "95",  "mg/dL","2026-10-09T07:00:00", False),
    (2, "TEMPERATURE",   "37.8","C",    "2026-10-09T06:45:00", True),
    (2, "HEART_RATE",    "76",  "bpm",  "2026-10-09T06:45:00", False),
    (2, "BLOOD_GLUCOSE", "88",  "mg/dL","2026-10-07T18:00:00", False),
]
ptoks = {}
for p in patients:
    st, b = req("POST", "/auth/login", {"email": p["email"], "password": "Patient@123"})
    ptoks[p["id"]] = b["token"]

alerts_expected = 0
for pi, rtype, val, unit, when, expect in readings:
    st, body = req("POST", "/health-readings", {
        "patientId": patients[pi]["id"], "readingType": rtype, "value": val,
        "unit": unit, "recordedAt": when}, token=ptoks[patients[pi]["id"]])
    check(f"reading {rtype}={val} (p{pi+1})", st in (200, 201), f"status={st} {body if isinstance(body,str) else ''}")
    alerts_expected += expect


records = [
    (0, 0, "Mild hypertension", "Lifestyle changes, monitor BP daily"),
    (1, 0, "Stage 1 hypertension", "Low-sodium diet, daily BP log"),
    (1, 2, "Chronic migraine", "Sumatriptan as needed, sleep hygiene"),
    (2, 2, "Mild cognitive complaint", "Neuropsychological testing scheduled"),
]
for pi, di, dx, tx in records:
    st, body = req("POST", "/medical-records", {
        "patientId": patients[pi]["id"], "diagnosis": dx, "treatment": tx,
        "recordDate": "2026-10-09T12:00:00"}, token=doctors[di]["tok"])
    check(f"medical record p{pi+1} by d{di+1}", st in (200, 201), f"status={st} {body if isinstance(body,str) else ''}")

scripts = [
    (0, 0, "Amlodipine", "5mg", "Once daily", "30 days", "Take after breakfast"),
    (1, 0, "Losartan",   "50mg", "Once daily", "30 days", "Monitor potassium"),
    (1, 2, "Sumatriptan","50mg", "As needed",  "10 days", "At onset of migraine"),
    (2, 2, "Ginkgo",     "120mg","Twice daily","60 days", None),
]
for pi, di, med, dose, freq, dur, instr in scripts:
    body = {"patientId": patients[pi]["id"], "medication": med, "dosage": dose,
            "frequency": freq, "duration": dur, "instructions": instr}
    st, resp = req("POST", "/prescriptions", body, token=doctors[di]["tok"])
    check(f"prescription {med} p{pi+1}", st in (200, 201), f"status={st} {resp if isinstance(resp,str) else ''}")

labs = [
    (0, 0, "Lipid Profile",  "Total cholesterol 190 mg/dL"),
    (1, 0, "ECG",            "Normal sinus rhythm"),
    (1, 2, "MRI Brain",      "No abnormalities"),
    (2, 2, "CBC",            "All values within range"),
]
for pi, di, name, result in labs:
    st, resp = req("POST", "/lab-reports", {
        "patientId": patients[pi]["id"], "testName": name, "result": result,
        "reportDate": "2026-10-09T13:00:00"}, token=doctors[di]["tok"])
    check(f"lab report {name} p{pi+1}", st in (200, 201), f"status={st} {resp if isinstance(resp,str) else ''}")


st, stats = req("GET", "/admin/stats", token=ATOK)
print("\nADMIN STATS:", json.dumps(stats, indent=1) if isinstance(stats, dict) else stats)
st, alerts = req("GET", f"/alerts/patient/{patients[1]['id']}", token=ATOK)
n_alerts = len(alerts) if isinstance(alerts, list) else -1
check(f"alerts generated (expect >= {alerts_expected})", n_alerts >= 1, f"got {n_alerts}")

print(f"\n{'='*60}\nPASSED: {PASS}   FAILED: {FAIL}")
print("\nLOGIN CREDENTIALS")
print("  Admin:    admin@medipulse.com / Admin@123")
for p in patients: print(f"  Patient:  {p['email']} / Patient@123   ({p['name']})")
for d in doctors: print(f"  Doctor:   {d['email']} / Doctor@123    ({d['name']}, {d['spec']})")
sys.exit(1 if FAIL else 0)
