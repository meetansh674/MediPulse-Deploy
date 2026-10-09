document.body.dataset.active = "appointments";

let appointments = [];
let doctors = [];


async function loadData() {

    try {

        const results = await Promise.all([
        apiFetch("/appointments"),
        apiFetch("/doctors")
        ]);

        appointments = results[0] || [];
        doctors = results[1] || [];

        updateStatistics();

        renderAppointments();

    } catch (e) {

    showInline(
    "appointmentsMessage",
    e.message,
    "error"
    );

    document.getElementById("appointmentsBody").innerHTML = `
    <tr>
    <td colspan="7">
    Unable to load appointments.
    </td>
    </tr>
    `;

}
}


function updateStatistics() {

    const total = appointments.length;

    const scheduled =
    appointments.filter(
    a => String(a.status).toUpperCase() === "SCHEDULED"
    ).length;

    const completed =
    appointments.filter(
    a => String(a.status).toUpperCase() === "COMPLETED"
    ).length;

    const cancelled =
    appointments.filter(
    a => String(a.status).toUpperCase() === "CANCELLED"
    ).length;


    document.getElementById("totalAppointments").textContent =
    total;

    document.getElementById("scheduledAppointments").textContent =
    scheduled;

    document.getElementById("completedAppointments").textContent =
    completed;

    document.getElementById("cancelledAppointments").textContent =
    cancelled;


    document.getElementById("appointmentCount").textContent =
    `${total} appointment${total === 1 ? "" : "s"}`;
}


function filteredAppointments() {

    const search =
    document
    .getElementById("searchAppointment")
    .value
    .trim()
    .toLowerCase();

    const status =
    document.getElementById("statusFilter").value;


    return appointments.filter(a => {

        const matchesStatus =
        !status ||
        String(a.status).toUpperCase() === status;


        const searchableText = [

        a.appointmentId,
        a.patientId,
        a.patientName,
        a.doctorId,
        a.doctorName,
        a.specialization,
        a.reason,
        a.status

        ]
        .map(value =>
        String(value ?? "").toLowerCase()
        );


        const matchesSearch =
        !search ||
        searchableText.some(
        value => value.includes(search)
        );


        return matchesStatus && matchesSearch;

    });
}


function renderAppointments() {

    const body =
    document.getElementById("appointmentsBody");

    const list =
    filteredAppointments();


    if (!list.length) {

        body.innerHTML = `
        <tr>
        <td colspan="7">

        <div class="empty-card">

        <i class="fa-solid fa-calendar-xmark"></i>

        <h3>No appointments found</h3>

        <p>
        Try changing your search or status filter.
        </p>

        </div>

        </td>
        </tr>
        `;

        return;
    }


body.innerHTML = list.map(a => {

    const status =
    String(a.status || "")
    .toLowerCase();


    return `
    <tr>

    <!-- ID -->

    <td>
    <strong>#${a.appointmentId}</strong>
    </td>


    <!-- PATIENT -->

    <td>

    <strong>
    ${escapeHtml(a.patientName || "Unknown")}
    </strong>

    <small>
    Patient ID: ${a.patientId ?? "-"}
    </small>

    </td>


    <!-- DOCTOR -->

    <td>

    <strong>
    Dr. ${escapeHtml(a.doctorName || "Unknown")}
    </strong>

    <small>
    ${escapeHtml(a.specialization || "Doctor")}
    </small>

    </td>


    <!-- DATE -->

    <td>
    ${formatDate(a.appointmentDate)}
    </td>


    <!-- REASON -->

    <td>
    ${escapeHtml(a.reason || "-")}
    </td>


    <!-- STATUS -->

    <td>

    <span class="status ${status}">
    ${escapeHtml(
        String(a.status || "").toUpperCase()
        )}
    </span>

    </td>


    <!-- ACTIONS -->

    <td>

    <div class="action-row">

    <button
    class="btn small"
    data-edit="${a.appointmentId}">

    <i class="fa-solid fa-pen"></i>
    Edit

    </button>


    <button
    class="btn small danger"
    data-cancel="${a.appointmentId}">

    <i class="fa-solid fa-ban"></i>
    Cancel

    </button>

    </div>

    </td>

    </tr>
    `;

}).join("");


body
.querySelectorAll("[data-edit]")
.forEach(button => {

    button.addEventListener(
    "click",
    () =>
    openEdit(
    Number(button.dataset.edit)
    )
    );

});


body
.querySelectorAll("[data-cancel]")
.forEach(button => {

    button.addEventListener(
    "click",
    () =>
    cancelAppointment(
    Number(button.dataset.cancel)
    )
    );

});

}


