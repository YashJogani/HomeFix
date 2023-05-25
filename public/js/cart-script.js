const totalpriceText = document.querySelectorAll('#service-total-price');
const quantityDivs = document.querySelectorAll('.quantity');
const inputs = document.querySelectorAll('.quantity input');
const itemDivs = document.querySelectorAll('.service');
const removeButton = document.querySelectorAll('.remove-button');
const subtotalText = document.getElementById('subtotal');

let subtotal = 0;

cartItems.forEach((item, index) => {
    subtotal += item.id.services[item.servicetype].price * item.quantity;

    inputs[index].value = item.quantity;

    const minusButton = quantityDivs[index].querySelector('button:first-of-type');
    const plusButton = quantityDivs[index].querySelector('button:last-of-type');

    plusButton.addEventListener('click', async () => {
        await increment(item, inputs[index], index);
        subtotalText.textContent = "Sub Total: ₹ " + subtotal;
        totalpriceText[index].textContent = "₹ " + item.id.services[item.servicetype].price * parseInt(inputs[index].value);
    });
    minusButton.addEventListener('click', async () => {
        await decrement(item, inputs[index], index);
        subtotalText.textContent = "Sub Total: ₹ " + subtotal;
        totalpriceText[index].textContent = "₹ " + item.id.services[item.servicetype].price * parseInt(inputs[index].value);
    });

    removeButton[index].addEventListener('click', async () => {
        await remove(item);
        subtotal -= item.id.services[item.servicetype].price * parseInt(inputs[index].value);
        if (!subtotal) {
            window.location.href = "/cart";
            return;
        }
        subtotalText.textContent = "Sub Total: ₹ " + subtotal;
        itemDivs[index+1].parentNode.removeChild(itemDivs[index+1]);
    });
});

subtotalText.textContent = "Sub Total: ₹ " + subtotal;

function confirmOrder() {
    window.location.href = "/place-order";
}

async function remove(item) {
    await fetch(`/removeCartService?serviceid=${item.id._id}&servicetype=${item.servicetype}`, { method: 'POST' })
        .catch(error => {
            console.error(error);
        });
}

async function increment(item, input, index) {
    var value = parseInt(input.value);
    if (value < 10) {
        input.value = value + 1;
        subtotal += item.id.services[item.servicetype].price;
        await fetch(`/updateCartItemQuantity?serviceid=${item.id._id}&servicetype=${index}&quantity=${value + 1}`, { method: 'POST' })
            .catch(error => {
                console.error(error);
            });
    }
};

async function decrement(item, input, index) {
    var value = parseInt(input.value);
    if (value > 1) {
        input.value = value - 1;
        subtotal -= item.id.services[item.servicetype].price;
        await fetch(`/updateCartItemQuantity?serviceid=${item.id._id}&servicetype=${index}&quantity=${value - 1}`, { method: 'POST' })
            .catch(error => {
                console.error(error);
            });
    }
};