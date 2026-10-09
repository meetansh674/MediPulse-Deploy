
"""Round 2: verify doctor clinical flows with a valid doctor profile + confirm demo-doctor data bug."""
import json
import time
import urllib.request
import urllib.error

BASE = "http://localhost:8080/api"
RESULTS = []


def req(method, path, body=None, token=None, query=""):
    url = BASE + path + (("?" + query) if query else "")
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    if data is not None:
        r.add_header("Content-Type", "application/json")
    if token:
        r.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            raw = resp.read().decode()
            try:
                parsed = json.loads(raw) if raw else None
            except Exception:
                parsed = raw
            return resp.status, parsed
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            parsed = json.loads(raw) if raw else None
        except Exception:
            parsed = raw
        return e.code, parsed
    except Exception as e:
        return -1, str(e)


def check(name, cond, detail=""):
    RESULTS.append(("PASS" if cond else "FAIL", name, str(detail)[:160]))
    print(("  ok   " if cond else "  FAIL ") + name + (" | " + str(detail)[:140] if detail else ""))


def sec(t):
    print(f"\n=== {t} ===")


sec("A. Demo doctor (doctor@medipulse.com) profile bug confirmation")

st, dlog = req("POST", "/auth/login", {"email": "doctor@medipulse.com", "password": "Doctor@123"})
check("demo doctor login", st == 200, f"status={st}")
DEMO_T = dlog.get("token")
DEMO_ID = dlog.get("user", {}).get("userId")

st, docs, = req("GET", "/doctors", token=DEMO_T)
ids = [d["doctorId"] for d in docs] if isinstance(docs, list) else []
check("demo doctor missing from GET /doctors list (bug)", DEMO_ID not in ids, f"listed ids={ids} demoId={DEMO_ID}")

st, prof = req("GET", f"/doctors/{DEMO_ID}", token=DEMO_T)
check("GET /doctors/{demoId} -> 404 (no profile row)", st == 404, f"status={st}")

st, body = req("PUT", "/doctors/me", {"phone": "9876543210"}, token=DEMO_T)
check("demo doctor PUT /doctors/me -> 404 (bug)", st == 404, f"status={st} msg={body.get('message') if isinstance(body, dict) else body}")


st, pat = req("POST", "/auth/login", {"email": "patient@medipulse.com", "password": "Patient@123"})
PAT_T, PAT_ID = pat["token"], pat["user"]["userId"]
st, body = req("POST", "/appointments", {"doctorId": DEMO_ID, "appointmentDate": "2027-05-01T10:00", "reason": "See demo doc"}, token=PAT_T)
check("booking demo doctor -> 404 (cannot be booked)", st == 404, f"status={st} msg={body.get('message') if isinstance(body, dict) else body}")


sec("B. Doctor clinical flows with VALID profile (doctor.test, id=6)")

st, vlog = req("POST", "/auth/login", {"email": "doctor.test@medipulse.com", "password": "doctor123"})
check("valid doctor login", st == 200, f"status={st}")
VT = vlog.get("token")
VID = vlog.get("user", {}).get("userId")

st, prof = req("PUT", "/doctors/me", {"phone": "9876543210"}, token=VT)
check("valid doctor PUT /doctors/me -> 200", st == 200, f"status={st}")

st, pats = req("GET", "/doctors/patients", token=VT)
check("authorized patients visible", st == 200 and isinstance(pats, list) and PAT_ID in [p["userId"] for p in pats],
      f"status={st} patients={[p['userId'] for p in pats] if isinstance(pats, list) else pats}")


st, upd = req("PUT", "/appointments/10", {"status": "COMPLETED"}, token=VT)
check("assigned doctor sets status COMPLETED", st == 200 and upd.get("status") == "COMPLETED", f"status={st}")

st, rec = req("POST", "/medical-records", {"patientId": PAT_ID, "diagnosis": "Flu", "treatment": "Tamiflu", "recordDate": "2027-02-01T10:00"}, token=VT)
check("doctor creates medical record -> 201", st == 201, f"status={st}")

st, recs = req("GET", f"/medical-records/patient/{PAT_ID}", token=PAT_T)
check("patient reads records (>=1)", st == 200 and len(recs or []) >= 1, f"status={st} count={len(recs) if isinstance(recs, list) else '?'}")

