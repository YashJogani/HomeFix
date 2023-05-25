const password = document.querySelectorAll(".div-password input");
const togglePassword = document.querySelectorAll('.password-toggle');
const createForm = document.getElementById("create-form");
const errorDiv = document.querySelector(".create-account-failed");
const errorMessage = document.getElementById("error-message");

createForm.addEventListener("submit", async (event) => {
    errorDiv.style.display = "none";
    event.preventDefault();

    const formData = new FormData(event.target);
    const loginData = {};
    formData.forEach((value, key) => {
        loginData[key] = value;
    });

    if (loginData.password !== loginData.confirm_password) {
        errorDiv.style.display = "flex";
        errorMessage.textContent = "Passwords do not match!";
        return;
    }

    const response = await fetch("/create-account", {
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

togglePassword.forEach((item, index) => {
    togglePassword[index].addEventListener('click', function () {
        const type = password[index].getAttribute('type') === 'password' ? 'text' : 'password';
        password[index].setAttribute('type', type);
    
        const iconName = togglePassword[index].getAttribute('name') === 'eye' ? 'eye-off' : 'eye';
        togglePassword[index].setAttribute('name', iconName);
    });

    password[index].addEventListener('keyup', function () {
        if (password[index].value) {
            togglePassword[index].style.display = "block";
        }
        else {
            togglePassword[index].style.display = "none";
        }
    });
});