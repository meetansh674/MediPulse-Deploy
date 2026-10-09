const token = MPAuth.getToken();
const patientId = MPAuth.getUser()?.userId;

if (!token || !patientId) {
    location.href = "login.html";
}

const form = document.getElementById("appointmentForm");
const message = document.getElementById("appointmentMessage");
const history = document.getElementById("appointmentHistoryList");
const doctorSelect = document.getElementById("doctor");


const setMessage = (m, t = "") => {
    if (message) {
        message.textContent = m;
        message.className = `form-message ${t}`;
    }
};


async function loadDoctors() {

    if (!doctorSelect) {
        return;
    }

try {

    const doctors =
    await MPAuth.fetchJson("/doctors");

    doctorSelect.innerHTML =
    '<option value="" disabled selected>Select a doctor</option>' +
    doctors
    .filter(d => d)
    .map(d =>
    `<option value="${d.doctorId}">
    Dr. ${escapeHtml(d.name)} —
    ${escapeHtml(d.specialization || "General")}
    </option>`
    )
    .join("");

} catch (e) {

doctorSelect.innerHTML =
'<option value="">Unable to load doctors</option>';

setMessage(
e.message,
"error"
);
}
}


function escapeHtml(value) {

    return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


async function loadHistory() {

    if (!history) {
        return;
    }

history.textContent =
"Loading your appointments…";

try {

    const list =
    await MPAuth.fetchJson("/appointments") || [];

    const mine =
    list.filter(
    appointment =>
    String(appointment.patientId) ===
    String(patientId)
    );


    if (!mine.length) {

        history.innerHTML = `
        <div class="empty-alert-card">

        <h3>
        No appointments yet
        </h3>

        <p>
        Your upcoming and previous appointments
        will appear here.
        </p>

        </div>
        `;

        return;
    }


history.innerHTML = mine
.map(appointment => {

    const id =
    appointment.id ??
    appointment.appointmentId;


    const date =
    appointment.appointmentDate
    ? new Date(
    appointment.appointmentDate
    ).toLocaleString(
    "en-IN",
    {
        dateStyle: "medium",
        timeStyle: "short"
    }
)
: "-";


const status =
String(
appointment.status || ""
).toLowerCase();


return `
<article class="appointment-history-card">

<div class="appointment-history-top">

<strong>
Appointment #${id}
</strong>

<span
class="status status-${status}"
>
${escapeHtml(
    appointment.status ||
    "UNKNOWN"
    )}
</span>

</div>


<p>
<strong>Doctor:</strong>
${escapeHtml(
    appointment.doctorName ||
    (
    "Doctor #" +
    (
    appointment.doctorId ??
    "-"
    )
    )
    )}
</p>


<p>
<strong>Specialization:</strong>
${escapeHtml(
    appointment.specialization || "-"
    )}
</p>


<p>
<strong>Date:</strong>
${escapeHtml(date)}
</p>


<p>
<strong>Reason:</strong>
${escapeHtml(
    appointment.reason || "-"
    )}
</p>


<div class="appointment-actions">

${
    status !== "cancelled"
    ? `
    <button
    class="secondary-button small"
    data-reschedule="${id}"
    >
    Reschedule
    </button>

    <button
    class="logout-button small"
    data-cancel="${id}"
    >
    Cancel
    </button>
    `
    : ""
}

</div>

</article>
`;

})
.join("");


history
.querySelectorAll("[data-cancel]")
.forEach(button => {

    button.addEventListener(
    "click",
    () =>
    cancelAppointment(
    button.dataset.cancel
    )
    );

});


history
.querySelectorAll("[data-reschedule]")
.forEach(button => {

    button.addEventListener(
    "click",
    () =>
    rescheduleAppointment(
    button.dataset.reschedule
    )
    );

});

} catch (e) {

history.innerHTML = `
<div class="empty-alert-card">

<h3>
Unable to load appointments
</h3>

<p>
${escapeHtml(e.message)}
</p>

</div>
`;

}
}


async function cancelAppointment(id) {

    if (
    !confirm(
    "Cancel this appointment? Your appointment history will be kept."
    )
    ) {
        return;
    }


try {

    await MPAuth.fetchJson(
    `/appointments/${id}`,
    {
        method: "DELETE"
    }
);


mpToast?.(
"Appointment cancelled.",
"success"
);


await loadHistory();

} catch (e) {

mpToast?.(
e.message,
"error"
);

}
}


async function rescheduleAppointment(id) {

    const value =
    prompt(
    "Enter the new date and time as YYYY-MM-DDTHH:MM"
    );


    if (!value) {
        return;
    }


const date =
new Date(value);


if (
Number.isNaN(date.getTime()) ||
date <= new Date()
) {

    mpToast?.(
    "Please choose a future date and time.",
    "error"
    );

    return;
}


try {

    await MPAuth.fetchJson(
    `/appointments/${id}`,
    {
        method: "PUT",

        body: JSON.stringify({
            appointmentDate: value
        })
}
);


mpToast?.(
"Appointment rescheduled.",
"success"
);


await loadHistory();

} catch (e) {

mpToast?.(
e.message,
"error"
);

}
}


form?.addEventListener(
"submit",
async e => {

    e.preventDefault();


    const doctorId =
    Number(
    doctorSelect?.value
    );


    const date =
    document.getElementById(
    "appointmentDate"
    )?.value;


    const time =
    document.getElementById(
    "appointmentTime"
    )?.value;


    const reason =
    document.getElementById(
    "reason"
    )?.value.trim();


    const button =
    e.submitter;


    if (
    !doctorId ||
    !date ||
    !time ||
    !reason
    ) {

        setMessage(
        "Please complete all appointment fields.",
        "error"
        );

        return;
    }


const appointmentDate =
`${date}T${time}`;


if (
new Date(appointmentDate) <=
new Date()
) {

    setMessage(
    "Please choose a future appointment date and time.",
    "error"
    );

    return;
}


try {

    if (button) {

        button.disabled = true;
        button.textContent =
        "Booking…";

    }


setMessage(
"Booking appointment…"
);


await MPAuth.fetchJson(
"/appointments",
{
    method: "POST",

    body: JSON.stringify({
        doctorId,
        appointmentDate,
        reason
    })
}
);


setMessage(
"Appointment booked successfully.",
"success"
);


form.reset();


await loadHistory();

} catch (e) {

setMessage(
e.message,
"error"
);

} finally {

if (button) {

    button.disabled = false;
    button.textContent =
    "Book Appointment";

}

}

}
);


loadDoctors();
loadHistory();
