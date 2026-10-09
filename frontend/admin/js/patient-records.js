document.body.dataset.active = "patient-records";


let allRecords = [];


function timeCutoff() {

    const value =
    document
    .getElementById("timeFilter")
    .value;

    if (value === "all") {
        return null;
    }

const now = new Date();

if (value === "month") {
    return new Date(
    now.getFullYear(),
    now.getMonth(),
    1
    );
}

const months = Number(value);

if (!Number.isFinite(months)) {
    return null;
}

const cutoff = new Date(now);
cutoff.setMonth(cutoff.getMonth() - months);

return cutoff;

}


async function loadRecords() {

    const root =
    document.getElementById("recordList");


    root.innerHTML = `

    <div class="loading-card">

    <i class="fa-solid fa-spinner fa-spin"></i>

    Loading patient records...

    </div>

    `;


    try {

        const users =
        await apiFetch("/users");


        allRecords =
        users.filter(
        user =>
        user.role === "PATIENT"
        );


        applyRecordFilters();


    } catch (error) {

    showInline(
    "recordsMessage",
    error.message,
    "error"
    );


    root.innerHTML = `

    <div class="error-card">

    <i class="fa-solid fa-circle-exclamation"></i>

    <strong>
    Unable to load patient records
    </strong>

    <p>
    ${escapeHtml(error.message)}
    </p>

    </div>

    `;

}

}


function applyRecordFilters() {

    const query =
    document
    .getElementById("searchRecord")
    .value
    .trim()
    .toLowerCase();

    const status =
    document
    .getElementById("statusFilter")
    .value;

    const cutoff =
    timeCutoff();


    const filtered =
    allRecords.filter(patient => {

        if (status === "active" && patient.treatmentCompleted === true) {
            return false;
        }

    if (status === "done" && patient.treatmentCompleted !== true) {
        return false;
    }

if (cutoff && patient.createdAt) {

    const registered = new Date(patient.createdAt);

    if (
    Number.isNaN(registered.getTime()) ||
    registered < cutoff
    ) {
        return false;
    }

}

if (!query) {
    return true;
}

return [

patient.name,

patient.email,

patient.phone,

patient.userId

]
.some(
value =>
String(
value ?? ""
)
.toLowerCase()
.includes(query)
);

});


document.getElementById("recordCount").textContent =
allRecords.length;


renderRecords(filtered);

}


function renderRecords(list) {

    const root =
    document.getElementById("recordList");

    const searchInfo =
    document.getElementById("recordSearchInfo");


    if (!list.length) {

        root.innerHTML = `

        <div class="patient-empty-state">

        <div class="patient-empty-icon">

        <i class="fa-solid fa-user"></i>

        </div>


        <h3>
        No patient records found
        </h3>


        <p>
        Try another search or filter.
        </p>

        </div>

        `;


        if (searchInfo) {
            searchInfo.textContent = "No patient records match the current filters.";
        }


    return;

}


if (searchInfo) {

    const total = allRecords.length;
    const visible = list.length;

    searchInfo.textContent =
    visible === total
    ? `Showing all ${total} patient record${total === 1 ? "" : "s"}`
    : `Showing ${visible} of ${total} patient records`;

}


root.innerHTML =
list
.map(patient => createRecordCard(patient))
.join("");


root.querySelectorAll("[data-record-id]").forEach(button => button.addEventListener("click", () => viewTreatments(Number(button.dataset.recordId))));
root.querySelectorAll("[data-treatment-toggle]").forEach(button => button.addEventListener("click", () => toggleTreatment(Number(button.dataset.treatmentToggle), button.dataset.completed === "true")));

}


