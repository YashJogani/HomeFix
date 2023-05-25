const orderForm = document.getElementById("order-form");
const totalPrice = document.getElementById("total-price");
const totalItems = document.getElementById("total-items");

let price = 0;
let items = 0;

cartItems.forEach(item => {
    price += item.id.services[item.servicetype].price * item.quantity;
    items += item.quantity;
});

totalPrice.textContent = `₹ ${price}`;
totalItems.textContent = `${items}`;

orderForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const orderData = {};
    formData.forEach((value, key) => {
        orderData[key] = value;
    });

    const response = await fetch("/place-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
    });

    if (response.ok) {
        const data = await response.json();
        const orderId = data.orderId;

       window.location.href = `/order-details?orderId=${orderId}`;
    } else {
        alert("Something went wrong. Please try again later.");
    }
});