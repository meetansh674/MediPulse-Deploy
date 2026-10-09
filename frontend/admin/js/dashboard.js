document.body.dataset.active = "dashboard";

let analyticsChart;


async function loadDashboard() {

    const grid = document.getElementById("statsGrid");

    try {


        const stats = await apiFetch("/admin/stats");


        const cards = [

        ["Patients", stats.totalPatients, "patients"],

        ["Doctors", stats.totalDoctors, "doctors"],

        ["Appointments", stats.totalAppointments, "appointments"],

        ["Medical Records", stats.totalMedicalRecords, "records"],

        ["Prescriptions", stats.totalPrescriptions, "prescriptions"],

        ["Lab Reports", stats.totalLabReports, "labs"],

        ["Health Readings", stats.totalHealthReadings, "monitoring"],

        ["Alerts", stats.totalAlerts, "alerts"]

        ];


        const icons = {

            patients: "fa-users",

            doctors: "fa-user-doctor",

            appointments: "fa-calendar-check",

            records: "fa-file-medical",

            prescriptions: "fa-prescription-bottle-medical",

            labs: "fa-flask",

            monitoring: "fa-heart-pulse",

            alerts: "fa-triangle-exclamation"

        };


    const links = {

        patients: "patients.html",

        doctors: "doctors.html",

        appointments: "appointments.html",

        monitoring: "monitoring.html",

        alerts: "alerts.html"

    };


grid.innerHTML = cards.map(([label, value, key]) => {

    return `
    <a class="stat-card" href="${links[key] || '#'}">

    <div class="stat-icon">

    <i class="fa-solid ${icons[key]}"></i>

    </div>

    <div class="stat-info">

    <span>${label}</span>

    <strong>${value}</strong>

    </div>

    </a>
    `;

}).join("");


const totalRecords =
stats.totalMedicalRecords +
stats.totalPrescriptions +
stats.totalLabReports +
stats.totalHealthReadings;


document.getElementById("totalRecords").textContent =
totalRecords;


const monitoringStatus =
stats.totalHealthReadings > 0
? "Active"
: "No Data";


document.getElementById("monitoringStatus").textContent =
monitoringStatus;


const alertStatus =
stats.totalAlerts > 0
? "Attention"
: "All Clear";


document.getElementById("alertStatus").textContent =
alertStatus;


document.getElementById("alertDescription").textContent =
stats.totalAlerts > 0
? `${stats.totalAlerts} alert(s) require review`
: "No active monitoring alerts";


const alertCenter =
document.getElementById("dashboardAlertCenter");


if (alertCenter) {

    if (stats.totalAlerts > 0) {

        alertCenter.className =
        "dashboard-alert alert-attention";

        alertCenter.innerHTML = `
        <div>

        <i class="fa-solid fa-triangle-exclamation"></i>

        <strong>
        ${stats.totalAlerts} monitoring alert(s) require review
        </strong>

        <p>
        Please open the Alert Center to review
        patient monitoring flags.
        </p>

        </div>
        `;

    } else {

    alertCenter.className =
    "dashboard-alert alert-clear";

    alertCenter.innerHTML = `
    <div>

    <i class="fa-solid fa-circle-check"></i>

    <strong>
    All Clear
    </strong>

    <p>
    No active monitoring alerts were found.
    </p>

    </div>
    `;

}

}


const canvas =
document.getElementById("analyticsChart");


if (analyticsChart) {

    analyticsChart.destroy();

}


analyticsChart = new Chart(canvas, {

    type: "bar",

    data: {

        labels: cards.map(c => c[0]),

        datasets: [{

            label: "Total Count",

            data: cards.map(c => c[1]),

            borderWidth: 0,

            borderRadius: 8,

            maxBarThickness: 32

        }]

},


options: {

    indexAxis: "y",

    responsive: true,

    maintainAspectRatio: false,

    animation: {

        duration: 700

    },


plugins: {

    legend: {

        display: false

    },


tooltip: {

    displayColors: false,

    callbacks: {

        label: function(context) {

            return " Total: " + context.raw;

        }

}

}

},


scales: {

    x: {

        beginAtZero: true,

        ticks: {

            precision: 0,

            stepSize: 1,

            color: "#64748b"

        },

    grid: {

        color: "#eef2f7",

        drawBorder: false

    }

},


y: {

    ticks: {

        color: "#334155",

        font: {

            size: 13,

            weight: "600"

        }

},

grid: {

    display: false

}

}

}

}

});

}


catch (error) {

    grid.innerHTML =
    `<div class="error-card">${escapeHtml(error.message)}</div>`;

}

}


document
.getElementById("refreshBtn")
.addEventListener("click", loadDashboard);


loadDashboard();