function openEdit(id) {

    const appointment =
    appointments.find(
    a => Number(a.appointmentId) === Number(id)
    );


    if (!appointment) return;


    showModal(`

    <button
    class="modal-close"
    data-close>
    ×
    </button>


    <h2>
    <i class="fa-solid fa-calendar-pen"></i>
    Edit Appointment
    </h2>


    <p class="muted">
    Appointment #${appointment.appointmentId}
    </p>


    <form
    id="editAppointment"
    class="form-grid">


    <!-- Doctor -->

    <label>

    Doctor

    <select id="editDoctor" required>

    ${doctors.map(d => `

        <option
        value="${d.doctorId}"
        ${
            Number(d.doctorId) ===
            Number(appointment.doctorId)
            ? "selected"
            : ""
        }>

    Dr. ${escapeHtml(d.name)}
    —
    ${escapeHtml(d.specialization || "")}

    </option>

    `).join("")}

    </select>

    </label>


    <!-- Date -->

    <label>

    Date and time

    <input
    id="editDate"
    type="datetime-local"
    value="${toDateTimeLocal(
    appointment.appointmentDate
    )}"
required>

</label>


<!-- Reason -->

<label class="full-field">

Reason

<textarea
id="editReason"
required>${escapeHtml(
    appointment.reason || ""
    )}</textarea>

</label>


<!-- Status -->

<label>

Status

<select id="editStatus">

<option
value="SCHEDULED"
${
    appointment.status === "SCHEDULED"
    ? "selected"
    : ""
}>
Scheduled
</option>

<option
value="COMPLETED"
${
    appointment.status === "COMPLETED"
    ? "selected"
    : ""
}>
Completed
</option>

<option
value="CANCELLED"
${
    appointment.status === "CANCELLED"
    ? "selected"
    : ""
}>
Cancelled
</option>

</select>

</label>


<!-- Save -->

<div class="form-actions">

<button
class="btn primary"
type="submit">

<i class="fa-solid fa-check"></i>
Save Changes

</button>

</div>

</form>

`);


document
.getElementById("editAppointment")
.addEventListener(
"submit",
async event => {

    event.preventDefault();


    const body = {

        doctorId:
        Number(
        document
        .getElementById("editDoctor")
        .value
        ),

        appointmentDate:
        document
        .getElementById("editDate")
        .value,

        reason:
        document
        .getElementById("editReason")
        .value
        .trim(),

        status:
        document
        .getElementById("editStatus")
        .value

    };


try {

    await apiFetch(
    `/appointments/${id}`,
    {
        method: "PUT",
        body: JSON.stringify(body)
    }
);


document
.getElementById("modalRoot")
.innerHTML = "";


await loadData();


showInline(
"appointmentsMessage",
"Appointment updated successfully.",
"success"
);


} catch (error) {

showInline(
"appointmentsMessage",
error.message,
"error"
);

}

}
);

}


async function cancelAppointment(id) {

    const confirmed =
    confirm(
    `Cancel appointment #${id}?`
    );


    if (!confirmed) return;


    try {

        await apiFetch(
        `/appointments/${id}`,
        {
            method: "DELETE"
        }
    );


    await loadData();


    showInline(
    "appointmentsMessage",
    "Appointment cancelled successfully.",
    "success"
    );


} catch (error) {

showInline(
"appointmentsMessage",
error.message,
"error"
);

}

}


document
.getElementById("searchAppointment")
.addEventListener(
"input",
renderAppointments
);


document
.getElementById("statusFilter")
.addEventListener(
"change",
renderAppointments
);


document
.getElementById("refreshAppointments")
.addEventListener(
"click",
loadData
);


loadData();
