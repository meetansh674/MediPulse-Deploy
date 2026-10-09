document.body.dataset.active = "doctors";

let allDoctors = [];


async function loadDoctors() {

    const doctorList = document.getElementById("doctorList");

    doctorList.innerHTML = `
    <div class="loading-card">
    <i class="fa-solid fa-spinner fa-spin"></i>
    Loading doctors...
    </div>
    `;

    try {

        allDoctors = await apiFetch("/doctors");

        updateDoctorCount(allDoctors.length);

        renderDoctors(allDoctors);

        updateSearchInfo(allDoctors.length, allDoctors.length);

    } catch (error) {

    doctorList.innerHTML = `
    <div class="error-card">
    <i class="fa-solid fa-triangle-exclamation"></i>
    ${escapeHtml(error.message)}
    </div>
    `;

    showInline(
    "doctorsMessage",
    error.message,
    "error"
    );
}
}


function updateDoctorCount(count) {

    const element = document.getElementById("doctorCount");

    element.textContent = count;
}


function renderDoctors(doctors) {

    const doctorList =
    document.getElementById("doctorList");

    if (!doctors.length) {

        doctorList.innerHTML = `
        <div class="empty-card">

        <i class="fa-solid fa-user-doctor"></i>

        <h3>No doctors found</h3>

        <p>
        No doctors match your search.
        </p>

        </div>
        `;

        return;
    }


doctorList.innerHTML = doctors.map(doctor => {

    const firstLetter =
    (doctor.name || "D")
    .charAt(0)
    .toUpperCase();

    return `
    <article class="doctor-card">

    <div class="avatar">
    ${escapeHtml(firstLetter)}
    </div>


    <div class="doctor-main">

    <h3>
    Dr. ${escapeHtml(doctor.name)}
    </h3>


    <p>
    ${escapeHtml(
        doctor.specialization || "-"
        )}
    </p>


    <span class="tag">

    ${escapeHtml(
        doctor.department ||
        "No department"
        )}

    </span>


    <div class="doctor-meta">

    <span>
    <i class="fa-solid fa-envelope"></i>
    ${escapeHtml(
        doctor.email || "-"
        )}
    </span>

    <span>
    <i class="fa-solid fa-phone"></i>
    ${escapeHtml(
        doctor.phone || "-"
        )}
    </span>

    </div>


    <div class="doctor-actions">

    <button
    class="btn small"
    data-view-id="${doctor.doctorId}"
    type="button"
    >

    <i class="fa-solid fa-eye"></i>

    View

    </button>


    <button
    class="btn small"
    data-edit-id="${doctor.doctorId}"
    type="button"
    >

    <i class="fa-solid fa-pen"></i>

    Edit

    </button>

    </div>

    </div>

    </article>
    `;

}).join("");


doctorList
.querySelectorAll("[data-view-id]")
.forEach(button => {

    button.addEventListener("click", () => {

        const id =
        Number(button.dataset.viewId);

        viewDoctor(id);

    });

});


doctorList
.querySelectorAll("[data-edit-id]")
.forEach(button => {

    button.addEventListener("click", () => {

        const id =
        Number(button.dataset.editId);

        openEditDoctor(id);

    });

});

}


async function viewDoctor(id) {

    try {

        const doctor =
        await apiFetch(`/doctors/${id}`);


        showModal(`

        <button
        class="modal-close"
        data-close
        type="button"
        >
        ×
        </button>


        <h2>

        <i class="fa-solid fa-user-doctor"></i>

        Doctor Details

        </h2>


        <dl class="details">

        <dt>Doctor ID</dt>

        <dd>
        ${doctor.doctorId}
        </dd>


        <dt>Name</dt>

        <dd>
        Dr. ${escapeHtml(doctor.name)}
        </dd>


        <dt>Email</dt>

        <dd>
        ${escapeHtml(doctor.email)}
        </dd>


        <dt>Phone</dt>

        <dd>
        ${escapeHtml(
            doctor.phone || "-"
            )}
        </dd>


        <dt>Specialization</dt>

        <dd>
        ${escapeHtml(
            doctor.specialization || "-"
            )}
        </dd>


        <dt>Department</dt>

        <dd>
        ${escapeHtml(
            doctor.department || "-"
            )}
        </dd>

        </dl>

        `);

    } catch (error) {

    showInline(
    "doctorsMessage",
    error.message,
    "error"
    );

}

}


