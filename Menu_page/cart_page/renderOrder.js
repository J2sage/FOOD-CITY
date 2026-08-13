import {
  getCartFromApi,
  removeCartItem,
  updateCartItem,
  clearCartFromApi
} from "../../data/cart-api.js";
import { checkoutOrderWithApi } from "../../data/orders-api.js";
import { updateDashboard, updateOrder } from "../../dashboard/dashboard.js";

/* ============================================================
   LOCAL CART FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================
   The old flow read and wrote the cart with localStorage and looked up
   products through food.js.
*/
export const cart = [];

function getStoredOrders() {
  return JSON.parse(localStorage.getItem("orders") || "[]");
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function getProductImage(image) {
  return /^https?:\/\//i.test(image) ? image : `../${image}`;
}

function getCartProduct(cartItem) {
  return cartItem.product;
}

export async function refreshCart({ silent = false } = {}) {
  try {
    const data = await getCartFromApi();
    cart.splice(0, cart.length, ...data.items.map((item) => ({
      productId: item.menuItemId,
      quantity: item.quantity,
      product: item
    })));
    updateCart();
    updateCartQuantity();
    return data;
  } catch (error) {
    cart.splice(0, cart.length);
    updateCartQuantity();
    if (!silent && document.querySelector('.cart-body')) {
      alert(error.message || 'Could not load your cart.');
    }
    return null;
  }
}

export function updateCart() {
  let cartHTML = "";
  let finalTotal = 0;

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    const matchingProduct = getCartProduct(cartItem);
    if (!matchingProduct) return;

    const quantityTotal = cartItem.quantity * matchingProduct.price;

    cartHTML += `
      <div class="cart" data-product-id='${productId}'>
        <div class="product-info">
          <img src="${getProductImage(matchingProduct.image)}" alt="${matchingProduct.name}">
          <div class="text">
            <p class="name">${matchingProduct.name}</p>
            <p class="stock">In stock</p>
          </div>
        </div>
        <p class="price">₦${matchingProduct.price.toLocaleString()}</p>
        <div class="quantity">
          <img src="icon/decrease.png" class="decrease" data-product-id='${productId}' alt="decrease-png">
          ${cartItem.quantity}
          <img src="icon/increase.png" class="increase" data-product-id='${productId}' alt="increase-png">
        </div>
        <p class="total">₦${quantityTotal.toLocaleString()}</p>
        <div class="delete-container">
          <img src="icon/icon-remove-item.png" class="delete" data-product-id='${productId}'>
        </div>
      </div>
    `;

    finalTotal += quantityTotal;
  });

  const container = document.querySelector(".cart-body");
  if (container) {
    container.innerHTML = cartHTML;
  }

  updateorderSummary(finalTotal);
  updateDashboard();
  updateOrder();
}

// Kept as a compatibility export for older imports. API cart state is not
// written to the old localStorage cart database.
export function saveToStorage() {}

/* ============================================================
   LOCAL ORDER FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================

function createOrderLocalStorage() {
  if (!cart.length) return null;

  const currentUser = getCurrentUser();
  const items = cart
    .map((item) => {
      const product = getCartProduct(item);
      if (!product) return null;
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      };
    })
    .filter(Boolean);

  if (!items.length) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 10000 || subtotal <= 0 ? 0 : 1000;

  const order = {
    id: `FD${Date.now().toString().slice(-6)}`,
    customerName: currentUser?.fullName || "Guest Customer",
    customerUsername: currentUser?.username || "guest",
    email: currentUser?.email || '',
    items,
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping,
    status: "Confirmed",
    createdAt: new Date().toLocaleString(),
    progress: 25,
    paymentMethod: "Cash on Delivery",
  };

  const orders = getStoredOrders();
  orders.unshift(order);
  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.setItem("currentOrder", JSON.stringify(order));

  cart.splice(0, cart.length);
  saveToStorage();
  updateCartQuantity();

  return order;
}

if (document.readyState !== "loading") {
  refreshCart({ silent: true });
} else {
  document.addEventListener("DOMContentLoaded", () => refreshCart({ silent: true }));
}
*/

