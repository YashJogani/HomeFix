async function logout() {
    const response = await fetch("/logout", { method: "POST" });

    if (response.ok) {
        const data = await response.json();
        if (data.logout) {
            window.location.href = "/";
        }
    }
}