function createRecordCard(patient) {

    const name =
    patient.name || "Patient";


    const initial =
    name
    .charAt(0)
    .toUpperCase();

    const done =
    patient.treatmentCompleted === true;


    return `

    <article class="patient-card">


    <!-- HEADER -->

    <div class="patient-card-header">

    <div class="patient-avatar">

    ${escapeHtml(initial)}

    </div>


    <div class="patient-identity">

    <h3>

    ${escapeHtml(name)}

    </h3>


    <span class="patient-id">

    <i class="fa-solid fa-id-card"></i>

    Patient ID
    ${escapeHtml(
        patient.userId
        )}

    </span>

    </div>

    </div>


    <!-- TREATMENT STATUS -->

    <div class="patient-status">
    <span class="patient-status-dot"></span>
    <span>${done ? "Treatment Done" : "Active Patient"}</span>
    </div>


    <!-- CONTACT -->

    <div class="patient-contact">

    <div>

    <i class="fa-solid fa-envelope"></i>

    <span>

    ${escapeHtml(
        patient.email ||
        "No email"
        )}

    </span>

    </div>


    <div>

    <i class="fa-solid fa-phone"></i>

    <span>

    ${escapeHtml(
        patient.phone ||
        "No phone"
        )}

    </span>

    </div>

    </div>


    <!-- CREATED -->

    <div class="patient-created">

    <i class="fa-regular fa-calendar"></i>

    <div>

    <span>
    Registered
    </span>

    <strong>

    ${formatDate(
        patient.createdAt
        )}

    </strong>

    </div>

    </div>


    <!-- ACTION -->

    <div class="patient-action-row">
    <button class="patient-details-btn" type="button" data-record-id="${patient.userId}">View Treatments <i class="fa-solid fa-arrow-right"></i></button>
    <button class="btn small ${done ? "danger" : "primary"}" type="button" data-treatment-toggle="${patient.userId}" data-completed="${done}">${done ? "Reopen Treatment" : "Treatment Done"}</button>
    </div>


    </article>

    `;

}