/* ============================================================
   API CHECKOUT FLOW — ACTIVE
   ============================================================
   The backend creates the order from the authenticated user's API cart,
   clears that cart, and awards reward points.
*/
function getOrderTotals() {
  const subtotal = cart.reduce((sum, cartItem) => {
    const product = getCartProduct(cartItem);
    return sum + (product ? product.price * cartItem.quantity : 0);
  }, 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 10000 || subtotal <= 0 ? 0 : 1000;
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
}

async function checkoutWithApi() {
  const result = await checkoutOrderWithApi(getOrderTotals());
  localStorage.setItem('currentOrder', JSON.stringify(result.order));
  return result.order;
}

if (document.readyState !== "loading") {
  refreshCart({ silent: true });
} else {
  document.addEventListener("DOMContentLoaded", () => refreshCart({ silent: true }));
}

const cartBody = document.querySelector(".cart-body");
if (cartBody) {
  cartBody.addEventListener("click", (event) => {
    const increaseBtn = event.target.closest(".increase");
    const decreaseBtn = event.target.closest(".decrease");
    const deleteBtn = event.target.closest(".delete");

    if (increaseBtn) {
      const productId = increaseBtn.dataset.productId;
      const matchingItem = cart.find((item) => item.productId === productId);
      if (matchingItem) {
        updateCartItem(productId, matchingItem.quantity + 1)
          .then(() => refreshCart({ silent: true }))
          .catch((error) => alert(error.message || 'Could not update cart.'));
      }
      return;
    }

    if (decreaseBtn) {
      const productId = decreaseBtn.dataset.productId;
      const matchingItem = cart.find((item) => item.productId === productId);
      if (matchingItem && matchingItem.quantity > 1) {
        updateCartItem(productId, matchingItem.quantity - 1)
          .then(() => refreshCart({ silent: true }))
          .catch((error) => alert(error.message || 'Could not update cart.'));
      }
      return;
    }

    if (deleteBtn) {
      const productId = deleteBtn.dataset.productId;
      const cartItem = cart.find((item) => item.productId === productId);
      const matchingItem = cartItem?.product;
      document.body.classList.add("no-scroll");

      const backdrop = document.querySelector(".remove-container-backdrop");
      backdrop?.classList.add("show");

      if (!matchingItem) return;

      const removeContainerHTML = `
        <h3>Remove item from cart</h3>
        <hr>
        <p>Do you wish to remove this item from your cart?</p>
        <div class="remove-img-container">
          <img src="${getProductImage(matchingItem.image)}" alt="food-image" class="remove-img">
        </div>
        <div class="confirmation">
          <p class="cancel">No, Cancel</p>
          <p class="confirm" data-product-id='${productId}'>Yes, Remove</p>
        </div>
      `;

      const removeContainer = document.querySelector(".remove-container");
      if (removeContainer) {
        removeContainer.innerHTML = removeContainerHTML;
        removeContainer.style.display = "block";
      }

      const container = document.querySelector(".container");
      if (container) {
        container.setAttribute("inert", "");
      }
    }
  });
}

const removeContainer = document.querySelector(".remove-container");
if (removeContainer) {
  removeContainer.addEventListener("click", (event) => {
    const cancel = event.target.closest(".cancel");
    const confirm = event.target.closest(".confirm");
    document.body.classList.remove("no-scroll");

    const backdrop = document.querySelector(".remove-container-backdrop");
    backdrop?.classList.remove("show");

    if (cancel) {
      removeContainer.style.display = "none";
      const container = document.querySelector(".container");
      if (container) {
        container.removeAttribute("inert");
      }
      return;
    }

    if (confirm) {
      removeContainer.style.display = "none";
      const productId = confirm.dataset.productId;
      delFromCart(productId);
      const container = document.querySelector(".container");
      if (container) {
        container.removeAttribute("inert");
      }
    }
  });
}

async function delFromCart(productId) {
  const cartItem = cart.find((item) => item.productId === productId);
  if (!cartItem) return;

  try {
    await removeCartItem(productId, cartItem.quantity);
    await refreshCart({ silent: true });
  } catch (error) {
    alert(error.message || 'Could not remove item from cart.');
  }
}

export function updateCartQuantity() {
  let cartQuantitys = 0;
  cart.forEach((item) => {
    cartQuantitys += item.quantity;
  });

  const CQ = document.querySelector("#cart-quantity");
  if (CQ) {
    CQ.innerHTML = cartQuantitys === 0 ? "" : cartQuantitys;
  }
}

function updateorderSummary(finalTotal) {
  let shipping = finalTotal > 10000 || finalTotal <= 0 ? 0 : 1000;
  const taxP = (10 / 100) * finalTotal;

  const orderSummaryHTML = `
    <div class="order-container">
      <h3 class="summary">ORDER SUMMARY</h3>
      <hr class="summary-line">
      <p class="subtotal"><b>Subtotal(₦) :</b> <span>${finalTotal.toLocaleString()}</span></p>
      <p class="tax"><b>Tax(10%)(₦) :</b> <span>${taxP.toLocaleString()}</span></p>
      <p class="shipping"><b>Shipping(₦) :</b> <span>${shipping}</span></p>
      <hr>
      <p class="afterTotal"><b>Total(₦) :</b> <span>${(finalTotal + taxP + shipping).toLocaleString()}</span></p>
      <button type="button" class="checkout_btn">PROCEED TO CHECKOUT</button>
    </div>
  `;

  const container = document.querySelector(".order");
  if (container) {
    container.innerHTML = orderSummaryHTML;
  }
}

const orderContainer = document.querySelector(".order");
if (orderContainer) {
  orderContainer.addEventListener("click", async (event) => {
    if (event.target.closest(".checkout_btn")) {
      try {
        const order = await checkoutWithApi();
        if (!order) throw new Error("Your cart is empty. Add some meals first.");
        sendOrderToWhatsapp();
        window.location.href = "../../dashboard/order_page/order.html";
      } catch (error) {
        alert(error.message || "Could not place your order.");
      }
    }
  });
}

const clearButton = document.querySelector(".clear");
if (clearButton) {
  clearButton.addEventListener("click", async () => {
    try {
      await clearCartFromApi();
      await refreshCart({ silent: true });
    } catch (error) {
      alert(error.message || 'Could not clear cart.');
    }
  });
}

function sendOrderToWhatsapp(){
  const whatsappNumber = "2347061140462";

  const order = JSON.parse(localStorage.getItem("currentOrder"));
  if (!order) {
    console.error("No current order found.");
    return;
  }
  
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const tax = subtotal * 0.1;
  const shipping = subtotal > 10000 || subtotal <= 0 ? 0 : 1000;
  const grandTotal = subtotal + tax + shipping;

  let message = `Hello, I would like to place an order:\n\n`;
  message += `Order ID: ${order.id}\n`;
  message += `Customer Name: ${order.userName || "Customer"}\n`;
  message += `ID: ${order.userId || "N/A"}\n\n`;
  message += `Items:\n`;

  order.items.forEach((item) => {
    message += `- ${item.name} (Quantity: ${item.quantity}, Price: ₦${item.price.toLocaleString()})\n`;
  });

  message += `\nSubtotal: ₦${subtotal.toLocaleString()}`;
  message += `\nTax (10%): ₦${tax.toLocaleString()}`;
  message += `\nShipping: ₦${shipping.toLocaleString()}`;
  message += `\nTotal Amount: ₦${grandTotal.toLocaleString()}\n`;

  message += `\nPlease confirm my order and send payment details.`;

  console.log(message);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me{whatsappNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, "_blank");
}
