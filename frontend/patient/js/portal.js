(function () {

    function pathBase() {
        return location.pathname.includes("/patient/pages/")
        ? "../"
        : "";
    }


function sidebar() {

    const base = pathBase();

    return `
    <aside class="dashboard-sidebar">

    <div class="dashboard-brand">

    <div class="brand-icon">

    <img
    class="mp-logo"
    src="${base}../assets/medipulse-logo.png"
    alt="MediPulse"
    >

    </div>

    <div>

    <h2>MediPulse</h2>

    <span>Patient Portal</span>

    </div>

    </div>


    <nav class="dashboard-nav">

    <a
    href="${base}index.html"
    class="nav-item"
    data-pnav="dashboard"
    >
    <span aria-hidden="true">⌂</span>
    <span>Dashboard</span>
    </a>


    <a
    href="${base}pages/profile.html"
    class="nav-item"
    data-pnav="profile"
    >
    <span aria-hidden="true">●</span>
    <span>My Profile</span>
    </a>


    <a
    href="${base}pages/appointments.html"
    class="nav-item"
    data-pnav="appointments"
    >
    <span aria-hidden="true">▣</span>
    <span>Appointments</span>
    </a>


    <a
    href="${base}pages/data.html?type=records"
    class="nav-item"
    data-pnav="records"
    >
    <span aria-hidden="true">▤</span>
    <span>Medical Records</span>
    </a>


    <a
    href="${base}pages/data.html?type=prescriptions"
    class="nav-item"
    data-pnav="prescriptions"
    >
    <span aria-hidden="true">✚</span>
    <span>Prescriptions</span>
    </a>


    <a
    href="${base}pages/lab-reports.html"
    class="nav-item"
    data-pnav="labs"
    >
    <span aria-hidden="true">◇</span>
    <span>Lab Reports</span>
    </a>


    <a
    href="${base}pages/data.html?type=health"
    class="nav-item"
    data-pnav="health"
    >
    <span aria-hidden="true">♥</span>
    <span>Health Monitoring</span>
    </a>


    <a
    href="${base}pages/alerts.html"
    class="nav-item"
    data-pnav="alerts"
    >
    <span aria-hidden="true">●</span>
    <span>Alerts</span>
    </a>

    </nav>


    <div class="patient-sidebar-actions">

    <button
    id="logoutButton"
    class="logout-button"
    type="button"
    >
    Logout
    </button>

    </div>

    </aside>
    `;
}


function escapeHtml(value) {

    return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function formatAppointmentDate(value) {

    if (!value) {
        return "-";
    }

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
    return String(value);
}

return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
});

}


async function loadUpcomingAppointments(patientId) {

    const container =
    document.getElementById("upcomingAppointments");

    if (!container) {
        return;
    }


try {

    const list =
    await MPAuth.fetchJson("/appointments") || [];


    const now = new Date();


    const upcoming = list

    .filter(appointment =>
    String(appointment.patientId) ===
    String(patientId)
    )

    .filter(appointment =>
    String(appointment.status || "")
    .toUpperCase() === "SCHEDULED"
    )

    .filter(appointment => {

        const appointmentDate =
        new Date(appointment.appointmentDate);

        return (
        !Number.isNaN(
        appointmentDate.getTime()
        ) &&
        appointmentDate > now
        );

    })

.sort((a, b) =>
new Date(a.appointmentDate) -
new Date(b.appointmentDate)
);


if (!upcoming.length) {

    container.innerHTML = `

    <div class="appointment-placeholder">

    <div class="large-card-icon">
    ▣
    </div>

    <div>

    <h3>No upcoming appointments</h3>

    <p>
    Your upcoming appointments will appear here.
    </p>

    </div>

    </div>


    <a
    href="pages/appointments.html"
    class="primary-dashboard-button"
    >
    Book an Appointment
    </a>

    `;

    return;
}


container.innerHTML = `

<div class="upcoming-appointments-list">

${upcoming.map(appointment => {

        const appointmentId =
        appointment.id ??
        appointment.appointmentId ??
        "-";

        const doctor =
        appointment.doctorName ||
        (
        appointment.doctorId
        ? `Doctor #${appointment.doctorId}`
        : "Doctor"
        );

        const specialization =
        appointment.specialization ||
        "General Medicine";

        const reason =
        appointment.reason ||
        "Regular Checkup";

        const date =
        formatAppointmentDate(
        appointment.appointmentDate
        );

        return `

        <article
        class="dashboard-upcoming-appointment"
        >

        <div class="large-card-icon">
        ▣
        </div>


        <div class="upcoming-appointment-details">

        <h3>
        ${escapeHtml(doctor)}
        </h3>


        <p>
        <strong>
        ${escapeHtml(
            specialization
            )}
        </strong>
        </p>


        <p>
        ${escapeHtml(date)}
        </p>


        <p>
        Reason:
        ${escapeHtml(reason)}
        </p>

        </div>

        </article>

        `;

    }).join("")}

