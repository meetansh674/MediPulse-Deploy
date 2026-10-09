document.addEventListener("DOMContentLoaded", () => {

    loadUpcomingAppointment();

});


async function loadUpcomingAppointment() {

    const title =
    document.getElementById("upcomingAppointmentTitle");

    const details =
    document.getElementById("upcomingAppointmentDetails");

    if (!title || !details) {
        return;
    }


try {

    const appointments =
    await MPAuth.fetchJson("/appointments");


    const scheduledAppointments =
    (appointments || [])
    .filter(
    appointment =>
    appointment.status === "SCHEDULED"
    )
    .sort(
    (a, b) =>
    new Date(a.appointmentDate) -
    new Date(b.appointmentDate)
    );


    if (!scheduledAppointments.length) {

        title.textContent =
        "No upcoming appointments";

        details.textContent =
        "Your upcoming appointments will appear here.";

        return;
    }


const appointment =
scheduledAppointments[0];


title.textContent =
`Dr. ${appointment.doctorName || "Doctor"}`;


const appointmentDate =
new Date(appointment.appointmentDate);


const formattedDate =
appointmentDate.toLocaleDateString(
"en-IN",
{
    day: "numeric",
    month: "short",
    year: "numeric"
}
);


const formattedTime =
appointmentDate.toLocaleTimeString(
"en-IN",
{
    hour: "numeric",
    minute: "2-digit"
}
);


details.innerHTML = `
<strong>
${appointment.specialization || "Medical consultation"}
</strong>
<br>
${formattedDate} at ${formattedTime}
<br>
Reason: ${appointment.reason || "General consultation"}
`;

} catch (error) {

console.error(
"Unable to load upcoming appointment:",
error
);

title.textContent =
"Unable to load appointment";

details.textContent =
"Please open Appointments to check your scheduled appointments.";

}

}
