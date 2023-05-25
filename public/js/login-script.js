const password = document.querySelector(".div-password input");
const togglePassword = document.querySelector('.password-toggle');
const loginForm = document.getElementById("login-form");
const errorDiv = document.querySelector(".login-failed");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (event) => {
    errorDiv.style.display = "none";
    event.preventDefault();

    const formData = new FormData(event.target);
    const loginData = {}
    formData.forEach((value, key) => {
        loginData[key] = value;
    });

    const response = await fetch("/validate-login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
    });

    if (response.ok) {
        window.location.href = "/";
    } else if (response.status === 401) {
        const error = await response.text();
        errorDiv.style.display = "flex";
        errorMessage.textContent = error;
    } else {
        alert("Something went wrong. Please try again later.");
    }
});

togglePassword.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);

    const iconName = togglePassword.getAttribute('name') === 'eye' ? 'eye-off' : 'eye';
    togglePassword.setAttribute('name', iconName);
});

password.addEventListener('keyup', function () {
    if (password.value) {
        togglePassword.style.display = "block";
    }
    else {
        togglePassword.style.display = "none";
    }
});