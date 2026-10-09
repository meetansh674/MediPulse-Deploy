const doctorState = {
    user: null,
    doctorProfile: null,
    appointments: [],
    patients: [],
    selectedPatient: null
};

document.addEventListener("DOMContentLoaded", async () => {
    const user = requireDoctor();
    if (!user) return;

    doctorState.user = user;
    renderShell();
    moveMainIntoLayout();

    const page = document.body.dataset.page;

    try {
        if (page === "dashboard") await initDashboard();
        if (page === "patients") await initPatients();
        if (page === "appointments") await initAppointments();
        if (page === "records") await initRecords();
        if (page === "prescriptions") await initPrescriptions();
        if (page === "labs") await initLabs();
        if (page === "health") await initHealth();
    } catch (error) {
    showMessage(error.message, "error");
    console.error(error);
}

const refreshButton = document.getElementById("refreshPage");
if (refreshButton) {
    refreshButton.addEventListener("click", () => window.location.reload());
}

const refreshDashboard = document.getElementById("refreshDashboard");
if (refreshDashboard) {
    refreshDashboard.addEventListener("click", () => window.location.reload());
}
});

function renderShell() {
    const name = escapeHtml(doctorState.user?.name || "Doctor");
    document.getElementById("appShell").innerHTML = `
    <header class="topbar">
    <a class="brand" href="dashboard.html">
    <span class="brand-mark small"><img class="mp-logo" src="../assets/medipulse-logo.png" alt="MediPulse logo"></span>
    <span><strong>MediPulse</strong><small>Doctor Portal</small></span>
    </a>
    <div class="doctor-header"><span class="doctor-name">${name}</span></div>
    </header>
    <div class="dashboard-layout">
    <aside class="sidebar">
    <nav aria-label="Doctor navigation">
    <a href="dashboard.html" data-nav="dashboard"><span aria-hidden="true">⌂</span><span>Dashboard</span></a>
    <a href="patients.html" data-nav="patients"><span aria-hidden="true">●</span><span>Patients</span></a>
    <a href="appointments.html" data-nav="appointments"><span aria-hidden="true">▣</span><span>Appointments</span></a>
    <a href="records.html" data-nav="records"><span aria-hidden="true">▤</span><span>Medical Records</span></a>
    <a href="prescriptions.html" data-nav="prescriptions"><span aria-hidden="true">✚</span><span>Prescriptions</span></a>
    <a href="lab-reports.html" data-nav="labs"><span aria-hidden="true">◇</span><span>Lab Reports</span></a>
    <a href="health-history.html" data-nav="health"><span aria-hidden="true">♥</span><span>Health History</span></a>
    </nav>
    <div class="doctor-sidebar-actions"><button class="logout-button" id="sidebarLogoutButton" type="button">Logout</button></div>
    </aside>
    </div>`;
    const page = document.body.dataset.page;
    const active = document.querySelector(`[data-nav="${page}"]`);
    if (active) active.classList.add("active");
    const doLogout=()=>MPAuth.logout("index.html");
    document.getElementById("sidebarLogoutButton")?.addEventListener("click",doLogout);
}

function moveMainIntoLayout() {
    const main = document.querySelector(".page-content");
    const layout = document.querySelector(".dashboard-layout");
    const sidebar = document.querySelector(".sidebar");
    if (main && layout && sidebar && !sidebar.nextElementSibling) {
        layout.appendChild(main);
    }
}

setTimeout(moveMainIntoLayout, 0);

function showMessage(message, type = "info") {
    const box = document.getElementById("pageMessage");
    if (!box) return;
    box.className = `page-message ${type}`;
    box.textContent = message;
}

async function loadDoctorProfile() {
    try {
        const profile = await apiRequest(`/doctors/${doctorState.user.userId}`);
        doctorState.doctorProfile = profile;
        return profile;
    } catch (error) {


    console.warn("Doctor profile unavailable, using account data:", error);
    const u = doctorState.user || {};
    doctorState.doctorProfile = {
        doctorId: u.userId, name: u.name, email: u.email, phone: u.phone,
        specialization: "Not set", department: "Not set", incomplete: true
    };
return doctorState.doctorProfile;
}
}

