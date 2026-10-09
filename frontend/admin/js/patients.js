document.body.dataset.active = "patients";


let allPatients = [];


async function loadPatients() {

    const root =
    document.getElementById("patientList");


    root.innerHTML = `

    <div class="loading-card">

    <i class="fa-solid fa-spinner fa-spin"></i>

    Loading patients...

    </div>

    `;


    try {

        const users =
        await apiFetch("/users");


        allPatients =
        users.filter(
        user =>
        user.role === "PATIENT"
        );


        const activePatients =
        allPatients.filter(
        user =>
        user.treatmentCompleted !== true
        );


        updatePatientCount(
        activePatients.length
        );


        renderPatients(
        activePatients
        );


    } catch (error) {

    showInline(
    "patientsMessage",
    error.message,
    "error"
    );


    root.innerHTML = `

    <div class="error-card">

    <i class="fa-solid fa-circle-exclamation"></i>

    <strong>
    Unable to load patients
    </strong>

    <p>
    ${escapeHtml(error.message)}
    </p>

    </div>

    `;

}

}


function updatePatientCount(count) {

    const element =
    document.getElementById(
    "patientCount"
    );


    if (element) {

        element.textContent =
        count;

    }

}


function renderPatients(list) {

    const root =
    document.getElementById(
    "patientList"
    );


    const searchInfo =
    document.getElementById(
    "patientSearchInfo"
    );


    if (!list.length) {

        const hasSearch =
        document
        .getElementById(
        "searchPatient"
        )
        .value
        .trim()
        .length > 0;


        root.innerHTML = `

        <div class="patient-empty-state">

        <div class="patient-empty-icon">

        <i class="fa-solid fa-user"></i>

        </div>


        <h3>

        ${
            hasSearch
            ? "No active patients match your search"
            : "No active patients right now"
        }

    </h3>


    <p>

    ${
        hasSearch
        ? "Try another name, email, phone number or patient ID."
        : "Patients whose treatment is marked done move to Patient Records."
    }

</p>


${
    hasSearch
    ? `
    <button
    class="btn"
    id="emptyClearSearch"
    type="button"
    >

    <i class="fa-solid fa-rotate-left"></i>

    Clear Search

    </button>
    `
    : ""
}

</div>

`;


if (searchInfo) {

    searchInfo.textContent =
    hasSearch
    ? "No active patients match your search."
    : "No active patients available.";

}


const clearButton =
document.getElementById(
"emptyClearSearch"
);


if (clearButton) {

    clearButton.addEventListener(
    "click",
    clearPatientSearch
    );

}


return;

}


if (searchInfo) {

    const total =
    allPatients.filter(
    user =>
    user.treatmentCompleted !== true
    ).length;

    const visible =
    list.length;


    searchInfo.textContent =
    visible === total
    ? `Showing all ${total} active patient${total === 1 ? "" : "s"}`
    : `Showing ${visible} of ${total} active patients`;

}


root.innerHTML =
list
.map(
patient =>
createPatientCard(
patient
)
)
.join("");


root.querySelectorAll("[data-patient-id]").forEach(button=>button.addEventListener("click",()=>viewPatient(Number(button.dataset.patientId))));
root.querySelectorAll("[data-treatment-done]").forEach(button=>button.addEventListener("click",()=>markTreatmentDone(Number(button.dataset.treatmentDone))));

}


function createPatientCard(patient) {

    const name =
    patient.name || "Patient";


    const initial =
    name
    .charAt(0)
    .toUpperCase();


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
    <span>Active Patient</span>
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
    <button class="patient-details-btn" type="button" data-patient-id="${patient.userId}">View Patient Details <i class="fa-solid fa-arrow-right"></i></button>
    <button class="btn small primary" type="button" data-treatment-done="${patient.userId}">Treatment Done</button>
    </div>


    </article>

    `;

}


function viewPatient(id) {

    const patient =
    allPatients.find(
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
PATIENT PROFILE
</p>


<h2>

${escapeHtml(
    patient.name
    )}

</h2>


<p class="muted">

Registered MediPulse patient

</p>

</div>

</div>


<div class="patient-details-grid">


<div class="patient-detail-item">

<span>

<i class="fa-solid fa-id-card"></i>

Patient ID

</span>


<strong>

${escapeHtml(
    patient.userId
    )}

</strong>

</div>


<div class="patient-detail-item">

<span>

<i class="fa-solid fa-user-check"></i>

Account Type

</span>


<strong>
PATIENT
</strong>

</div>


<div class="patient-detail-item">

<span>

<i class="fa-solid fa-envelope"></i>

Email

</span>


<strong>

${escapeHtml(
    patient.email ||
    "Not available"
    )}

</strong>

</div>


<div class="patient-detail-item">

<span>

<i class="fa-solid fa-phone"></i>

Phone

</span>


<strong>

${escapeHtml(
    patient.phone ||
    "Not available"
    )}

</strong>

</div>


<div class="patient-detail-item full">

<span>

<i class="fa-regular fa-calendar"></i>

Registered On

</span>


<strong>

${formatDate(
    patient.createdAt
    )}

</strong>

</div>


</div>


<div class="patient-modal-actions"><button class="btn" data-close type="button">Close</button></div>

`);

}


function searchPatients() {

    const query =
    document
    .getElementById(
    "searchPatient"
    )
    .value
    .trim()
    .toLowerCase();


    if (!query) {

        renderPatients(
        allPatients
        );

        return;

    }


const filtered =
allPatients.filter(
patient => patient.treatmentCompleted !== true
).filter(
patient => {

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

}
);


renderPatients(
filtered
);

}


function clearPatientSearch() {

    const input =
    document.getElementById(
    "searchPatient"
    );


    input.value = "";


    renderPatients(
    allPatients
    );


    input.focus();

}


document
.getElementById(
"searchPatient"
)
.addEventListener(
"input",
searchPatients
);


document
.getElementById(
"clearSearch"
)
.addEventListener(
"click",
clearPatientSearch
);


loadPatients();
async function markTreatmentDone(id){if(!confirm("Mark this patient's treatment as done? The patient will move to Patient Records but can still log in."))return;try{await apiFetch(`/users/${id}/treatment?completed=true`,{method:"PATCH"});await loadPatients();showInline("patientsMessage","Treatment marked as done.","success");}catch(e){showInline("patientsMessage",e.message,"error");}}
