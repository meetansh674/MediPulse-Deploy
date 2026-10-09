document.addEventListener("DOMContentLoaded", () => {
    MPAuth.bindPasswordToggle("togglePassword", "password");
    const form = document.getElementById("loginForm");
    if (!form) return;
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");
        const button = document.getElementById("loginButton");
        if (!email || !password) {
            message.textContent = "Please enter email and password.";
            message.className = "form-message error";
            return;
        }
    message.textContent = "Signing in…";
    message.className = "form-message";
    button.disabled = true;
    button.textContent = "Signing in…";
    try {
        const data = await MPAuth.fetchJson("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
        if (!data?.user || data.user.role !== "ADMIN") throw new Error("This portal is only for administrator accounts.");
        MPAuth.saveLogin(data);
        window.location.replace("dashboard.html");
    } catch (err) {
    message.textContent = err.message || "Unable to connect to the MediPulse backend.";
    message.className = "form-message error";
    button.disabled = false;
    button.textContent = "Login as Admin";
}
});
});
