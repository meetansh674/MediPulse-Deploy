
const token = MPAuth.getToken();
const patientId = MPAuth.getUser()?.userId;

if (!token || !patientId) {
    window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);
const type = params.get("type");

const config = {
    records: {
        title: "Medical Records",
        endpoint: `/medical-records/patient/${patientId}`
    },

prescriptions: {
    title: "Prescriptions",
    endpoint: `/prescriptions/patient/${patientId}`
},

labs: {
    title: "Lab Reports",
    endpoint: `/lab-reports/patient/${patientId}`
},

health: {
    title: "Health Monitoring",
    endpoint: `/health-readings/patient/${patientId}`
}
};

const selected = config[type];

const pageTitle = document.getElementById("pageTitle");
const message = document.getElementById("message");
const container = document.getElementById("dataContainer");
const healthFormSection = document.getElementById("healthFormSection");
const healthForm = document.getElementById("healthForm");
const healthMessage = document.getElementById("healthMessage");
let currentItems=[]; let healthChart;

if (!selected) {

    pageTitle.textContent = "Invalid Page";
    message.textContent = "Page not found.";

} else {

pageTitle.textContent = selected.title;

if (type === "health") {
    healthFormSection.style.display = "block";
    document.getElementById("historyTitle").textContent =
    "Health Reading History";
    if (window.MPRanges) window.MPRanges.mount("#rangeReference");
}

loadData();
}


async function loadData() {
    try {
        message.textContent = "Loading...";
        const data = await MPAuth.fetchJson(selected.endpoint);
        message.textContent = "";
        currentItems = Array.isArray(data) ? data : (data ? [data] : []);
        renderItems(currentItems);
        if(type === "health") renderHealthChart(currentItems);
    } catch(error) { message.textContent = error.message || "Unable to load data."; }
}

function formatKey(key){
    return String(key ?? "")
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, c => c.toUpperCase());
}
function renderItems(items){
    const query=(document.getElementById("recordSearch")?.value||"").trim().toLowerCase();
    const filtered=items.filter(item=>!query||Object.values(item).some(v=>String(v??"").toLowerCase().includes(query)));
    if(!filtered.length){container.innerHTML="<p>No matching records available.</p>";return;}
    container.innerHTML="";
    filtered.forEach((item,index)=>{const card=document.createElement("div");card.className="data-record-card";const heading=document.createElement("h3");heading.textContent=`${selected.title} ${index+1}`;card.appendChild(heading);Object.entries(item).forEach(([key,value])=>{const row=document.createElement("p");const label=document.createElement("strong");label.textContent=formatKey(key)+": ";row.appendChild(label);row.appendChild(document.createTextNode(value===null||value===undefined||value===""?"Not available":typeof value==="object"?JSON.stringify(value):String(value)));card.appendChild(row);});container.appendChild(card);});
}
function renderHealthChart(items){const wrap=document.getElementById("healthChartWrap");if(!wrap||!window.Chart)return;wrap.style.display="block";const points=items.filter(x=>Number.isFinite(Number(x.value))).slice(0,20).reverse();if(healthChart)healthChart.destroy();healthChart=new Chart(document.getElementById("healthChart"),{type:"line",data:{labels:points.map(x=>new Date(x.recordedAt).toLocaleDateString("en-IN")),datasets:[{label:"Reading",data:points.map(x=>Number(x.value)),tension:.25}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true}}}});}
document.getElementById("recordSearch")?.addEventListener("input",()=>renderItems(currentItems));
