


function getToken() {
    return MPAuth.getToken();
}


function getUser() {

    try {
        return MPAuth.getUser();
    } catch {
    return null;
}

}


function isAdmin() {

    const user = getUser();

    return !!getToken() &&
    user &&
    user.role === "ADMIN";

}


function requireAdmin() {

    if (!isAdmin()) {

        MPAuth.clear();

        window.location.href = "login.html";

        return false;

    }

return true;

}


function logout() {

    try {
        MPAuth.clear();
    } catch (error) {
    console.warn("Logout cleanup warning:", error);
}

window.location.href = "./login.html";

}


function getTheme() {

    return (
    localStorage.getItem("medipulse-admin-theme")
    || "light"
    );

}


function applyTheme(theme = getTheme()) {

    document.documentElement.setAttribute(
    "data-theme",
    theme
    );

    localStorage.setItem(
    "medipulse-admin-theme",
    theme
    );

    updateThemeButton();

}


function toggleTheme() {

    const currentTheme =
    document.documentElement.getAttribute("data-theme")
    || "light";

    const nextTheme =
    currentTheme === "dark"
    ? "light"
    : "dark";

    applyTheme(nextTheme);

}


function updateThemeButton() {

    const button =
    document.getElementById("themeToggle");

    if (!button) {
        return;
    }

const theme =
document.documentElement.getAttribute("data-theme")
|| "light";


if (theme === "dark") {

    button.innerHTML =
    '<i class="fa-solid fa-sun" aria-hidden="true"></i>' +
    '<span>Light</span>';

    button.setAttribute(
    "aria-label",
    "Switch to light mode"
    );

    button.setAttribute(
    "title",
    "Switch to light mode"
    );

} else {

button.innerHTML =
'<i class="fa-solid fa-moon" aria-hidden="true"></i>' +
'<span>Dark</span>';

button.setAttribute(
"aria-label",
"Switch to dark mode"
);

button.setAttribute(
"title",
"Switch to dark mode"
);

}

}


applyTheme();