function openAddDoctor() {

    showModal(`

    <button
    class="modal-close"
    data-close
    type="button"
    >
    ×
    </button>


    <h2>

    <i class="fa-solid fa-user-plus"></i>

    Add Doctor

    </h2>


    <p class="muted">
    Create a new doctor account.
    </p>


    <form id="addDoctorForm">

    <div class="form-grid">


    <label>

    <span>Doctor Name</span>

    <input
    id="doctorName"
    type="text"
    required
    placeholder="Dr. New"
    >

    </label>


    <label>

    <span>Email</span>

    <input
    id="doctorEmail"
    type="email"
    required
    placeholder="doctor@medipulse.com"
    >

    </label>


    <label>

    <span>Temporary Password</span>

    <input
    id="doctorPassword"
    type="password"
    required
    placeholder="Minimum 8 characters"
    >

    </label>


    <label>

    <span>Phone</span>

    <input
    id="doctorPhone"
    type="tel"
    required
    minlength="10"
    maxlength="10"
    pattern="[0-9]{10}"
    inputmode="numeric"
    placeholder="9998887777"
    >

    </label>


    <label>

    <span>Specialization</span>

    <input
    id="doctorSpecialization"
    type="text"
    required
    placeholder="Cardiology"
    >

    </label>


    <label>

    <span>Department</span>

    <input
    id="doctorDepartment"
    type="text"
    required
    placeholder="Cardiology"
    >

    </label>


    </div>


    <div
    id="addDoctorError"
    class="inline-message"
    ></div>


    <div class="modal-actions">

    <button
    class="btn secondary"
    type="button"
    data-close
    >
    Cancel
    </button>


    <button
    class="btn"
    type="submit"
    >

    <i class="fa-solid fa-user-plus"></i>

    Create Doctor

    </button>

    </div>

    </form>

    `);


    document
    .getElementById("addDoctorForm")
    .addEventListener(
    "submit",
    createDoctor
    );

}


async function createDoctor(event) {

    event.preventDefault();


    const name =
    document.getElementById("doctorName")
    .value.trim();

    const email =
    document.getElementById("doctorEmail")
    .value.trim();

    const password =
    document.getElementById("doctorPassword")
    .value;

    const phone =
    document.getElementById("doctorPhone")
    .value.trim();

    const phoneDigits = phone.replace(/\D/g, "");

    if (!/^\d{10}$/.test(phoneDigits)) {

        showInline(
        "addDoctorError",
        "Phone number must contain exactly 10 digits.",
        "error"
        );

        return;
    }

const specialization =
document.getElementById("doctorSpecialization")
.value.trim();

const department =
document.getElementById("doctorDepartment")
.value.trim();


if (password.length < 8) {

    showInline(
    "addDoctorError",
    "Password must contain at least 8 characters.",
    "error"
    );

    return;
}


if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(password)) {

    showInline(
    "addDoctorError",
    "Password must contain at least one special character.",
    "error"
    );

    return;
}


const submitButton =
event.target.querySelector(
'button[type="submit"]'
);

submitButton.disabled = true;

submitButton.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
Creating...
`;


try {

    await apiFetch(
    "/admin/doctors",
    {
        method: "POST",

        body: JSON.stringify({

            name,
            email,
            password,
            phone,
            specialization,
            department

        })

}
);


document.getElementById(
"modalRoot"
).innerHTML = "";


showInline(
"doctorsMessage",
"Doctor created successfully.",
"success"
);


await loadDoctors();


} catch (error) {

showInline(
"addDoctorError",
error.message,
"error"
);


submitButton.disabled = false;

submitButton.innerHTML = `
<i class="fa-solid fa-user-plus"></i>
Create Doctor
`;

}

}


// ======================================================
// EDIT DOCTOR
// ======================================================

async function openEditDoctor(id) {

    try {

        const doctor =
        await apiFetch(`/doctors/${id}`);


        showModal(`

        <button
        class="modal-close"
        data-close
        type="button"
        >
        ×
        </button>


        <h2>

        <i class="fa-solid fa-user-pen"></i>

        Edit Doctor

        </h2>


        <p class="muted">

        Update doctor information.
        Email and password cannot be changed here.

        </p>


        <form id="editDoctorForm">

        <div class="form-grid">


        <label>

        <span>Doctor Name</span>

        <input
        id="editDoctorName"
        type="text"
        required
        value="${escapeHtml(
        doctor.name || ""
        )}"
    >

    </label>


    <label>

    <span>Phone</span>

    <input
    id="editDoctorPhone"
    type="tel"
    required
    minlength="10"
    maxlength="10"
    pattern="[0-9]{10}"
    inputmode="numeric"
    value="${escapeHtml(
    doctor.phone || ""
    )}"
