document.body.dataset.active = "alerts";

let patients = [];


async function loadPatients() {

    try {

        const users = await apiFetch("/users");

        patients = users.filter(
        u => u.role === "PATIENT"
        );

        document.getElementById("alertPatientSelect").innerHTML =
        `<option value="">-- Select Patient --</option>` +

        patients.map(p =>
        `<option value="${p.userId}">
        ${escapeHtml(p.name)} (ID: ${p.userId})
        </option>`
        ).join("");

    } catch (e) {

    document.getElementById("alertPatientSelect").innerHTML =
    `<option value="">Unable to load patients</option>`;

}

}


async function loadAlerts() {

    const id =
    document.getElementById("alertPatientSelect").value;


    const root =
    document.getElementById("alertsContainer");


    document.getElementById("alertPageStatus").textContent =
    id ? "Loading..." : "Select Patient";

    document.getElementById("alertPageCount").textContent =
    "0";

    document.getElementById("alertPageType").textContent =
    "—";


    if (!id) {

        root.innerHTML = `
        <div class="empty-card">

        <i class="fa-solid fa-bell"></i>

        Select a patient to load alerts.

        </div>
        `;

        document.getElementById("alertsSummary").textContent =
        "Select a patient.";

        return;

    }


const patient =
patients.find(
x => String(x.userId) === id
);


document.getElementById("alertsSummary").innerHTML = `

<strong>
${escapeHtml(patient.name)}
</strong>

<span>
${escapeHtml(patient.email)}
</span>

<span>
Patient ID: ${patient.userId}
</span>

`;


root.innerHTML = `
<div class="loading-card">

<i class="fa-solid fa-spinner fa-spin"></i>

Loading alerts...

</div>
`;


try {

    const alerts =
    await apiFetch(
    `/alerts/patient/${id}`
    );


    document.getElementById("alertPageCount").textContent =
    alerts.length;


    if (!alerts.length) {

        document.getElementById("alertPageStatus").textContent =
        "All Clear";

        document.getElementById("alertPageType").textContent =
        "No Alerts";


        root.innerHTML = `
        <div class="empty-card">

        <i class="fa-solid fa-circle-check"></i>

        <h3>No monitoring alerts</h3>

        <p>
        No alerts were found for this patient.
        </p>

        </div>
        `;

        return;

    }


const statuses =
alerts.map(
a => String(a.status).toUpperCase()
);


let overallStatus = "NORMAL";


if (statuses.includes("ATTENTION")) {

    overallStatus = "ATTENTION";

} else if (statuses.includes("WARNING")) {

overallStatus = "WARNING";

}


document.getElementById("alertPageStatus").textContent =
overallStatus;


document.getElementById("alertPageType").textContent =
String(alerts[0].status).toUpperCase();


root.innerHTML = alerts.map(a => {

    const status =
    String(a.status).toLowerCase();


    return `

    <article class="alert-card ${status}">

    <div class="alert-top">

    <span class="status ${status}">

    ${escapeHtml(
        String(a.status).toUpperCase()
        )}

    </span>

    <span>
    ${formatDate(a.createdAt)}
    </span>

    </div>


    <h3>

    <i class="fa-solid fa-shield-heart"></i>

    Monitoring Alert

    </h3>


    <p>
    ${escapeHtml(a.message)}
    </p>


    <small>
    Alert ID: ${a.alertId}
    </small>


    <div class="alert-actions">
    ${a.resolved
        ? '<span class="status completed">Resolved</span>'
        : `<button class="btn small" data-resolve="${a.alertId}"><i class="fa-solid fa-check"></i> Resolve</button>`}
    </div>

    </article>

    `;

}).join("");


root.querySelectorAll("[data-resolve]").forEach(button => {
    button.addEventListener("click", async () => {
        if (!confirm("Resolve this monitoring alert?")) return;
        button.disabled = true;
        try {
            await apiFetch(`/alerts/${button.dataset.resolve}`, { method: "PUT" });
            await loadAlerts();
        } catch (err) {
        alert(err.message);
        button.disabled = false;
    }
});
});


} catch (e) {

document.getElementById("alertPageStatus").textContent =
"Error";


document.getElementById("alertPageCount").textContent =
"—";


document.getElementById("alertPageType").textContent =
"—";


root.innerHTML = `
<div class="error-card">

${escapeHtml(e.message)}

</div>
`;

}

}


document
.getElementById("alertPatientSelect")
.addEventListener(
"change",
loadAlerts
);


document
.getElementById("refreshAlerts")
.addEventListener(
"click",
loadAlerts
);


loadPatients();
