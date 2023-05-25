const addButtons = document.querySelectorAll('.add-btn button');
const quantityDivs = document.querySelectorAll('.quantity');
const inputs = document.querySelectorAll('.quantity input');
const cartPriceText = document.getElementById('price');
const cartItemsText = document.getElementById('items');
const checkoutCart = document.querySelector('.cart');
const servicesContainer = document.querySelectorAll('.container');
const upperDiv = servicesContainer[servicesContainer.length - 1];

for (let i = 0; i < addButtons.length; i++) {
    addButtons[i].addEventListener('click', async () => {
        if (!username) {
            window.location.href = "/login";
            return;
        }
        await toggleAddbtn(addButtons[i], quantityDivs[i], inputs[i], i);
        displayCheckoutcart(checkoutCart);
    });

    const minusButton = quantityDivs[i].querySelector('button:first-of-type');
    const plusButton = quantityDivs[i].querySelector('button:last-of-type');

    plusButton.addEventListener('click', async () => {
        await increment(inputs[i], i);
        displayCheckoutcart(checkoutCart);
    });
    minusButton.addEventListener('click', async () => {
        await decrement(inputs[i], i);
        displayCheckoutcart(checkoutCart);
    });
};

let cart = {
    price: 0,
    items: 0
}

cartItems.forEach((item) => {
    cart.price += item.id.services[item.servicetype].price * item.quantity;
    cart.items += item.quantity;

    if (item.id._id.toString() === serviceid) {
        addButtons[item.servicetype].innerText = 'Remove';
        quantityDivs[item.servicetype].style.display = 'flex';
        inputs[item.servicetype].value = item.quantity;
        addButtons[item.servicetype].classList.toggle('add-btn-default');
        addButtons[item.servicetype].classList.toggle('remove-btn');
    }
});

displayCheckoutcart(checkoutCart);

function searchCart() {
    window.location.href = "/cart";
};

function displayCheckoutcart(checkoutCart) {
    if (cart.items) {
        cartPriceText.textContent = 'Subtotal: ₹ ' + cart.price;
        cartItemsText.textContent = 'Services: ' + cart.items;
        checkoutCart.classList.remove('notactive');
        checkoutCart.classList.add('active');
        checkoutCart.style.display = 'flex';
    } else {
        checkoutCart.classList.remove('active');
        checkoutCart.classList.add('notactive');
        setTimeout(() => {
            checkoutCart.style.display = 'none';
        }, 100);
    }
    floatCheckoutcart();
}

async function toggleAddbtn(btn, quantityDiv, input, index) {
    btn.classList.toggle('add-btn-default');
    btn.classList.toggle('remove-btn');

    if (btn.innerText === 'Add') {
        quantityDiv.style.display = 'flex';
        btn.innerText = 'Remove';
        input.value = 1;
        cart.price += services[index].price;
        cart.items += 1;
        await fetch(`/addCartService?serviceid=${serviceid}&servicetype=${index}`, { method: 'POST' })
            .catch(error => {
                console.error(error);
            });
    }
    else {
        quantityDiv.style.display = 'none';
        btn.innerText = 'Add';
        cart.price -= input.value * services[index].price;
        cart.items -= input.value;
        input.value = 0;
        await fetch(`/removeCartService?serviceid=${serviceid}&servicetype=${index}`, { method: 'POST' })
            .catch(error => {
                console.error(error);
            });
    }
};

async function increment(input, index) {
    var value = parseInt(input.value);
    if (value < 10) {
        input.value = value + 1;
        cart.price += services[index].price;
        cart.items += 1;
        await fetch(`/updateCartItemQuantity?serviceid=${serviceid}&servicetype=${index}&quantity=${value + 1}`, { method: 'POST' })
            .catch(error => {
                console.error(error);
            });
    }
};

async function decrement(input, index) {
    var value = parseInt(input.value);
    if (value > 1) {
        input.value = value - 1;
        cart.price -= services[index].price;
        cart.items -= 1;
        await fetch(`/updateCartItemQuantity?serviceid=${serviceid}&servicetype=${index}&quantity=${value - 1}`, { method: 'POST' })
            .catch(error => {
                console.error(error);
            });
    }
};

function floatCheckoutcart() {
    const checkoutCartRect = checkoutCart.getBoundingClientRect();
    const upperSectionRect = upperDiv.getBoundingClientRect();

    if (checkoutCartRect.top < upperSectionRect.bottom || checkoutCartRect.top >= window.innerHeight) {
        checkoutCart.style.position = 'fixed';
    } else {
        checkoutCart.style.position = 'relative';
    }
}

window.addEventListener('scroll', function () {
    floatCheckoutcart();
});