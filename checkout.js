let cart = JSON.parse(localStorage.getItem("cart")) || []; // Retrieve the cart from localStorage
let totalAmount = parseFloat(localStorage.getItem("totalAmount")) || 0; // Retrieve the total amount
let discount = 0; // Initialize discount

// DOM Elements
const checkoutItems = document.getElementById("checkout-items");
const checkoutTotal = document.getElementById("checkout-total");
const promoCodeInput = document.getElementById("promo-code-input");
const applyPromoCodeButton = document.getElementById("apply-promo-code");
const promoCodeMessage = document.getElementById("promo-code-message");
const confirmBuyButton = document.getElementById("confirm-buy");

// Render Checkout Items
function renderCheckoutItems() {
  checkoutItems.innerHTML = cart
    .map(
      (item) => `
      <div class="checkout-item">
        <h4>${item.name}</h4>
        <p>Quantity: ${item.quantity}</p>
        <p>Amount: $${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    `
    )
    .join("");
  checkoutTotal.textContent = totalAmount.toFixed(2);
}

// Apply Promo Code
async function applyPromoCode() {
  const promoCode = promoCodeInput.value.trim();
  if (!promoCode) {
    promoCodeMessage.textContent = "Please enter a promo code.";
    return;
  }

  try {
    const response = await fetch("promocodes.json"); // Fetch the promo codes
    if (!response.ok) {
      throw new Error("Failed to fetch promo codes");
    }
    const promoCodes = await response.json(); // Parse JSON data

    const promo = promoCodes.find((p) => p.code === promoCode);
    if (promo) {
      discount = promo.discount;
      const discountedTotal = totalAmount * (1 - discount / 100);
      checkoutTotal.textContent = discountedTotal.toFixed(2);
      promoCodeMessage.textContent = `Promo code applied: ${discount}% off!`;
    } else {
      promoCodeMessage.textContent = "Invalid promo code.";
    }
  } catch (error) {
    console.error("Error applying promo code:", error);
    promoCodeMessage.textContent = "Failed to apply promo code.";
  }
}

// Confirm Buy
async function confirmBuy() {
  const order = {
    orderId: generateOrderId(),
    products: cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      amount: item.price * item.quantity,
    })),
    totalAmount: parseFloat(checkoutTotal.textContent),
  };

  try {
    // Save order to orders.json
    const response = await fetch("orders.json"); // Fetch existing orders
    let orders = [];
    if (response.ok) {
      orders = await response.json(); // Parse JSON data
    }
    orders.push(order); // Add the new order
    await fetch("orders.json", {
      method: "PUT", // Update the orders file
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orders),
    });

    // Clear cart and redirect
    localStorage.removeItem("cart");
    localStorage.removeItem("totalAmount");
    alert("Order confirmed! Thank you for your purchase.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error confirming order:", error);
    alert("Failed to confirm order. Please try again.");
  }
}

// Generate Order ID
function generateOrderId() {
  return `ORD${Date.now()}`; // Use timestamp as order ID
}

// Initialize
renderCheckoutItems(); // Render checkout items when the page loads
applyPromoCodeButton.addEventListener("click", applyPromoCode);
confirmBuyButton.addEventListener("click", confirmBuy);