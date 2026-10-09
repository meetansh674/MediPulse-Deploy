async function doctorLogin(email, password) {
    const data = await MPAuth.fetchJson("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (!data?.token || !data?.user) throw new Error("Invalid login response from server.");
    if (data.user.role !== "DOCTOR") throw new Error("This account is not a Doctor account.");
    MPAuth.saveLogin(data);
    window.location.href = "dashboard.html";
}
function getCurrentUser(){ return MPAuth.getUser(); }
function requireDoctor(){ return MPAuth.requireRole("DOCTOR", "index.html"); }
function logout(){ MPAuth.logout("index.html"); }
document.addEventListener("DOMContentLoaded",()=>{
    MPAuth.bindPasswordToggle("togglePassword","password");
    const form=document.getElementById("loginForm"); if(!form)return;
    form.addEventListener("submit",async e=>{e.preventDefault();const email=document.getElementById("email").value.trim(),password=document.getElementById("password").value,message=document.getElementById("loginMessage"),button=document.getElementById("loginButton");if(!email||!password){message.textContent="Please enter email and password.";message.className="form-message error";return;}button.disabled=true;button.textContent="Signing in…";message.textContent="";try{await doctorLogin(email,password);}catch(err){message.textContent=err.message||"Login failed.";message.className="form-message error";button.disabled=false;button.textContent="Login as Doctor";}});
});
