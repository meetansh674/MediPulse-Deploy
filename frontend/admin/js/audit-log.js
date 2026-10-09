document.body.dataset.active = "audit";

let auditEntries = [];


function actionLabel(action) {
    return String(action || "-").replaceAll("_", " ");
}


async function loadAuditLog() {
    const body = document.getElementById("auditBody");
    body.innerHTML = `<tr><td colspan="5">Loading audit log...</td></tr>`;

    try {
        auditEntries = await apiFetch("/admin/audit-log") || [];
        renderAuditLog();
    } catch (e) {
        body.innerHTML = `<tr><td colspan="5">${escapeHtml(e.message)}</td></tr>`;
    }
}


function renderAuditLog() {
    const body = document.getElementById("auditBody");
    const query = document.getElementById("searchAudit").value.trim().toLowerCase();
    const action = document.getElementById("actionFilter").value;

    const list = auditEntries.filter(e => {
        if (action && e.action !== action) return false;
        if (!query) return true;
        return [e.actorEmail, e.action, e.targetType, e.targetId, e.detail]
            .some(v => String(v ?? "").toLowerCase().includes(query));
    });

    if (!list.length) {
        body.innerHTML = `<tr><td colspan="5">No audit entries match.</td></tr>`;
        return;
    }

    body.innerHTML = list.map(e => `
        <tr>
            <td>${formatDate(e.createdAt)}</td>
            <td>${escapeHtml(e.actorEmail || ("ID " + (e.actorId ?? "-")))}</td>
            <td><span class="status normal">${escapeHtml(actionLabel(e.action))}</span></td>
            <td>${escapeHtml(e.targetType || "-")} ${e.targetId ?? ""}</td>
            <td>${escapeHtml(e.detail || "-")}</td>
        </tr>
    `).join("");
}


document.getElementById("searchAudit").addEventListener("input", renderAuditLog);
document.getElementById("actionFilter").addEventListener("change", renderAuditLog);
document.getElementById("refreshAudit").addEventListener("click", loadAuditLog);

loadAuditLog();