async function loadAppointments() {
    doctorState.appointments = await apiRequest("/appointments") || [];
    return doctorState.appointments;
}

async function loadAuthorizedPatients() {
    doctorState.patients = await apiRequest("/doctors/patients") || [];
    return doctorState.patients;
}

function populatePatientSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = `<option value="">Select an authorized patient</option>` +
    doctorState.patients.map(patient =>
    `<option value="${patient.userId}">${escapeHtml(patient.name)} (ID ${patient.userId})</option>`
    ).join("");
}

async function initDashboard() {
    const profile = await loadDoctorProfile();
    const results = await Promise.allSettled([loadAppointments(), loadAuthorizedPatients()]);
    const failed = results.filter(r => r.status === "rejected");
    if (failed.length) {
        console.error(failed.map(f => f.reason));
        showMessage(failed[0].reason?.message || "Some dashboard data could not be loaded.", "error");
    } else if (profile.incomplete) {
    showMessage("Your doctor profile (specialization / department) is not set up yet. Ask an admin to complete it.", "info");
}

document.getElementById("welcomeMessage").textContent =
`Welcome, ${profile.name || doctorState.user.name || "Doctor"}.`;

setText("profileName", profile.name);
setText("profileEmail", profile.email);
setText("profilePhone", profile.phone);
setText("profileSpecialization", profile.specialization);
setText("profileDepartment", profile.department);
setText("profileRole", "DOCTOR");
setText("profileUserId", profile.doctorId ?? doctorState.user.userId);
setText("profileCreatedAt", doctorState.user.createdAt ? formatDateTime(doctorState.user.createdAt) : "-");

const appointments = doctorState.appointments;
setText("statPatients", doctorState.patients.length);
setText("statAppointments", appointments.length);
setText("statScheduled", appointments.filter(a => a.status === "SCHEDULED").length);
setText("statCompleted", appointments.filter(a => a.status === "COMPLETED").length);

renderUpcomingAppointments();
}

function renderUpcomingAppointments() {
    const container = document.getElementById("upcomingAppointments");
    if (!container) return;

    const rows = doctorState.appointments
    .filter(a => a.status === "SCHEDULED")
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5);

    if (!rows.length) {
        container.innerHTML = `<div class="empty-state">No scheduled appointments found.</div>`;
        return;
    }

container.innerHTML = rows.map(a => `
<div class="list-row">
<div>
<strong>${escapeHtml(a.patientName)}</strong>
<span>${formatDateTime(a.appointmentDate)}</span>
</div>
<span class="status status-scheduled">Scheduled</span>
</div>
`).join("");
}

async function initPatients() {
    await loadAppointments();
    await loadAuthorizedPatients();
    renderPatients();

    document.getElementById("patientSearch").addEventListener("input", renderPatients);
    document.getElementById("closePatientDetails").addEventListener("click", () => {
        document.getElementById("patientDetailsPanel").classList.add("hidden");
    });

document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
        const id = doctorState.selectedPatient?.userId;
        if (!id) return;
        const page = {
            records: "records.html",
            prescriptions: "prescriptions.html",
            labs: "lab-reports.html",
            health: "health-history.html"
        }[button.dataset.action];
    window.location.href = `${page}?patientId=${id}`;
});
});
}

function renderPatients() {
    const query = (document.getElementById("patientSearch")?.value || "").toLowerCase();
    const patients = doctorState.patients.filter(p =>
    String(p.userId).includes(query) ||
    String(p.name || "").toLowerCase().includes(query) ||
    String(p.email || "").toLowerCase().includes(query)
    );

    setText("patientCount", `${patients.length} patient${patients.length === 1 ? "" : "s"}`);

    const container = document.getElementById("patientsList");
    if (!patients.length) {
        container.innerHTML = `<div class="empty-state">No authorized patients match your search.</div>`;
        return;
    }

container.innerHTML = patients.map(p => `
<button class="patient-card" data-patient-id="${p.userId}">
<span class="avatar">${escapeHtml((p.name || "P").charAt(0).toUpperCase())}</span>
<span class="patient-card-main">
<strong>${escapeHtml(p.name)}</strong>
<small>Patient ID: ${p.userId} · ${escapeHtml(p.email || "No email")}</small>
</span>
<span class="arrow">→</span>
</button>
`).join("");

container.querySelectorAll("[data-patient-id]").forEach(button => {
    button.addEventListener("click", () => showPatientDetails(Number(button.dataset.patientId)));
});
}

