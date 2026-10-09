
async function apiRequest(endpoint, options = {}) {

    try {
        return await MPAuth.fetchJson(endpoint, options);
    } catch (error) {
    if (/Request failed \(403\)/.test(error.message)) {
        throw new Error("You are not authorized to perform this action.");
    }
throw error;
}
}

function toLocalDateTimeInputValue(date = new Date()) {
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toBackendLocalDateTime(value) {
    return value ? `${value}:00` : null;
}

function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function escapeHtml(value) {
    return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