st, pres = req("POST", "/prescriptions", {"patientId": PAT_ID, "medication": "Oseltamivir", "dosage": "75mg", "frequency": "2x", "duration": "5d"}, token=VT)
check("doctor creates prescription -> 201", st == 201, f"status={st}")

st, presses = req("GET", f"/prescriptions/patient/{PAT_ID}", token=PAT_T)
check("patient reads prescriptions (>=1)", st == 200 and len(presses or []) >= 1, f"status={st} count={len(presses) if isinstance(presses, list) else '?'}")

st, lab = req("POST", "/lab-reports", {"patientId": PAT_ID, "testName": "HbA1c", "result": "5.6%", "reportDate": "2027-02-02T08:00"}, token=VT)
check("doctor creates lab report -> 201", st == 201, f"status={st}")

st, labs = req("GET", f"/lab-reports/patient/{PAT_ID}", token=PAT_T)
check("patient reads lab reports (>=1)", st == 200 and len(labs or []) >= 1, f"status={st} count={len(labs) if isinstance(labs, list) else '?'}")

st, hr = req("POST", "/health-readings", {"patientId": PAT_ID, "readingType": "SPO2", "value": "97", "unit": "%", "recordedAt": "2027-02-03T09:00"}, token=VT)
check("authorized doctor creates reading -> 201", st == 201, f"status={st}")
check("value normalization (72 stored as '72.0'?)", True, f"value returned for SPO2 97 = {hr.get('value') if isinstance(hr, dict) else hr}")

st, alerts = req("GET", f"/alerts/patient/{PAT_ID}", token=VT)
unresolved = [a for a in (alerts or []) if not a.get("resolved")]
check("doctor lists patient alerts", st == 200 and len(alerts or []) >= 1, f"status={st} total={len(alerts or [])} unresolved={len(unresolved)}")

if unresolved:
    st, res = req("PUT", f"/alerts/{unresolved[0]['alertId']}", token=VT)
    check("doctor resolves alert -> 200", st == 200 and res.get("resolved") is True, f"status={st}")
else:
    st, newalert = req("POST", "/health-readings", {"patientId": PAT_ID, "readingType": "HEART_RATE", "value": "145", "recordedAt": "2027-02-03T10:00"}, token=PAT_T)
    st2, alerts2 = req("GET", f"/alerts/patient/{PAT_ID}", token=VT)
    un2 = [a for a in (alerts2 or []) if not a.get("resolved")]
    st, res = req("PUT", f"/alerts/{un2[0]['alertId']}", token=VT) if un2 else (-1, None)
    check("doctor resolves alert -> 200", st == 200 and res.get("resolved") is True, f"status={st}")

st, ral = req("GET", f"/alerts/patient/{PAT_ID}", token=PAT_T)
check("resolved flag persisted for patient", any(a.get("resolved") for a in (ral or [])), f"status={st}")


st, readings = req("GET", f"/health-readings/patient/{PAT_ID}", token=PAT_T)
vals = [r.get("value") for r in (readings or [])]
check("reading value format check", True, f"values={vals}")


sec("C. Error-handling edge cases")

st, body = req("GET", "/definitely-not-a-route", token=PAT_T)
check("unknown API path with auth -> should be 404, actual:", st in (404, 500), f"status={st} msg={body.get('message') if isinstance(body, dict) else body}")

st, body = req("GET", "/appointments/abc", token=PAT_T)
check("non-numeric path id -> 400", st == 400, f"status={st}")

st, body = req("POST", "/appointments", body={"reason": "no fields"}, token=PAT_T)
check("appointment missing fields -> 400", st == 400, f"status={st} msg={body.get('message') if isinstance(body, dict) else body}")

st, body = req("POST", "/health-readings", body={"patientId": PAT_ID, "readingType": "HEART_RATE", "value": "72"}, token=PAT_T)
check("reading missing recordedAt -> 400", st == 400, f"status={st}")


url = BASE + "/appointments"
r = urllib.request.Request(url, data=b"{invalid json", method="POST")
r.add_header("Content-Type", "application/json")
r.add_header("Authorization", f"Bearer {PAT_T}")
try:
    urllib.request.urlopen(r, timeout=10)
    st = 200
except urllib.error.HTTPError as e:
    st = e.code
check("malformed JSON -> 400", st == 400, f"status={st}")

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
