import { getProduct } from "../Menu_page/script/food.js";
import { cart } from "../Menu_page/cart_page/renderOrder.js";
import { getMyOrdersFromApi } from "../data/orders-api.js";
import { getReviewsFromApi } from "../data/reviews-api.js";

function getCurrentOrder() {
  // API order cache: the source of truth is loaded by loadLatestOrder().
  return JSON.parse(localStorage.getItem("currentOrder") || "null");
}

/* ============================================================
   LOCAL ORDER DISPLAY FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================
   The previous dashboard relied only on currentOrder in localStorage.
*/

async function loadLatestOrder() {
  try {
    const [orders, reviewsResponse] = await Promise.all([
      getMyOrdersFromApi(),
      getReviewsFromApi()
    ]);
    if (orders[0]) localStorage.setItem('currentOrder', JSON.stringify(orders[0]));
    updateStatGrid(orders, reviewsResponse);
    updateDashboard();
    updateOrder();
  } catch (error) {
    console.error(error.message);
  }
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function updateStatGrid(orders = [], reviewsResponse = []) {
  const reviews = Array.isArray(reviewsResponse)
    ? reviewsResponse
    : reviewsResponse.reviews || reviewsResponse.data || [];
  const thisWeek = orders.filter((order) => {
    const placedAt = new Date(order.createdAt);
    return !Number.isNaN(placedAt) && Date.now() - placedAt.getTime() <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const itemCounts = new Map();
  orders.forEach((order) => order.items?.forEach((item) => {
    const name = item.name || 'Menu item';
    itemCounts.set(name, (itemCounts.get(name) || 0) + Number(item.quantity || 0));
  }));
  const [favoriteName, favoriteCount] = [...itemCounts.entries()]
    .sort(([, a], [, b]) => b - a)[0] || ['No orders yet', 0];
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const earnedPoints = orders.reduce((sum, order) => sum + Number(order.rewardPoints || order.pointsEarned || 0), 0);
  const rewards = Number(currentUser?.rewardPoints ?? currentUser?.points ?? earnedPoints);
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;

  setText('.orders-value', orders.length.toLocaleString());
  setText('.orders-extra', `${thisWeek} this week`);
  setText('.favorites-value', favoriteCount.toLocaleString());
  setText('.favorites-extra', favoriteName);
  setText('.rewards-value', rewards.toLocaleString());
  setText('.rating-value', averageRating ? averageRating.toFixed(1) : '—');
  setText('.rating-extra', averageRating ? 'out of 5' : 'No ratings yet');
}

function getOrderItems() {
  const currentOrder = getCurrentOrder();
  if (currentOrder?.items?.length) {
    return currentOrder.items;
  }

  return cart
    .map((cartItem) => {
      const product = cartItem.product ?? getProduct(cartItem.productId);
      if (!product) return null;
      return {
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
        productId: cartItem.productId,
      };
    })
    .filter(Boolean);
}

function getProductImage(image, prefix) {
  return /^https?:\/\//i.test(image) ? image : `${prefix}${image}`;
}

export function updateDashboard() {
  const currentOrder = getCurrentOrder();
  const orderStatusElement = document.querySelector('.order-status');
  const orderDateElement = document.querySelector('.order-date');
  const orderIdElement = document.querySelector('.order-id');
  const progressBar = document.getElementById('file');

  if (orderStatusElement && orderDateElement && orderIdElement) {
    orderStatusElement.innerHTML = `${currentOrder?.status ?? ''}`;
    orderIdElement.innerHTML = `${currentOrder?.id ?? ''}`;
    orderDateElement.innerHTML = `${currentOrder?.createdAt ?? ''}`;
  }

  if (progressBar && currentOrder && currentOrder.status) {
  // Convert status to lowercase to safely match any backend formatting
  const status = currentOrder.status.toLowerCase();

  if (status === 'confirmed') {
      progressBar.value = 25;
    } else if (status === 'being_prepared') {
      progressBar.value = 50;
    } else if (status === 'on_the_way' || status === 'on the way') { 
      progressBar.value = 75;
    } else if (status === 'delivered' || status === 'completed') {
      progressBar.value = 100;
    } else {
      progressBar.value = 0; 
    }
  }

  const orderItems = getOrderItems();
  let dashboardHTML = "";
  let itemsSubtotal = 0;

  orderItems.forEach((item) => {
    const itemPrice = item.price * item.quantity;
    dashboardHTML += `
      <li>
        <div class="item-left">
          <img src="${getProductImage(item.image, '../Menu_page/')}" alt="${item.name}"> ${item.name}
        </div>
        <p class="item-price">₦${itemPrice.toLocaleString()}</p>
      </li>
    `;
    itemsSubtotal += itemPrice;
  });

  const tax = itemsSubtotal * 0.1;
  const shipping = itemsSubtotal > 10000 || itemsSubtotal <= 0 ? 0 : 1000;

  // The backend total includes tax and shipping; use it whenever it is available.
  const finalTotal = Number(currentOrder?.total ?? (itemsSubtotal + tax + shipping));

  


  const container = document.querySelector(".item-list");
  if (container) {
    container.innerHTML = dashboardHTML || '<li class="empty-state">No active order yet.</li>';
  }

  const updateCurrencyField = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) {
      // textContent is safer and faster than innerHTML for plain text
      element.textContent = `₦${value.toLocaleString()}`; 
    }
  };

  // Clean, readable usage
  updateCurrencyField(".shippingPElement", shipping);
  updateCurrencyField(".taxPElement", tax);
  updateCurrencyField(".totalPElement", (finalTotal + tax + shipping));
}

export function updateOrder() {
  const orderItems = getOrderItems();
  let orderHTML = "";

  if (!orderItems.length) {
    const details = document.querySelector(".details");
    if (details) {
      details.innerHTML = '<p class="empty-state">No active order yet.</p>';
    }
    return;
  }

  orderItems.forEach((item) => {
    orderHTML += `
      <div class="cart-item">
        <div class="product-info">
          <img src="${getProductImage(item.image, '../../Menu_page/')}" alt="${item.name}">
          <div class="text">
            <p class="name">${item.name}</p>
            <p class="stock">In stock</p>
          </div>
        </div>
        <p class="price">₦${item.price.toLocaleString()}</p>
        <div class="quantity">x${item.quantity}</div>
        <p class="total">₦${(item.price * item.quantity).toLocaleString()}</p>
      </div>
    `;
  });

  const details = document.querySelector(".details");
  if (details) {
    details.innerHTML = orderHTML;
  }
}

loadLatestOrder();