</div>


<a
href="pages/appointments.html"
class="primary-dashboard-button"
>
View All Appointments
</a>

`;

} catch (error) {

console.error(
"Unable to load upcoming appointments:",
error
);


container.innerHTML = `

<div class="appointment-placeholder">

<div class="large-card-icon">
!
</div>

<div>

<h3>
Unable to load appointments
</h3>

<p>
${escapeHtml(
    error.message ||
    "Please try again later."
    )}
</p>

</div>

</div>

`;

}

}


function healthStatusFor(type, value) {
    const v = Number(value);
    if (!Number.isFinite(v)) return "No data";
    switch (String(type).toUpperCase()) {
        case "HEART_RATE":
        if (v < 50 || v > 120) return "Attention";
        if (v < 60 || v > 100) return "Warning";
        return "Normal";
        case "SYSTOLIC_BP":
        if (v >= 180 || v < 90) return "Attention";
        if (v >= 140 || v < 100) return "Warning";
        return "Normal";
        case "DIASTOLIC_BP":
        if (v >= 120 || v < 60) return "Attention";
        if (v >= 90 || v < 65) return "Warning";
        return "Normal";
        case "BLOOD_GLUCOSE":
        if (v >= 300 || v < 54) return "Attention";
        if (v >= 200 || v < 70) return "Warning";
        return "Normal";
        case "SPO2":
        if (v < 90) return "Attention";
        if (v < 95) return "Warning";
        return "Normal";
        case "TEMPERATURE":
        if (v >= 39 || v < 35) return "Attention";
        if (v >= 38 || v < 36) return "Warning";
        return "Normal";
        default:
        return "Normal";
    }
}


async function loadHealthOverview(patientId) {
    const bpValue = document.getElementById("healthBPValue");
    const bpStatus = document.getElementById("healthBPStatus");
    const hrValue = document.getElementById("healthHRValue");
    const hrStatus = document.getElementById("healthHRStatus");
    const glucoseValue = document.getElementById("healthGlucoseValue");
    const glucoseStatus = document.getElementById("healthGlucoseStatus");

    if (!bpValue && !hrValue && !glucoseValue) {
        return;
    }

try {
    const readings =
    await MPAuth.fetchJson(`/health-readings/patient/${patientId}`) || [];

    const latestByType = {};
    readings.forEach(r => {
        const t = String(r.readingType || "").toUpperCase();
        if (t && !latestByType[t]) {
            latestByType[t] = r;
        }
});

const sys = latestByType["SYSTOLIC_BP"];
const dia = latestByType["DIASTOLIC_BP"];
if (bpValue) {
    if (sys || dia) {
        const sysText = sys ? `${sys.value}${sys.unit ? " " + sys.unit : ""}` : "--";
        const diaText = dia ? `${dia.value}${dia.unit ? " " + dia.unit : ""}` : "--";
        bpValue.textContent = `${sysText} / ${diaText}`;
    } else {
    bpValue.textContent = "--";
}
}
if (bpStatus) {
    const s = sys ? healthStatusFor("SYSTOLIC_BP", sys.value) : "No data";
    const d = dia ? healthStatusFor("DIASTOLIC_BP", dia.value) : "No data";
    bpStatus.textContent =
    (s === "No data" && d === "No data") ? "No data"
    : (s === "Attention" || d === "Attention") ? "Attention"
    : (s === "Warning" || d === "Warning") ? "Warning" : "Normal";
}

const hr = latestByType["HEART_RATE"];
if (hrValue) {
    hrValue.textContent = hr
    ? `${hr.value}${hr.unit ? " " + hr.unit : ""}`
    : "--";
}
if (hrStatus) {
    hrStatus.textContent = hr
    ? healthStatusFor("HEART_RATE", hr.value)
    : "No data";
}

const glucose = latestByType["BLOOD_GLUCOSE"];
if (glucoseValue) {
    glucoseValue.textContent = glucose
    ? `${glucose.value}${glucose.unit ? " " + glucose.unit : ""}`
    : "--";
}
if (glucoseStatus) {
    glucoseStatus.textContent = glucose
    ? healthStatusFor("BLOOD_GLUCOSE", glucose.value)
    : "No data";
}
} catch (error) {
console.error("Unable to load health overview:", error);
}
}


async function loadAlertsOverview(patientId) {
    const container = document.getElementById("alertsOverview");

    if (!container) {
        return;
    }

try {
    const alerts =
    await MPAuth.fetchJson(`/alerts/patient/${patientId}`) || [];

    const active = alerts.filter(a => !a.resolved);

    if (!active.length) {
        container.innerHTML = `
        <div class="dashboard-card empty-alert-card">
        <div class="large-card-icon">●</div>
        <div>
        <h3>No new alerts</h3>
        <p>You currently have no new monitoring alerts.</p>
        </div>
        </div>
        `;
        return;
    }

container.innerHTML = active.slice(0, 5).map(a => `
<div class="dashboard-card empty-alert-card">
<div class="large-card-icon">●</div>
<div>
<h3>${escapeHtml(String(a.status || "Alert").toUpperCase())}</h3>
<p>${escapeHtml(a.message || "Monitoring alert.")}</p>
<p><small>${escapeHtml(a.createdAt ? new Date(a.createdAt).toLocaleString("en-IN") : "")}</small></p>
</div>
</div>
`).join("") + `
<a href="pages/alerts.html" class="primary-dashboard-button">
View All Alerts (${active.length})
</a>
`;
} catch (error) {
console.error("Unable to load alerts overview:", error);
container.innerHTML = `
<div class="dashboard-card empty-alert-card">
<div class="large-card-icon">!</div>
<div>
<h3>Unable to load alerts</h3>
<p>${escapeHtml(error.message || "Please try again later.")}</p>
</div>
</div>
`;
}
}


function init() {

    const loginTarget =
    location.pathname.includes("/patient/pages/")
    ? "login.html"
    : "pages/login.html";


    const user =
    MPAuth.requireRole(
    "PATIENT",
    loginTarget
    );


    if (!user) {
        return;
    }


document.documentElement.dataset.theme =
"light";


if (!document.querySelector(".dashboard-sidebar")) {

    document.body.insertAdjacentHTML(
    "afterbegin",
    sidebar()
    );


    const main =
    document.querySelector(
    "main,.profile-wrapper"
    );


    if (main) {
        main.classList.add(
        "patient-with-sidebar"
        );
    }

}


const active =
location.pathname.includes("profile")
? "profile"

: location.pathname.includes("appointments")
? "appointments"

: location.search.includes("type=records")
? "records"

: location.search.includes("type=prescriptions")
? "prescriptions"

: location.search.includes("type=health")
? "health"

: location.search.includes("alerts")
? "alerts"

: (
location.pathname.endsWith("/patient/") ||
location.pathname.endsWith("/patient/index.html")
)
? "dashboard"

: "";


const activeLink =
document.querySelector(
`[data-pnav="${active}"]`
);


if (activeLink) {
    activeLink.classList.add("active");
}


const name =
document.getElementById("patientName");


if (name) {
    name.textContent =
    user.name || "Patient";
}


const logout =
document.getElementById("logoutButton");


if (
logout &&
!logout.dataset.bound
) {

    logout.dataset.bound = "1";


    logout.addEventListener(
    "click",
    () => MPAuth.logout(loginTarget)
    );

}


if (
location.pathname.endsWith("/patient/") ||
location.pathname.endsWith("/patient/index.html")
) {

    loadUpcomingAppointments(
    user.userId
    );

    loadHealthOverview(
    user.userId
    );

    loadAlertsOverview(
    user.userId
    );

}

}


document.addEventListener(
"DOMContentLoaded",
init
);

})();