function escapeHtml(value) {

    const entities = {

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"

    };

return String(value ?? "")
.replace(
/[&<>'"]/g,
character => entities[character]
);

}


function formatDate(value) {

    if (!value) {
        return "-";
    }

const date = new Date(value);

return Number.isNaN(date.getTime())
? value
: date.toLocaleString();

}


function toDateTimeLocal(value) {

    if (!value) {
        return "";
    }

return String(value).slice(0, 16);

}


/* =========================================================
API
========================================================= */

async function apiFetch(
path,
options = {}
) {

    const token = getToken();

    const headers = new Headers(
    options.headers || {}
    );


    if (token) {

        headers.set(
        "Authorization",
        `Bearer ${token}`
        );

    }


if (
options.body &&
!headers.has("Content-Type")
) {

    headers.set(
    "Content-Type",
    "application/json"
    );

}


const response = await fetch(
`${API_BASE_URL}${path}`,
{
    ...options,
    headers
}
);


/* =========================
AUTHORIZATION ERROR
========================= */

if (
response.status === 401 ||
response.status === 403
) {

    try {
        MPAuth.clear();
    } catch (error) {
    console.warn(
    "Auth cleanup warning:",
    error
    );
}

window.location.href =
"./login.html";

throw new Error(
"Your session is no longer authorized."
);

}


/* =========================
RESPONSE
========================= */

const text =
await response.text();

let data = null;


try {

    data = text
    ? JSON.parse(text)
    : null;

} catch {

data = text;

}


/* =========================
API ERROR
========================= */

if (!response.ok) {

    const message =
    data?.message ||
    data?.error ||
    `Request failed (${response.status})`;

    throw new Error(message);

}


return data;

}


/* =========================================================
NAVIGATION
========================================================= */

function setNav(active) {

    const nav =
    document.getElementById("appNav");

    if (!nav) {
        return;
    }


const links = [

[
"dashboard.html",
"Dashboard",
"dashboard",
"fa-house"
],

[
"patients.html",
"Patients",
"patients",
"fa-users"
],

[
"patient-records.html",
"Patient Records",
"patient-records",
"fa-clock-rotate-left"
],

[
"doctors.html",
"Doctors",
"doctors",
"fa-user-doctor"
],

[
"departments.html",
"Departments",
"departments",
"fa-building"
],

[
"appointments.html",
"Appointments",
"appointments",
"fa-calendar"
],

[
"monitoring.html",
"Monitoring",
"monitoring",
"fa-heart-pulse"
],

[
"lab-reports.html",
"Lab Reports",
"labs",
"fa-flask"
],

[
"alerts.html",
"Alerts",
"alerts",
"fa-bell"
],

[
"audit-log.html",
"Audit Log",
"audit",
"fa-clipboard-list"
]

];


nav.innerHTML = `

<aside class="admin-sidebar">


<!-- BRAND -->

<a
class="admin-brand"
href="dashboard.html"
>

<img
src="../assets/medipulse-logo.png"
alt="MediPulse logo"
class="admin-logo"
>

<span>

<strong>
MediPulse
</strong>

<small>
Admin Portal
</small>

</span>

</a>


<!-- THEME BUTTON -->

<div class="admin-theme-top">

<button
class="theme-toggle"
id="themeToggle"
type="button"
>

<i
class="fa-solid fa-moon"
aria-hidden="true"
></i>

<span>
Dark
</span>

</button>

</div>


<!-- NAVIGATION -->

<nav class="admin-side-nav">

${links.map(
    ([href, label, key, icon]) => `

    <a
    class="admin-side-link ${
    active === key
    ? "active"
    : ""
}"
href="${href}"
>

<i
class="fa-solid ${icon}"
aria-hidden="true"
></i>

<span>
${label}
</span>

</a>

`
).join("")}

</nav>


<!-- LOGOUT -->

<div class="admin-sidebar-footer">

<button
class="logout-btn"
id="logoutBtn"
type="button"
>

<i
class="fa-solid fa-right-from-bracket"
aria-hidden="true"
></i>

<span>
Logout
</span>

</button>

</div>


</aside>

`;


/* =========================
LOGOUT BUTTON
========================= */

document
.getElementById("logoutBtn")
?.addEventListener(
"click",
() => {

    if (
    confirm(
    "Are you sure you want to log out?"
    )
    ) {

        logout();

    }

}
);


/* =========================
THEME BUTTON
========================= */

document
.getElementById("themeToggle")
?.addEventListener(
"click",
toggleTheme
);


updateThemeButton();

}


/* =========================================================
MODAL
========================================================= */

function showModal(html) {

    const root =
    document.getElementById("modalRoot");

    if (!root) {
        return;
    }


root.innerHTML = `

<div
class="modal-backdrop"
data-close-modal
>

<div
class="modal"
role="dialog"
aria-modal="true"
>

${html}

</div>

</div>

`;


root
.querySelector("[data-close-modal]")
?.addEventListener(
"click",
event => {

    if (
    event.target ===
    event.currentTarget
    ) {

        root.innerHTML = "";

    }

}
);


root
.querySelectorAll("[data-close]")
.forEach(
button => {

    button.addEventListener(
    "click",
    () => {

        root.innerHTML = "";

    }
);

}
);

}


/* =========================================================
INLINE MESSAGE
========================================================= */

function showInline(
id,
message,
type = "info"
) {

    const element =
    document.getElementById(id);

    if (element) {

        element.className =
        `inline-message ${type}`;

        element.textContent =
        message;

    }

}


/* =========================================================
PAGE INITIALIZATION
========================================================= */

document.addEventListener(
"DOMContentLoaded",
() => {

    if (
    document.body.classList.contains(
    "auth-page"
    )
    ) {

        return;

    }


if (!requireAdmin()) {
    return;
}


setNav(
document.body.dataset.active || ""
);

}
);
