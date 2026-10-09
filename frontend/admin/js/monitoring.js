document.body.dataset.active = "monitoring";

let patients = [];
let readings = [];
let chart;


function toLocalDateTimeInputValue(date = new Date()) {
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


async function loadPatients() {

    try {

        const users = await apiFetch("/users");

        patients = users.filter(
        u => u.role === "PATIENT"
        );

        const select =
        document.getElementById("patientSelect");

        select.innerHTML =
        `<option value="">-- Select Patient --</option>` +
        patients.map(p =>
        `<option value="${p.userId}">
        ${escapeHtml(p.name)} (ID: ${p.userId})
        </option>`
        ).join("");

    } catch (e) {

    document.getElementById("patientSelect").innerHTML =
    `<option value="">Unable to load patients</option>`;

}

}


async function selectPatient() {

    const id =
    document.getElementById("patientSelect").value;

    document.getElementById("readingsBody").innerHTML =
    `<tr>
    <td colspan="4">
    ${id ? "Loading..." : "Select a patient."}
    </td>
    </tr>`;

    document.getElementById("chartType").innerHTML =
    `<option value="">Select metric</option>`;

    if (chart) {

        chart.destroy();
        chart = null;

    }

if (!id) {

    document.getElementById("patientInfo").innerHTML =
    "Select a patient.";

    return;

}

const p =
patients.find(
x => String(x.userId) === id
);

document.getElementById("patientInfo").innerHTML = `
<strong>${escapeHtml(p.name)}</strong>
<span>${escapeHtml(p.email)}</span>
<span>Patient ID: ${p.userId}</span>
`;

document.getElementById("readingForm").dataset.patientId =
id;


try {

    readings =
    await apiFetch(
    `/health-readings/patient/${id}`
    );

    renderReadings();

    populateChartTypes();

} catch (e) {

document.getElementById("readingsBody").innerHTML =
`<tr>
<td colspan="4">
${escapeHtml(e.message)}
</td>
</tr>`;

}

}


function renderReadings() {

    document.getElementById("readingCount").textContent =
    `${readings.length} reading${readings.length === 1 ? "" : "s"}`;


    document.getElementById("readingsBody").innerHTML =
    readings.length

    ? readings.map(r => `
    <tr>

    <td>
    ${escapeHtml(r.readingType)}
    </td>

    <td>
    ${escapeHtml(r.value)}
    </td>

    <td>
    ${escapeHtml(r.unit || "-")}
    </td>

    <td>
    ${formatDate(r.recordedAt)}
    </td>

    </tr>
    `).join("")

    : `
    <tr>
    <td colspan="4">
    No health readings found for this patient.
    </td>
    </tr>
    `;

}


function populateChartTypes() {

    const types = [
    ...new Set(
    readings
    .filter(
    r => !Number.isNaN(Number(r.value))
    )
    .map(
    r => r.readingType
    )
    )
    ];


    document.getElementById("chartType").innerHTML =
    `<option value="">Select metric</option>` +

    types.map(t =>
    `<option value="${escapeHtml(t)}">
    ${escapeHtml(t)}
    </option>`
    ).join("");


    document.getElementById("chartMessage").textContent =
    types.length
    ? "Select a metric to display the trend."
    : "No numeric reading type is available for charting.";

}


function drawChart() {

    const type =
    document.getElementById("chartType").value;


    if (chart) {

        chart.destroy();
        chart = null;

    }


if (!type) return;


const data =
readings
.filter(
r =>
r.readingType === type &&
!Number.isNaN(Number(r.value))
)
.slice()
.sort(
(a, b) =>
new Date(a.recordedAt) -
new Date(b.recordedAt)
);


if (!data.length) {

    document.getElementById("chartMessage").textContent =
    "No numeric data for this metric.";

    return;

}


document.getElementById("chartMessage").textContent =
"";


chart = new Chart(
document.getElementById("healthChart"),
{

    type: "line",


    data: {

        labels:
        data.map(
        r => formatDate(r.recordedAt)
        ),


        datasets: [{

            label:
            `${type}${
            data[0].unit
            ? ` (${data[0].unit})`
            : ""
        }`,

    data:
    data.map(
    r => Number(r.value)
    ),

    borderWidth: 3,

    tension: 0.35,

    pointRadius: 5,

    pointHoverRadius: 8,

    fill: false

}]

},


options: {

    responsive: true,

    maintainAspectRatio: false,


    animation: {

        duration: 700

    },


plugins: {

    legend: {

        display: true,

        position: "top"

    },


tooltip: {

    displayColors: false,


    callbacks: {

        label:
        function(context) {

            return `
            ${context.raw}
            ${data[0].unit || ""}
            `;

        }

}

}

},


scales: {

    y: {

        beginAtZero: false,


        ticks: {

            precision: 0

        },


    grid: {

        color: "#eef2f7"

    }

},


x: {

    grid: {

        display: false

    }

}

}

}

}
);

}


document
.getElementById("patientSelect")
.addEventListener(
"change",
selectPatient
);


document
.getElementById("chartType")
.addEventListener(
"change",
drawChart
);


document
.getElementById("refreshMonitoring")
.addEventListener(
"click",
() => {

    if (
    document
    .getElementById("patientSelect")
    .value
    ) {

        selectPatient();

    }

}
);


document
.getElementById("readingForm")
.addEventListener(
"submit",
async e => {

    e.preventDefault();


    const patientId =
    Number(
    e.currentTarget.dataset.patientId
    );


    if (!patientId) {

        showInline(
        "readingMessage",
        "Select a patient first.",
        "error"
        );

        return;

    }


const payload = {

    patientId,

    readingType:
    document
    .getElementById("readingType")
    .value
    .trim(),

    value:
    document
    .getElementById("readingValue")
    .value
    .trim(),

    unit:
    document
    .getElementById("readingUnit")
    .value
    .trim(),

    recordedAt:
    document
    .getElementById("recordedAt")
    .value

};


try {

    await apiFetch(
    "/health-readings",
    {
        method: "POST",

        body:
        JSON.stringify(payload)
    }
);


showInline(
"readingMessage",
"Health reading saved.",
"success"
);


e.currentTarget.reset();


document
.getElementById("recordedAt")
.value =
toLocalDateTimeInputValue();


await selectPatient();


} catch (err) {

showInline(
"readingMessage",
err.message,
"error"
);

}

}
);


document
.getElementById("recordedAt")
.value =
toLocalDateTimeInputValue();


if (window.MPRanges) window.MPRanges.mount("#rangeReference");
loadPatients();
