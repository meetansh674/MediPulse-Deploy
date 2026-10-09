document.body.dataset.active = "labs";

let labPatients = [];


function isUploadedLabFile(ref) {
    if (!ref || ref.includes("/") || ref.includes("\\")) return false;
    return /\.(pdf|jpg|jpeg|png)$/i.test(ref);
}


async function openLabFile(filename, previewWrap) {
    previewWrap.innerHTML = `<div class="loading-card"><i class="fa-solid fa-spinner fa-spin"></i> Loading file...</div>`;
    const token = getToken();
    const response = await fetch(
    `${API_BASE_URL}/lab-reports/files/${encodeURIComponent(filename)}`,
    { headers: token ? { "Authorization": `Bearer ${token}` } : {} }
    );
    if (!response.ok) throw new Error(`Could not open file (${response.status})`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const isPdf = /\.pdf$/i.test(filename) || blob.type === "application/pdf";

    previewWrap.innerHTML = "";
    if (isPdf) {
        const frame = document.createElement("iframe");
        frame.src = url;
        frame.title = "Lab report file";
        frame.style.width = "100%";
        frame.style.height = "500px";
        frame.style.border = "1px solid #d8e4f0";
        frame.style.borderRadius = "8px";
        previewWrap.appendChild(frame);
    } else {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Lab report file";
    img.style.maxWidth = "100%";
    img.style.border = "1px solid #d8e4f0";
    img.style.borderRadius = "8px";
    previewWrap.appendChild(img);
}

const actions = document.createElement("p");
const dl = document.createElement("a");
dl.href = url;
dl.download = String(filename).split("_").slice(1).join("_") || filename;
dl.textContent = "Download";
const hide = document.createElement("a");
hide.href = "#";
hide.textContent = "Hide";
hide.style.marginLeft = "12px";
hide.addEventListener("click", (ev) => {
    ev.preventDefault();
    previewWrap.innerHTML = "";
    URL.revokeObjectURL(url);
});
actions.appendChild(dl);
actions.appendChild(hide);
previewWrap.appendChild(actions);
return url;
}


async function loadLabPatients() {
    try {
        const users = await apiFetch("/users");
        labPatients = users.filter(u => u.role === "PATIENT");
        document.getElementById("labPatientSelect").innerHTML =
        `<option value="">-- Select Patient --</option>` +
        labPatients.map(p =>
        `<option value="${p.userId}">${escapeHtml(p.name)} (ID: ${p.userId})</option>`
        ).join("");
    } catch (e) {
    document.getElementById("labPatientSelect").innerHTML =
    `<option value="">Unable to load patients</option>`;
}
}


async function loadLabReports() {
    const id = document.getElementById("labPatientSelect").value;
    const body = document.getElementById("labBody");
    const preview = document.getElementById("labPreview");

    preview.innerHTML = "";

    if (!id) {
        document.getElementById("labPatientInfo").innerHTML = "Select a patient.";
        document.getElementById("labCount").textContent = "0 reports";
        body.innerHTML = `<tr><td colspan="5">Select a patient to load lab reports.</td></tr>`;
        return;
    }

const p = labPatients.find(x => String(x.userId) === id);
document.getElementById("labPatientInfo").innerHTML = `
<strong>${escapeHtml(p.name)}</strong>
<span>${escapeHtml(p.email)}</span>
<span>Patient ID: ${p.userId}</span>
`;
body.innerHTML = `<tr><td colspan="5">Loading lab reports...</td></tr>`;

try {
    const reports = await apiFetch(`/lab-reports/patient/${id}`) || [];
    document.getElementById("labCount").textContent =
    `${reports.length} report${reports.length === 1 ? "" : "s"}`;

    if (!reports.length) {
        body.innerHTML = `<tr><td colspan="5">No lab reports found for this patient.</td></tr>`;
        return;
    }

body.innerHTML = reports.map((r, index) => `
<tr>
<td>${escapeHtml(r.testName || "-")}</td>
<td>${escapeHtml(r.result || "-")}</td>
<td>${escapeHtml(r.createdByName || "-")} (${escapeHtml(r.createdByRole || "-")})</td>
<td>${formatDate(r.reportDate)}</td>
<td>
${r.fileReference && isUploadedLabFile(r.fileReference)
    ? `<a href="#" data-lab-file="${escapeHtml(r.fileReference)}">View</a>`
    : escapeHtml(r.fileReference || "-")}
</td>
</tr>
`).join("");

body.querySelectorAll("[data-lab-file]").forEach(link => link.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
        await openLabFile(link.dataset.labFile, preview);
        preview.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
    preview.innerHTML = `<div class="error-card">${escapeHtml(err.message)}</div>`;
}
}));
} catch (e) {
body.innerHTML = `<tr><td colspan="5">${escapeHtml(e.message)}</td></tr>`;
}
}


document.getElementById("labPatientSelect").addEventListener("change", loadLabReports);
document.getElementById("refreshLabs").addEventListener("click", loadLabReports);

loadLabPatients();
