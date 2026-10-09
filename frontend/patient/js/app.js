document.addEventListener("DOMContentLoaded", () => {
    MPAuth.bindPasswordToggle("togglePassword", "password");
    MPAuth.bindPasswordToggle("toggleConfirmPassword", "confirmPassword");
});


function setFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + "Error");
    if (input) input.classList.add("invalid");
    if (error) error.textContent = message;
}

function clearFieldError(inputId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(inputId + "Error");
    if (input) input.classList.remove("invalid");
    if (error) error.textContent = "";
}

function clearFormErrors(form) {
    form.querySelectorAll("input, select").forEach(el => {
        el.classList.remove("invalid");
        const error = document.getElementById(el.id + "Error");
        if (error) error.textContent = "";
    });
}

function setMessage(element, text, isError) {
    element.textContent = text;
    element.className = "form-message" + (isError ? " error" : "");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[^A-Za-z0-9]).{8,}$/;

function validPassword(password) {
    return PASSWORD_RE.test(password);
}


document.addEventListener("input", event => {
    const el = event.target;
    if (el && el.id) clearFieldError(el.id);
});


const forgotLink = document.getElementById("forgotPassword");
const loginForm = document.getElementById("loginForm");
const forgotForm = document.getElementById("forgotForm");
const authHeading = document.querySelector(".auth-heading");

function showForgotForm() {
    if (!forgotForm || !loginForm) return;
    loginForm.hidden = true;
    const loginHeading = authHeading;
    if (loginHeading) loginHeading.hidden = true;
    forgotForm.hidden = false;
    document.getElementById("forgotEmail")?.focus();
}

function showLoginForm() {
    if (!forgotForm || !loginForm) return;
    forgotForm.hidden = true;
    loginForm.hidden = false;
    const loginHeading = authHeading;
    if (loginHeading) loginHeading.hidden = false;
    clearFormErrors(forgotForm);
    clearFormErrors(loginForm);
    setMessage(document.getElementById("loginMessage"), "", false);
    setMessage(document.getElementById("forgotMessage"), "", false);
}

forgotLink?.addEventListener("click", event => {
    event.preventDefault();
    showForgotForm();
});

document.getElementById("backToLogin")?.addEventListener("click", event => {
    event.preventDefault();
    showLoginForm();
});

document.getElementById("loadQuestionButton")?.addEventListener("click", async () => {
    const email = document.getElementById("forgotEmail").value.trim();
    const message = document.getElementById("forgotMessage");
    const step2 = document.getElementById("forgotStep2");
    clearFieldError("forgotEmail");

    if (!email) {
        setFieldError("forgotEmail", "Please enter your email address.");
        return;
    }
if (!EMAIL_RE.test(email)) {
    setFieldError("forgotEmail", "Please enter a valid email address.");
    return;
}

const button = document.getElementById("loadQuestionButton");
button.disabled = true;
button.textContent = "Loading…";
setMessage(message, "", false);

try {
    const response = await fetch(`${window.MediPulseConfig.API_BASE_URL}/auth/forgot-password/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
const data = await response.json().catch(() => null);
if (!response.ok) throw new Error(data?.message || "Could not load the security question.");
document.getElementById("forgotQuestion").textContent = data.question;
step2.hidden = false;
document.getElementById("forgotAnswer").focus();
setMessage(message, "", false);
} catch (error) {
step2.hidden = true;
setMessage(message, error.message || "Could not load the security question.", true);
} finally {
button.disabled = false;
button.textContent = "Load security question";
}
});

forgotForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const message = document.getElementById("forgotMessage");
    const step2 = document.getElementById("forgotStep2");

    const email = document.getElementById("forgotEmail").value.trim();
    const answer = document.getElementById("forgotAnswer").value.trim();
    const newPassword = document.getElementById("forgotNewPassword").value;
    const confirmPassword = document.getElementById("forgotConfirmPassword").value;

    let valid = true;
    if (!EMAIL_RE.test(email)) {
        setFieldError("forgotEmail", "Please enter a valid email address.");
        valid = false;
    }
if (step2.hidden) {
    setMessage(message, "Please load your security question first.", true);
    return;
}
if (!answer) {
    setFieldError("forgotAnswer", "Please enter your security answer.");
    valid = false;
}
if (!validPassword(newPassword)) {
    setFieldError("forgotNewPassword", "Password must be at least 8 characters and contain at least one special character.");
    valid = false;
}
if (newPassword !== confirmPassword) {
    setFieldError("forgotConfirmPassword", "Passwords do not match.");
    valid = false;
}
if (!valid) {
    setMessage(message, "", false);
    return;
}

const button = document.getElementById("resetButton");
button.disabled = true;
button.textContent = "Resetting…";
setMessage(message, "", false);

try {
    const response = await fetch(`${window.MediPulseConfig.API_BASE_URL}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, securityAnswer: answer, newPassword })
    });
