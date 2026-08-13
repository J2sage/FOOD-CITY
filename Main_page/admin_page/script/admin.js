import { getAdminOrders, getAdminOrderStats, updateOrderStatus } from '../../../data/admin-api.js';

/* ============================================================
   LOCAL ADMIN ORDER FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================
   The old version read orders from localStorage and changed statuses locally.
*/

/* ============================================================
   API ADMIN ORDER FLOW — ACTIVE
   ============================================================
*/
const adminContainer = document.querySelector('#admin-list');
const searchInputElement = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-buttons button');
const countReceived = document.getElementById('countReceived');
const countPreparing = document.getElementById('countPreparing');
const countDelivering = document.getElementById('countDelivering');
const countDelivered = document.getElementById('countDelivered');

const normalize = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

let orders = [];
let activeFilter = '';

const displayStatus = (status) => String(status || '').replaceAll('_', ' ');

function renderOrders(orderList) {
  if (!adminContainer) return;
  if (!orderList.length) {
    adminContainer.innerHTML = '<div class="no-orders-message"><p>No orders found in this category.</p></div>';
    return;
  }

  adminContainer.innerHTML = orderList.map((order) => {
    const itemsHtml = (order.items || []).map((item) => `
      <li class="admin-item-row"><span class="item-qty">${item.quantity}x</span><span class="item-name">${item.name}</span></li>
    `).join('');
    const status = displayStatus(order.status);

    return `
      <tr>
        <td class="order-id">${order.id}</td>
        <td><div class="customer"><span class="name">${order.userName || order.customerName || ''}</span><span class="email">${order.email || ''}</span></div></td>
        <td>${itemsHtml}</td>
        <td class="price"><strong>₦${Number(order.total || 0).toLocaleString()}</strong></td>
        <td><button type="button" class="status-badge ${String(order.status).toLowerCase()}" data-order-id="${order.id}"><ion-icon name="checkmark-circle"></ion-icon> ${status}</button></td>
      </tr>
    `;
  }).join('');
}

async function loadStats() {
  try {
    const stats = await getAdminOrderStats();
    if (countReceived) countReceived.textContent = stats.confirmed ?? 0;
    if (countPreparing) countPreparing.textContent = stats.being_prepared ?? 0;
    if (countDelivering) countDelivering.textContent = stats.on_the_way ?? 0;
    if (countDelivered) countDelivered.textContent = stats.delivered ?? 0;
  } catch (error) {
    console.error(error.message);
  }
}

async function loadOrders() {
  try {
    orders = await getAdminOrders({ q: searchInputElement?.value.trim() || '', status: activeFilter });
    renderOrders(orders);
    await loadStats();
  } catch (error) {
    if (adminContainer) adminContainer.innerHTML = `<p class="empty-state">${error.message}</p>`;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.filter-buttons .active')?.classList.remove('active');
    button.classList.add('active');
    activeFilter = {
      all: '',
      received: 'confirmed',
      preparing: 'being_prepared',
      'on-the-way': 'on_the_way',
      delivered: 'delivered'
    }[button.dataset.filter] ?? '';
    loadOrders();
  });
});

searchInputElement?.addEventListener('input', loadOrders);

adminContainer?.addEventListener('click', async (event) => {
  const statusButton = event.target.closest('.status-badge');
  if (!statusButton) return;

  const order = orders.find((item) => item.id === statusButton.dataset.orderId);
  if (!order) return;

  const nextStatus = {
    confirmed: 'being_prepared',
    being_prepared: 'on_the_way',
    on_the_way: 'delivered'
  }[order.status];

  if (!nextStatus) return;

  try {
    await updateOrderStatus(order.id, nextStatus);
    await loadOrders();
  } catch (error) {
    alert(error.message || 'Could not update order status.');
  }
});

loadOrders();