>

</label>


<label>

<span>Specialization</span>

<input
id="editDoctorSpecialization"
type="text"
required
value="${escapeHtml(
doctor.specialization || ""
)}"
>

</label>


<label>

<span>Department</span>

<input
id="editDoctorDepartment"
type="text"
required
value="${escapeHtml(
doctor.department || ""
)}"
>

</label>


<label class="full-width">

<span>Email</span>

<input
type="email"
value="${escapeHtml(
doctor.email || ""
)}"
disabled
>

</label>


</div>


<div
id="editDoctorError"
class="inline-message"
></div>


<div class="modal-actions">

<button
class="btn secondary"
type="button"
data-close
>
Cancel
</button>


<button
class="btn"
type="submit"
>

<i class="fa-solid fa-floppy-disk"></i>

Save Changes

</button>

</div>

</form>

`);


document
.getElementById("editDoctorForm")
.addEventListener(
"submit",
event => updateDoctor(event, id)
);


} catch (error) {

showInline(
"doctorsMessage",
error.message,
"error"
);

}

}


// ======================================================
// UPDATE DOCTOR API
// ======================================================

async function updateDoctor(event, id) {

    event.preventDefault();


    const name =
    document.getElementById("editDoctorName")
    .value.trim();

    const phone =
    document.getElementById("editDoctorPhone")
    .value.trim();

    const phoneDigits = phone.replace(/\D/g, "");

    if (!/^\d{10}$/.test(phoneDigits)) {

        showInline(
        "editDoctorError",
        "Phone number must contain exactly 10 digits.",
        "error"
        );

        return;
    }

const specialization =
document.getElementById(
"editDoctorSpecialization"
).value.trim();

const department =
document.getElementById(
"editDoctorDepartment"
).value.trim();


const submitButton =
event.target.querySelector(
'button[type="submit"]'
);


submitButton.disabled = true;

submitButton.innerHTML = `
<i class="fa-solid fa-spinner fa-spin"></i>
Saving...
`;


try {

    await apiFetch(
    `/admin/doctors/${id}`,
    {
        method: "PUT",

        body: JSON.stringify({

            name,
            phone,
            specialization,
            department

        })

}
);


document.getElementById(
"modalRoot"
).innerHTML = "";


showInline(
"doctorsMessage",
"Doctor updated successfully.",
"success"
);


await loadDoctors();


} catch (error) {

showInline(
"editDoctorError",
error.message,
"error"
);


submitButton.disabled = false;

submitButton.innerHTML = `
<i class="fa-solid fa-floppy-disk"></i>
Save Changes
`;

}

}


// ======================================================
// SEARCH
// ======================================================

function searchDoctors() {

    const input =
    document.getElementById("searchDoctor");

    const query =
    input.value.trim().toLowerCase();


    if (!query) {

        renderDoctors(allDoctors);

        updateSearchInfo(
        allDoctors.length,
        allDoctors.length
        );

        return;
    }


const filtered =
allDoctors.filter(doctor => {

    return [

    doctor.doctorId,
    doctor.name,
    doctor.email,
    doctor.phone,
    doctor.specialization,
    doctor.department

    ].some(value =>

    String(value ?? "")
    .toLowerCase()
    .includes(query)

    );

});


renderDoctors(filtered);


updateSearchInfo(
filtered.length,
allDoctors.length
);

}


// ======================================================
// SEARCH INFORMATION
// ======================================================

function updateSearchInfo(
shown,
total
) {

    const element =
    document.getElementById(
    "doctorSearchInfo"
    );


    if (!total) {

        element.textContent =
        "No registered doctors";

        return;
    }


if (shown === total) {

    element.textContent =
    `Showing all ${total} registered doctor${total === 1 ? "" : "s"}`;

    return;
}


element.textContent =
`Showing ${shown} of ${total} doctors`;

}


// ======================================================
// CLEAR SEARCH
// ======================================================

function clearDoctorSearch() {

    document.getElementById(
    "searchDoctor"
    ).value = "";


    renderDoctors(allDoctors);


    updateSearchInfo(
    allDoctors.length,
    allDoctors.length
    );

}


// ======================================================
// EVENT LISTENERS
// ======================================================

document
.getElementById("addDoctorBtn")
.addEventListener(
"click",
openAddDoctor
);


document
.getElementById("searchDoctor")
.addEventListener(
"input",
searchDoctors
);


document
.getElementById("clearSearch")
.addEventListener(
"click",
clearDoctorSearch
);


// ======================================================
// INITIAL LOAD
// ======================================================

loadDoctors();