if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Password reset failed.");
}
setMessage(message, "Password reset successful. You can now sign in.", false);
message.className = "form-message success";
setTimeout(() => {
    showLoginForm();
    document.getElementById("password").value = "";
}, 1200);
} catch (error) {
setMessage(message, error.message || "Password reset failed.", true);
} finally {
button.disabled = false;
button.textContent = "Reset password";
}
});


const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async event => {
        event.preventDefault();
        clearFormErrors(registerForm);

        const button = document.getElementById("registerButton");
        const message = document.getElementById("registerMessage");
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const securityQuestion = document.getElementById("securityQuestion").value;
        const securityAnswer = document.getElementById("securityAnswer").value.trim();

        let valid = true;

        if (!name) {
            setFieldError("name", "Please enter your full name.");
            valid = false;
        }
    if (!email) {
        setFieldError("email", "Please enter your email address.");
        valid = false;
    } else if (!EMAIL_RE.test(email)) {
    setFieldError("email", "Please enter a valid email address.");
    valid = false;
}
if (!/^\d{10}$/.test(phone)) {
    setFieldError("phone", "Phone number must contain exactly 10 digits.");
    valid = false;
}
if (!validPassword(password)) {
    setFieldError("password", "Password must be at least 8 characters and contain at least one special character.");
    valid = false;
}
if (password !== confirmPassword) {
    setFieldError("confirmPassword", "Passwords do not match.");
    valid = false;
}
if (!securityQuestion) {
    setFieldError("securityQuestion", "Please choose a security question.");
    valid = false;
}
if (!securityAnswer) {
    setFieldError("securityAnswer", "Please enter the security answer.");
    valid = false;
}
if (!valid) {
    setMessage(message, "", false);
    return;
}

button.disabled = true;
button.textContent = "Creating account…";
setMessage(message, "", false);

try {
    await MPAuth.fetchJson("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, phone: phone || null, securityQuestion, securityAnswer })
    });
setMessage(message, "Account created successfully. Redirecting to login…", false);
setTimeout(() => { window.location.href = "login.html"; }, 900);
} catch (error) {
setMessage(message, error.message || "Registration failed.", true);
button.disabled = false;
button.textContent = "Create account";
}
});
}


if (loginForm) {
    loginForm.addEventListener("submit", async event => {
        event.preventDefault();
        clearFormErrors(loginForm);

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");
        const button = document.getElementById("loginButton");

        let valid = true;
        if (!email) {
            setFieldError("email", "Please enter your email address.");
            valid = false;
        } else if (!EMAIL_RE.test(email)) {
        setFieldError("email", "Please enter a valid email address.");
        valid = false;
    }
if (!password) {
    setFieldError("password", "Please enter your password.");
    valid = false;
}
if (!valid) {
    setMessage(message, "", false);
    return;
}

button.disabled = true;
button.textContent = "Signing in…";
setMessage(message, "", false);


try {
    const response = await fetch(`${window.MediPulseConfig.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
const data = await response.json().catch(() => null);

if (!response.ok) {
    if (response.status === 401) {
        setFieldError("password", "Invalid email or password.");
        setMessage(message, "Invalid email or password. Please try again.", true);
    } else if (response.status === 429) {
    setMessage(message, data?.message || "Too many attempts. Please try again later.", true);
} else {
setMessage(message, data?.message || "Login failed.", true);
}
button.disabled = false;
button.textContent = "Sign in";
return;
}

if (data?.user?.role !== "PATIENT") {
    setMessage(message, "This portal is only for patient accounts.", true);
    button.disabled = false;
    button.textContent = "Sign in";
    return;
}

MPAuth.saveLogin(data);
setMessage(message, "Login successful. Opening patient portal…", false);
setTimeout(() => { window.location.href = "../index.html"; }, 350);
} catch (error) {
setMessage(message, error.message || "Cannot connect to the MediPulse backend.", true);
button.disabled = false;
button.textContent = "Sign in";
}
});
}
