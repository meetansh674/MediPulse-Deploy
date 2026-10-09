
async function loadLabReports() {
    const message = document.getElementById("reportMessage");
    const list = document.getElementById("reportList");

    const token = MPAuth.getToken();
    const patientId = MPAuth.getUser()?.userId;

    if (!token || !patientId) {
        message.textContent =
        "Please log in again to view your lab reports.";
        return;
    }

try {
    const data = await MPAuth.fetchJson(
    `/lab-reports/patient/${patientId}`
    );
    const reports = Array.isArray(data)
    ? data
    : data.reports;

    list.innerHTML = "";

    if (!Array.isArray(reports) || reports.length === 0) {
        message.textContent =
        "No lab reports are available right now.";
        return;
    }

message.textContent =
`Found ${reports.length} lab report(s).`;

const query=(document.getElementById("labSearch")?.value||"").trim().toLowerCase();
const filtered=reports.filter(report=>!query||Object.values(report).some(v=>String(v??"").toLowerCase().includes(query)));
filtered.forEach((report) => {
    const card = document.createElement("div");
    card.className = "dashboard-card";

    const title = document.createElement("h3");
    title.textContent =
    report.testName || "Laboratory Report";
    card.appendChild(title);

    const fields = [
    ["Report ID", report.labReportId],
    ["Test Name", report.testName],
    ["Result", report.result],
    ["Report Date", report.reportDate],
    ["Doctor", report.doctorName]
    ];

    fields.forEach(([label, value]) => {
        if (value !== null && value !== undefined &&
        value !== "") {
            const row = document.createElement("p");
            row.textContent = `${label}: ${value}`;
            card.appendChild(row);
        }
});

if (report.fileReference) {
    const isUploaded = !String(report.fileReference).includes("/") && !String(report.fileReference).includes("\\") && /\.(pdf|jpg|jpeg|png)$/i.test(String(report.fileReference));
    if (isUploaded) {
        const file = document.createElement("p");
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = "View report";
        const previewWrap = document.createElement("div");
        previewWrap.className = "lab-preview";
        previewWrap.style.marginTop = "10px";
        let objectUrl = null;
        let expanded = false;
        link.addEventListener("click", async (e) => {
            e.preventDefault();
            if (expanded) {
                previewWrap.innerHTML = "";
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                objectUrl = null;
                expanded = false;
                link.textContent = "View report";
                return;
            }
        link.textContent = "Loading...";
        try {
            const token = MPAuth.getToken();
            const response = await fetch(`${window.MediPulseConfig.API_BASE_URL}/lab-reports/files/${encodeURIComponent(report.fileReference)}`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
        if (!response.ok) throw new Error(`Could not open file (${response.status})`);
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        const isPdf = /\.pdf$/i.test(String(report.fileReference)) || blob.type === "application/pdf";
        previewWrap.innerHTML = "";
        if (isPdf) {
            const frame = document.createElement("iframe");
            frame.src = objectUrl;
            frame.title = `Lab report ${report.testName || ""}`;
            frame.style.width = "100%";
            frame.style.height = "500px";
            frame.style.border = "1px solid #d8e4f0";
            frame.style.borderRadius = "8px";
            previewWrap.appendChild(frame);
        } else {
        const img = document.createElement("img");
        img.src = objectUrl;
        img.alt = `Lab report ${report.testName || ""}`;
        img.style.maxWidth = "100%";
        img.style.border = "1px solid #d8e4f0";
        img.style.borderRadius = "8px";
        previewWrap.appendChild(img);
    }
const actions = document.createElement("p");
const dl = document.createElement("a");
dl.href = objectUrl;
dl.download = String(report.fileReference).split("_").slice(1).join("_") || report.fileReference;
dl.textContent = "Download";
const hide = document.createElement("a");
hide.href = "#";
hide.textContent = "Hide";
hide.style.marginLeft = "12px";
hide.addEventListener("click", (ev) => {
    ev.preventDefault();
    previewWrap.innerHTML = "";
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    expanded = false;
    link.textContent = "View report";
});
actions.appendChild(dl);
actions.appendChild(hide);
previewWrap.appendChild(actions);
expanded = true;
link.textContent = "Loading...";
link.style.display = "none";
} catch (err) {
message.textContent = err.message;
link.textContent = "View report";
}
});
file.appendChild(document.createTextNode("Report file: "));
file.appendChild(link);
card.appendChild(file);
card.appendChild(previewWrap);
} else {
const file = document.createElement("p");
file.textContent =
`File Reference: ${report.fileReference}`;
card.appendChild(file);
}
}

list.appendChild(card);
});

} catch (error) {
console.error("Lab reports error:", error);
message.textContent =
error.message || "Unable to connect to the server. Please try again.";
}
}

loadLabReports();

document.getElementById("labSearch")?.addEventListener("input",()=>loadLabReports());