async function showPatientDetails(patientId) {
    const patient = doctorState.patients.find(p => p.userId === patientId);
    if (!patient) return;

    doctorState.selectedPatient = patient;

    setText("patientDetailsTitle", patient.name || "Patient Details");

    document.getElementById("patientDetails").innerHTML = `
    <div class="info-item"><span>Name</span><strong>${escapeHtml(patient.name)}</strong></div>
    <div class="info-item"><span>Patient ID</span><strong>${patient.userId}</strong></div>
    <div class="info-item"><span>Email</span><strong>${escapeHtml(patient.email || "-")}</strong></div>
    <div class="info-item"><span>Phone</span><strong>${escapeHtml(patient.phone || "-")}</strong></div>
    <div class="info-item"><span>Role</span><strong>${escapeHtml(patient.role || "PATIENT")}</strong></div>
    <div class="info-item"><span>Account Created</span><strong>${formatDateTime(patient.createdAt)}</strong></div>
    `;

    document.getElementById("patientDetailsPanel").classList.remove("hidden");
    window.scrollTo({ top: document.getElementById("patientDetailsPanel").offsetTop - 20, behavior: "smooth" });
}

async function initAppointments() {
    await loadAppointments();
    renderAppointments();

    document.getElementById("appointmentFilter").addEventListener("change", renderAppointments);
    document.getElementById("appointmentSearch").addEventListener("input", renderAppointments);
}