async function viewTreatments(id) {

    const patient =
    allRecords.find(
    item =>
    Number(item.userId) ===
    Number(id)
    );


    if (!patient) {
        return;
    }


showModal(`

<button
class="modal-close"
data-close
type="button"
>
×
</button>


<div class="patient-modal-header">

<div class="patient-modal-avatar">

${escapeHtml(
    (patient.name || "P")
    .charAt(0)
    .toUpperCase()
    )}

</div>


<div>

<p class="eyebrow">
TREATMENT HISTORY
</p>


<h2>

${escapeHtml(
    patient.name
    )}

</h2>


<p class="muted">

Every treatment for this patient, newest first.

</p>

</div>

</div>


<div
id="treatmentHistory"
class="stack-list"
>

<div class="loading-card">

<i class="fa-solid fa-spinner fa-spin"></i>

Loading treatments...

</div>

</div>


<div class="patient-modal-actions"><button class="btn" data-close type="button">Close</button></div>

`);


try {

    const results = await Promise.all([
    apiFetch("/appointments"),
    apiFetch(`/medical-records/patient/${id}`),
    apiFetch(`/prescriptions/patient/${id}`),
    apiFetch(`/lab-reports/patient/${id}`)
    ]);

    const appointments = (results[0] || []).filter(a => String(a.patientId) === String(id));
    const records = results[1] || [];
    const prescriptions = results[2] || [];
    const labs = results[3] || [];


    const box = document.getElementById("treatmentHistory");

    if (!box) {
        return;
    }

if (!appointments.length && !records.length && !prescriptions.length && !labs.length) {

    box.innerHTML = `

    <div class="empty-card">

    <i class="fa-solid fa-circle-check"></i>

    <h3>No treatments recorded</h3>

    <p>
    This patient has no appointments, records, prescriptions or lab reports yet.
    </p>

    </div>

    `;

    return;

}


box.innerHTML = `

${appointments.length ? `

    <h3>
    <i class="fa-solid fa-calendar"></i>
    Appointments (${appointments.length})
    </h3>

    <div class="table-scroll">
    <table>
    <thead><tr><th>Reason</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
    <tbody>
    ${appointments.map(a => `
        <tr>
        <td>${escapeHtml(a.reason || "Appointment")}</td>
        <td>${escapeHtml(a.doctorName || "-")}</td>
        <td>${formatDate(a.appointmentDate)}</td>
        <td>${escapeHtml(String(a.status || "-"))}</td>
        </tr>
        `).join("")}
        </tbody>
        </table>
        </div>

        ` : ""}


        ${records.length ? `

            <h3>
            <i class="fa-solid fa-notes-medical"></i>
            Medical Records (${records.length})
            </h3>

            <div class="table-scroll">
            <table>
            <thead><tr><th>Diagnosis</th><th>Treatment</th><th>Doctor</th><th>Date</th></tr></thead>
            <tbody>
            ${records.map(r => `
                <tr>
                <td>${escapeHtml(r.diagnosis || "Record")}</td>
                <td>${escapeHtml(r.treatment || "-")}</td>
                <td>${escapeHtml(r.doctorName || "-")}</td>
                <td>${formatDate(r.recordDate)}</td>
                </tr>
                `).join("")}
                </tbody>
                </table>
                </div>

                ` : ""}


                ${prescriptions.length ? `

                    <h3>
                    <i class="fa-solid fa-prescription"></i>
                    Prescriptions (${prescriptions.length})
                    </h3>

                    <div class="table-scroll">
                    <table>
                    <thead><tr><th>Medication</th><th>Dosage</th><th>Doctor</th></tr></thead>
                    <tbody>
                    ${prescriptions.map(p => `
                        <tr>
                        <td>${escapeHtml(p.medication || "Prescription")}</td>
                        <td>${escapeHtml(p.dosage || "-")}</td>
                        <td>${escapeHtml(p.doctorName || "-")}</td>
                        </tr>
                        `).join("")}
                        </tbody>
                        </table>
                        </div>

                        ` : ""}


                        ${labs.length ? `

                            <h3>
                            <i class="fa-solid fa-flask"></i>
                            Lab Reports (${labs.length})
                            </h3>

                            <div class="table-scroll">
                            <table>
                            <thead><tr><th>Test</th><th>Result</th><th>Created By</th><th>Date</th><th>File</th></tr></thead>
                            <tbody>
                            ${labs.map(l => `
                                <tr>
                                <td>${escapeHtml(l.testName || "Lab Report")}</td>
                                <td>${escapeHtml(l.result || "-")}</td>
                                <td>${escapeHtml(l.createdByName || "-")}</td>
                                <td>${formatDate(l.reportDate)}</td>
                                <td>
                                ${l.fileReference && !String(l.fileReference).includes("/") ? `
                                    <a href="#" data-lab-file="${escapeHtml(l.fileReference)}">View</a>
                                    ` : escapeHtml(l.fileReference || "-")}
                                    </td>
                                    </tr>
                                    `).join("")}
                                    </tbody>
                                    </table>
                                    </div>

                                    ` : ""}

                                    `;


                                    box.querySelectorAll("[data-lab-file]").forEach(link => link.addEventListener("click", async (event) => {
                                        event.preventDefault();
                                        try {
                                            const token = getToken();
                                            const response = await fetch(`${API_BASE_URL}/lab-reports/files/${encodeURIComponent(link.dataset.labFile)}`, {
                                                headers: token ? { "Authorization": `Bearer ${token}` } : {}
                                            });
                                        if (!response.ok) throw new Error(`Could not open file (${response.status})`);
                                        const blob = await response.blob();
                                        const url = URL.createObjectURL(blob);
                                        window.open(url, "_blank");
                                        setTimeout(() => URL.revokeObjectURL(url), 60000);
                                    } catch (err) {
                                    showInline("recordsMessage", err.message, "error");
                                }
                        }));


                } catch (error) {

                const box = document.getElementById("treatmentHistory");

                if (box) {

                    box.innerHTML = `

                    <div class="error-card">

                    ${escapeHtml(error.message)}

                    </div>

                    `;

                }

        }

}


async function toggleTreatment(id, currentlyDone) {

    const action = currentlyDone ? "reopen" : "mark as done";

    if (!confirm(`Are you sure you want to ${action} this patient's treatment?`)) {
        return;
    }

try {

    await apiFetch(
    `/users/${id}/treatment?completed=${!currentlyDone}`,
    { method: "PATCH" }
    );

    await loadRecords();

    showInline(
    "recordsMessage",
    currentlyDone ? "Treatment reopened." : "Treatment marked as done.",
    "success"
    );

} catch (error) {

showInline(
"recordsMessage",
error.message,
"error"
);

}

}


document
.getElementById("searchRecord")
.addEventListener("input", applyRecordFilters);


document
.getElementById("timeFilter")
.addEventListener("change", applyRecordFilters);


document
.getElementById("statusFilter")
.addEventListener("change", applyRecordFilters);


document
.getElementById("clearRecordSearch")
.addEventListener("click", () => {
    document.getElementById("searchRecord").value = "";
    document.getElementById("timeFilter").value = "all";
    document.getElementById("statusFilter").value = "all";
    applyRecordFilters();
    document.getElementById("searchRecord").focus();
});


loadRecords();
