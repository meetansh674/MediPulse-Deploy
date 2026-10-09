window.MPAuth = (() => {
    const TOKEN_KEY = "medipulseToken";
    const USER_KEY = "medipulseUser";
    const REFRESH_KEY = "medipulseRefreshToken";
    function getToken(){ return localStorage.getItem(TOKEN_KEY); }
    function getUser(){ try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; } }
    function saveLogin(data){ if(!data?.token || !data?.user) throw new Error("Invalid login response from server."); localStorage.setItem(TOKEN_KEY,data.token); localStorage.setItem(USER_KEY,JSON.stringify(data.user)); if(data.refreshToken) localStorage.setItem(REFRESH_KEY,data.refreshToken); }
    function clear(){ localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); localStorage.removeItem(REFRESH_KEY); }
    function portalLoginPath(){
        const p=window.location.pathname;
        if(p.includes("/patient/")) return p.includes("/patient/pages/") ? "login.html" : "pages/login.html";
        if(p.includes("/doctor/")) return "index.html";
        if(p.includes("/admin/")) return "login.html";
        return "../index.html";
    }
function logout(target){ clear(); window.location.href=target || "../index.html"; }
function bindPasswordToggle(buttonId,inputId){
    const button=document.getElementById(buttonId), input=document.getElementById(inputId);
    if(!button || !input || button.dataset.bound === "1") return;
    button.dataset.bound="1";
    const update=()=>{
        const visible=input.type === "text";
        button.setAttribute("aria-label", visible ? "Hide password" : "Show password");
        button.title=visible ? "Hide password" : "Show password";
        button.innerHTML=visible
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.9 5.1A11.8 11.8 0 0 1 12 5c5.2 0 8.8 3.6 10 7-.5 1.4-1.4 2.8-2.7 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.3 6.3C4.6 7.4 3.4 9.1 2 12c1.2 3.4 4.8 7 10 7 1.1 0 2.1-.2 3-.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
    };
button.addEventListener("click",()=>{ input.type=input.type === "password" ? "text" : "password"; update(); });
update();
}
function requireRole(role,target){ const u=getUser(); if(!getToken() || !u || u.role!==role){ clear(); window.location.href=target || portalLoginPath(); return null; } return u; }
async function fetchJson(endpoint, options={}){
    const headers={...(options.body && !(options.body instanceof FormData)?{"Content-Type":"application/json"}:{}),...(options.headers||{})};
    const token=getToken(); if(token) headers.Authorization=`Bearer ${token}`;
    let response;
    try{ response=await fetch(`${window.MediPulseConfig.API_BASE_URL}${endpoint}`,{...options,headers}); }
    catch(e){ throw new Error("Cannot connect to the MediPulse backend. Make sure Spring Boot is running."); }
    if(response.status===401){
        const refreshToken=localStorage.getItem(REFRESH_KEY);
        if(refreshToken && !options._retried){
            try{
                const refreshResponse=await fetch(`${window.MediPulseConfig.API_BASE_URL}/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,{method:"POST"});
                if(refreshResponse.ok){
                    const refreshed=await refreshResponse.json();
                    saveLogin(refreshed);
                    return fetchJson(endpoint,{...options,_retried:true});
                }
        }catch(_){}
}
clear(); window.location.href=portalLoginPath(); return null;
}
const ct=response.headers.get("content-type")||"";
const data=response.status===204?null:(ct.includes("application/json")?await response.json():await response.text());
if(!response.ok) throw new Error(data?.message || data || `Request failed (${response.status})`);
return data;
}
return {TOKEN_KEY,USER_KEY,REFRESH_KEY,getToken,getUser,saveLogin,clear,logout,bindPasswordToggle,requireRole,fetchJson};
})();