function renderAppointments() {
    const statusFilter = document.getElementById("appointmentFilter").value;
    const query = document.getElementById("appointmentSearch").value.toLowerCase();

    const rows = doctorState.appointments.filter(a => {
        const statusMatch = statusFilter === "ALL" || a.status === statusFilter;
        const text = `${a.patientName || ""} ${a.reason || ""}`.toLowerCase();
        return statusMatch && text.includes(query);
    });

setText("appointmentCount", `${rows.length} appointment${rows.length === 1 ? "" : "s"}`);

const tbody = document.getElementById("appointmentsTableBody");

if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No appointments found.</div></td></tr>`;
    return;
}

tbody.innerHTML = rows.map(a => `
<tr>
<td><strong>${escapeHtml(a.patientName)}</strong><small>ID: ${a.patientId}</small></td>
<td>${formatDateTime(a.appointmentDate)}</td>
<td>${escapeHtml(a.reason)}</td>
<td><span class="status status-${String(a.status).toLowerCase()}">${escapeHtml(a.status)}</span></td>
<td>
${a.status === "SCHEDULED" ? `
    <button class="table-button complete" data-complete="${a.appointmentId}">Complete</button>
    <button class="table-button cancel" data-cancel="${a.appointmentId}">Cancel</button>
    ` : `<span class="muted">No status action</span>`}
    </td>
    </tr>
    `).join("");

    tbody.querySelectorAll("[data-complete]").forEach(btn => {
        btn.addEventListener("click", () => updateAppointmentStatus(Number(btn.dataset.complete), "COMPLETED"));
    });

tbody.querySelectorAll("[data-cancel]").forEach(btn => {
    btn.addEventListener("click", () => { if(confirm("Cancel this appointment? The appointment will remain in history.")) updateAppointmentStatus(Number(btn.dataset.cancel), "CANCELLED"); });
});
}

async function updateAppointmentStatus(id, status) {
    try {
        await apiRequest(`/appointments/${id}`, {
            method: "PUT",
            body: JSON.stringify({ status })
        });
    showMessage(`Appointment updated to ${status}.`, "success");
    await loadAppointments();
    renderAppointments();
} catch (error) {
showMessage(error.message, "error");
}
}

async function initRecords() {
    await preparePatientWorkflow("recordPatient");
    setDateTimeDefault("recordDate");

    document.getElementById("loadRecords").addEventListener("click", loadRecords);
    document.getElementById("recordForm").addEventListener("submit", createMedicalRecord);
    await loadFromQuery("recordPatient", loadRecords);
}

async function loadRecords() {
    const patientId = Number(document.getElementById("recordPatient").value);
    if (!patientId) return showMessage("Select an authorized patient first.", "error");

    try {
        const records = await apiRequest(`/medical-records/patient/${patientId}`) || [];
        const container = document.getElementById("recordsList");

        if (!records.length) {
            container.innerHTML = `<div class="empty-state">No medical records found.</div>`;
            return;
        }

    container.innerHTML = records.map(r => `
    <article class="medical-card">
    <div class="card-top"><strong>${escapeHtml(r.diagnosis)}</strong><span>${formatDateTime(r.recordDate)}</span></div>
    <p><b>Treatment:</b> ${escapeHtml(r.treatment || "Not specified")}</p>
    <small>Doctor: ${escapeHtml(r.doctorName || "-")}</small>
    </article>
    `).join("");
} catch (error) {
showMessage(error.message, "error");
}
}

async function createMedicalRecord(event) {
    event.preventDefault();
    const patientId = Number(document.getElementById("recordPatient").value);

    if (!patientId) return showMessage("Select an authorized patient first.", "error");

    try {
        await apiRequest("/medical-records", {
            method: "POST",
            body: JSON.stringify({
                patientId,
                doctorId: doctorState.user.userId,
                diagnosis: document.getElementById("recordDiagnosis").value.trim(),
                treatment: document.getElementById("recordTreatment").value.trim(),
                recordDate: toBackendLocalDateTime(document.getElementById("recordDate").value)
            })
    });

event.target.reset();
setDateTimeDefault("recordDate");
showMessage("Medical record created successfully.", "success");
await loadRecords();
} catch (error) {
showMessage(error.message, "error");
}
}

async function initPrescriptions() {
    await preparePatientWorkflow("prescriptionPatient");
    document.getElementById("loadPrescriptions").addEventListener("click", loadPrescriptions);
    document.getElementById("prescriptionForm").addEventListener("submit", createPrescription);
    await loadFromQuery("prescriptionPatient", loadPrescriptions);
}

async function loadPrescriptions() {
    const patientId = Number(document.getElementById("prescriptionPatient").value);
    if (!patientId) return showMessage("Select an authorized patient first.", "error");

    try {
        const items = await apiRequest(`/prescriptions/patient/${patientId}`) || [];
        const container = document.getElementById("prescriptionsList");

        if (!items.length) {
            container.innerHTML = `<div class="empty-state">No prescriptions found.</div>`;
            return;
        }

    container.innerHTML = items.map(p => `
    <article class="medical-card">
    <div class="card-top"><strong>${escapeHtml(p.medication)}</strong><span>${escapeHtml(p.duration)}</span></div>
    <p><b>Dosage:</b> ${escapeHtml(p.dosage)}</p>
    <p><b>Frequency:</b> ${escapeHtml(p.frequency)}</p>
    <p><b>Instructions:</b> ${escapeHtml(p.instructions || "None")}</p>
    <small>Prescribed by: ${escapeHtml(p.doctorName || "-")}</small>
    </article>
    `).join("");
} catch (error) {
showMessage(error.message, "error");
}
}

async function createPrescription(event) {
    event.preventDefault();
    const patientId = Number(document.getElementById("prescriptionPatient").value);

    if (!patientId) return showMessage("Select an authorized patient first.", "error");

    try {
        await apiRequest("/prescriptions", {
            method: "POST",
            body: JSON.stringify({
                patientId,
                medication: document.getElementById("medication").value.trim(),
                dosage: document.getElementById("dosage").value.trim(),
                frequency: document.getElementById("frequency").value.trim(),
                duration: document.getElementById("duration").value.trim(),
                instructions: document.getElementById("instructions").value.trim()
            })
    });

event.target.reset();
showMessage("Prescription created successfully.", "success");
await loadPrescriptions();
} catch (error) {
showMessage(error.message, "error");
}
}

async function initLabs() {
    await preparePatientWorkflow("labPatient");
    setDateTimeDefault("reportDate");

    document.getElementById("loadLabs").addEventListener("click", loadLabs);
    document.getElementById("labForm").addEventListener("submit", createLabReport);
    await loadFromQuery("labPatient", loadLabs);
}

async function loadLabs() {
    const patientId = Number(document.getElementById("labPatient").value);
    if (!patientId) return showMessage("Select an authorized patient first.", "error");

    try {
        const reports = await apiRequest(`/lab-reports/patient/${patientId}`) || [];
        const container = document.getElementById("labsList");

        if (!reports.length) {
            container.innerHTML = `<div class="empty-state">No lab reports found.</div>`;
            return;
        }

    container.innerHTML = reports.map(r => `
    <article class="medical-card">
    <div class="card-top"><strong>${escapeHtml(r.testName)}</strong><span>${formatDateTime(r.reportDate)}</span></div>
    <p><b>Result:</b> ${escapeHtml(r.result)}</p>
    <p><b>Created by:</b> ${escapeHtml(r.createdByName || "-")} (${escapeHtml(r.createdByRole || "-")})</p>
    ${r.fileReference ? (isUploadedLabFile(r.fileReference) ? `<p><b>Report file:</b> <a href="#" data-lab-download="${escapeHtml(r.fileReference)}">View / Download</a></p>` : `<p><b>File reference:</b> ${escapeHtml(r.fileReference)}</p>`) : ""}
    </article>
    `).join("");
    container.querySelectorAll("[data-lab-download]").forEach(link => link.addEventListener("click", downloadLabFile));
} catch (error) {
showMessage(error.message, "error");
}
}

async function createLabReport(event) {
    event.preventDefault();
    const patientId = Number(document.getElementById("labPatient").value);

    if (!patientId) return showMessage("Select an authorized patient first.", "error");

    const button = event.submitter;
    try {
        if (button) button.disabled = true;
        const fileInput = document.getElementById("labFile");
        const file = fileInput?.files?.[0] || null;
        let fileReference = null;
        if (file) {
            document.getElementById("labFileStatus").textContent = "Uploading file...";
            const formData = new FormData();
            formData.append("file", file);
            const uploaded = await apiRequest("/lab-reports/upload", { method: "POST", body: formData });
            fileReference = uploaded.fileReference;
            document.getElementById("labFileStatus").textContent = `Attached: ${file.name}`;
        }
    await apiRequest("/lab-reports", {
        method: "POST",
        body: JSON.stringify({
            patientId,
            testName: document.getElementById("testName").value.trim(),
            result: document.getElementById("labResult").value.trim(),
            reportDate: toBackendLocalDateTime(document.getElementById("reportDate").value),
            fileReference
        })
});

event.target.reset();
const status = document.getElementById("labFileStatus");
if (status) status.textContent = "";
setDateTimeDefault("reportDate");
showMessage("Lab report added successfully.", "success");
await loadLabs();
} catch (error) {
showMessage(error.message, "error");
} finally {
if (button) button.disabled = false;
}
}

async function initHealth() {
    if (window.MPRanges) window.MPRanges.mount("#rangeReference");
    await preparePatientWorkflow("healthPatient");
    document.getElementById("loadHealth").addEventListener("click", loadHealth);
    document.getElementById("healthReadingForm")?.addEventListener("submit", createDoctorReading);
    setDateTimeDefault("doctorReadingDate");
    await loadFromQuery("healthPatient", loadHealth);
}

async function createDoctorReading(event){
    event.preventDefault();
    const patientId=Number(document.getElementById("healthPatient").value);
    if(!patientId) return showMessage("Select an authorized patient first.","error");
    const button=event.submitter;
    try{
        if(button) button.disabled=true;
        await apiRequest("/health-readings",{method:"POST",body:JSON.stringify({patientId,readingType:document.getElementById("doctorReadingType").value, value:document.getElementById("doctorReadingValue").value.trim(), unit:document.getElementById("doctorReadingUnit").value.trim()||null, recordedAt:document.getElementById("doctorReadingDate").value+":00"})});
        event.target.reset(); setDateTimeDefault("doctorReadingDate"); showMessage("Health reading added successfully.","success"); await loadHealth();
    }catch(error){showMessage(error.message,"error");}finally{if(button)button.disabled=false;}
}

async function loadHealth() {
    const patientId = Number(document.getElementById("healthPatient").value);
    if (!patientId) return showMessage("Select an authorized patient first.", "error");

    try {
        const [readings, alerts] = await Promise.all([
        apiRequest(`/health-readings/patient/${patientId}`),
        apiRequest(`/alerts/patient/${patientId}`)
        ]);

        renderHealthReadings(readings || []);
        renderAlerts(alerts || []);
    } catch (error) {
    showMessage(error.message, "error");
}
}

function renderHealthReadings(readings) {
    setText("healthReadingCount", readings.length);

    if (readings.length) {
        setText("latestReading", `${readings[0].readingType}: ${readings[0].value}${readings[0].unit ? ` ${readings[0].unit}` : ""}`);
        setText("latestReadingDate", formatDateTime(readings[0].recordedAt));
    } else {
    setText("latestReading", "-");
    setText("latestReadingDate", "-");
}

const container = document.getElementById("healthReadingsList");

if (!readings.length) {
    container.innerHTML = `<div class="empty-state">No health readings found.</div>`;
    return;
}

container.innerHTML = readings.map(r => `
<article class="reading-card">
<div>
<strong>${escapeHtml(r.readingType)}</strong>
<span>${formatDateTime(r.recordedAt)}</span>
</div>
<b>${escapeHtml(r.value)} ${escapeHtml(r.unit || "")}</b>
</article>
`).join("");
}

function renderAlerts(alerts) {
    setText("healthAlertCount", alerts.length);
    const container = document.getElementById("alertsList");

    if (!alerts.length) {
        container.innerHTML = `<div class="empty-state">No monitoring alerts found.</div>`;
        return;
    }

container.innerHTML = alerts.map(a => `
<article class="alert-card alert-${String(a.status).toLowerCase()}">
<div class="card-top">
<strong>${escapeHtml(a.status)}</strong>
<span>${formatDateTime(a.createdAt)}</span>
</div>
<p>${escapeHtml(a.message)}</p>
<div class="alert-actions">${a.resolved ? '<span class="status status-completed">Resolved</span>' : `<button type="button" class="secondary-button small" data-resolve-alert="${a.alertId}">Resolve</button>`}</div>
</article>
`).join("");
container.querySelectorAll("[data-resolve-alert]").forEach(button=>button.addEventListener("click",async()=>{if(!confirm("Resolve this monitoring alert?"))return;button.disabled=true;try{await apiRequest(`/alerts/${button.dataset.resolveAlert}`,{method:"PUT"});await loadHealth();}catch(e){showMessage(e.message,"error");button.disabled=false;}}));
}

function isUploadedLabFile(ref) {
    if (!ref || ref.includes("/") || ref.includes("\\")) return false;
    return /\.(pdf|jpg|jpeg|png)$/i.test(ref);
}

async function downloadLabFile(event) {
    event.preventDefault();
    const filename = event.currentTarget.dataset.labDownload;
    if (!filename) return;
    try {
        const token = MPAuth.getToken();
        const response = await fetch(`${window.MediPulseConfig.API_BASE_URL}/lab-reports/files/${encodeURIComponent(filename)}`, {
            headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
    if (!response.ok) throw new Error(`Could not download file (${response.status})`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
} catch (error) {
showMessage(error.message, "error");
}
}

async function preparePatientWorkflow(selectId) {
    await loadAppointments();
    await loadAuthorizedPatients();
    populatePatientSelect(selectId);
}

async function loadFromQuery(selectId, callback) {
    const id = new URLSearchParams(window.location.search).get("patientId");
    if (!id) return;

    const select = document.getElementById(selectId);
    if (!select) return;

    const exists = [...select.options].some(option => option.value === id);
    if (!exists) {
        showMessage("The requested patient is not in your authorized patient list.", "error");
        return;
    }

select.value = id;
await callback();
}

function setDateTimeDefault(id) {
    const input = document.getElementById(id);
    if (input && !input.value) {
        input.value = toLocalDateTimeInputValue();
    }
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value ?? "-";
}
