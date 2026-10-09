window.MPRanges = (() => {
    const ROWS = [
        ["Heart rate (bpm)", "60 – 100", "50 – 59 or 101 – 120", "< 50 or > 120"],
        ["SpO2 (%)", "95 and above", "90 – 94", "Below 90"],
        ["Temperature (°C)", "36 – 38", "35 – 36 or 38 – 39", "Below 35 or 39 and above"],
        ["Systolic BP (mmHg)", "100 – 140", "90 – 100 or 140 – 180", "Below 90 or 180 and above"],
        ["Diastolic BP (mmHg)", "65 – 90", "60 – 65 or 90 – 120", "Below 60 or 120 and above"],
        ["Blood glucose (mg/dL)", "70 – 200", "54 – 70 or 200 – 300", "Below 54 or 300 and above"]
    ];

    function ensureCss() {
        if (document.getElementById("mpRangesCss")) return;
        const style = document.createElement("style");
        style.id = "mpRangesCss";
        style.textContent = [
            ".mp-ranges{margin:14px 0 4px;font-size:13px;max-width:680px}",
            ".mp-ranges summary{cursor:pointer;color:#5d7692;font-weight:600;list-style:none;display:inline-flex;align-items:center;gap:6px}",
            ".mp-ranges summary::-webkit-details-marker{display:none}",
            ".mp-ranges summary::before{content:'+';display:inline-grid;place-items:center;width:18px;height:18px;border:1px solid #d8e4f0;border-radius:6px;color:#1976d2;font-weight:700}",
            ".mp-ranges[open] summary::before{content:'–'}",
            ".mp-ranges summary:hover{color:#1976d2}",
            ".mp-ranges table{width:100%;border-collapse:collapse;margin-top:8px;background:#fff;border:1px solid #e6edf5;border-radius:10px;overflow:hidden}",
            ".mp-ranges th,.mp-ranges td{text-align:left;padding:7px 10px;border-bottom:1px solid #eef2f7;font-size:12.5px;color:#334155}",
            ".mp-ranges tr:last-child th,.mp-ranges tr:last-child td{border-bottom:0}",
            ".mp-ranges th{font-size:11px;text-transform:uppercase;letter-spacing:.4px;color:#7b8493;background:#f8fafc;font-weight:700}",
            ".mp-ranges td:first-child{font-weight:600;color:#172033;white-space:nowrap}",
            ".mp-ranges .pill{display:inline-block;min-width:8px;height:8px;border-radius:99px;margin-right:6px;vertical-align:baseline}",
            ".mp-ranges .ok{background:#16a34a}.mp-ranges .warn{background:#d97706}.mp-ranges .attn{background:#dc2626}",
            ".mp-ranges .note{color:#7b8493;font-size:12px;margin:6px 0 0}"
        ].join("\n");
        document.head.appendChild(style);
    }

    function esc(v) {
        return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    }

    function mount(selector) {
        const host = typeof selector === "string" ? document.querySelector(selector) : selector;
        if (!host || host.dataset.mpRangesMounted) return;
        host.dataset.mpRangesMounted = "1";
        ensureCss();
        const details = document.createElement("details");
        details.className = "mp-ranges";
        details.innerHTML =
            "<summary>Reference ranges: what raises Warning / Attention</summary>" +
            "<table><thead><tr><th>Reading</th><th><span class='pill ok'></span>Normal</th>" +
            "<th><span class='pill warn'></span>Warning</th><th><span class='pill attn'></span>Attention</th></tr></thead>" +
            "<tbody>" + ROWS.map(r => "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) +
                "</td><td>" + esc(r[2]) + "</td><td>" + esc(r[3]) + "</td></tr>").join("") +
            "</tbody></table>" +
            "<p class='note'>Warning and Attention readings automatically create a monitoring alert.</p>";
        host.appendChild(details);
    }

    return { mount };
})();
