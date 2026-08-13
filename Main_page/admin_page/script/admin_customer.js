import { deleteCustomer, getCustomersFromApi } from '../../../data/admin-api.js';

/* ============================================================
   LOCAL ADMIN CUSTOMER FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================
   The old version used seedUsers() and changed active status locally.
*/

/* ============================================================
   API ADMIN CUSTOMER FLOW — ACTIVE
   ============================================================
*/
const customerBodyElement = document.querySelector('.js-customer-body');
const selectedStatus = document.getElementById('selected-status');
const searchInputElement = document.getElementById('search-input');
const filterButton = document.getElementsByClassName('secondary-btn')[0];
const refreshButton = document.querySelector('.add-item-btn');
const deleteModal = document.getElementById('delete-customer-modal');
const deleteModalCustomerName = document.querySelector('.js-delete-customer-name');
const cancelDeleteButton = document.querySelector('.js-cancel-delete');
const confirmDeleteButton = document.querySelector('.js-confirm-delete');
let customers = [];
let customerToDelete = null;

function setCustomersLoading(isLoading) {
  if (filterButton) filterButton.disabled = isLoading;
  if (refreshButton) {
    refreshButton.disabled = isLoading;
    refreshButton.innerHTML = isLoading
      ? '<span class="loading-spinner" aria-hidden="true"></span> Loading...'
      : '<ion-icon name="sync"></ion-icon> Refresh';
  }
  if (isLoading && customerBodyElement) {
    customerBodyElement.innerHTML = '<tr><td class="loading-cell" colspan="6"><span class="loading-spinner" aria-hidden="true"></span> Loading customers...</td></tr>';
  }
}

function isCustomerActive(customer) {
  const orders = Array.isArray(customer.orders) ? customer.orders : null;
  if (orders) {
    return orders.some((order) => String(order.status || '').trim().toLowerCase() !== 'delivered');
  }
  // The customers endpoint returns this value after applying the same rule
  // when it does not include the customer's orders in the response.
  return Boolean(customer.active);
}

const showNoResults = () => {
  if (customerBodyElement) customerBodyElement.innerHTML = '<tr><td colspan="6">No matching customers</td></tr>';
};

function renderCustomerDetails(list) {
  if (!customerBodyElement) return;
  customerBodyElement.innerHTML = list.map((customer) => {
    const status = isCustomerActive(customer) ? 'active' : 'inactive';
    return `
      <tr>
        <td class="item-cell"><img class="avatar" src="../../Main_page/assets/icons/customer1.png" alt="${customer.name}"><div><div class="customer-name">${customer.name}</div><div class="customer-email">${customer.email}</div></div></td>
        <td>${customer.name}</td>
        <td>${customer.phone || ''}</td>
        <td>${customer.totalOrders || 0}</td>
        <td><span class="status-badge ${status}"><ion-icon name="checkmark-circle"></ion-icon> ${status}</span></td>
        <td class="action-buttons"><button type="button" aria-label="Delete ${customer.name}" class="delete-customer" data-customer-id="${customer.id}" data-customer-name="${customer.name}"><ion-icon name="trash"></ion-icon></button></td>
      </tr>
    `;
  }).join('');
}

async function loadCustomers() {
  setCustomersLoading(true);
  try {
    customers = await getCustomersFromApi({
      q: searchInputElement?.value.trim() || '',
      active: selectedStatus?.value || 'all'
    });
    if (!customers.length) return showNoResults();
    renderCustomerDetails(customers);
  } catch (error) {
    if (customerBodyElement) customerBodyElement.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
  } finally {
    setCustomersLoading(false);
  }
}

filterButton?.addEventListener('click', loadCustomers);
searchInputElement?.addEventListener('input', loadCustomers);
refreshButton?.addEventListener('click', loadCustomers);

function closeDeleteModal() {
  customerToDelete = null;
  deleteModal?.classList.remove('is-open');
  deleteModal?.setAttribute('aria-hidden', 'true');
  if (deleteModal) deleteModal.style.display = 'none';
}

function openDeleteModal(customer) {
  customerToDelete = customer;
  if (deleteModalCustomerName) deleteModalCustomerName.textContent = customer.name;
  deleteModal?.classList.add('is-open');
  deleteModal?.setAttribute('aria-hidden', 'false');
  if (deleteModal) deleteModal.style.display = 'flex';
  confirmDeleteButton?.focus();
}

cancelDeleteButton?.addEventListener('click', closeDeleteModal);
deleteModal?.addEventListener('click', (event) => {
  if (event.target === deleteModal) closeDeleteModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && deleteModal?.classList.contains('is-open')) closeDeleteModal();
});

confirmDeleteButton?.addEventListener('click', async () => {
  if (!customerToDelete) return;
  confirmDeleteButton.disabled = true;
  confirmDeleteButton.innerHTML = '<span class="loading-spinner" aria-hidden="true"></span> Deleting...';
  try {
    await deleteCustomer(customerToDelete.id);
    closeDeleteModal();
    await loadCustomers();
  } catch (error) {
    alert(error.message || 'Could not delete customer account.');
  } finally {
    confirmDeleteButton.disabled = false;
    confirmDeleteButton.textContent = 'Yes, delete';
  }
});

document.addEventListener('click', (event) => {
  const deleteButton = event.target instanceof Element ? event.target.closest('.delete-customer') : null;
  if (!deleteButton) return;
  const customer = customers.find((item) => String(item.id) === deleteButton.dataset.customerId);
  if (customer) openDeleteModal(customer);
});

loadCustomers();
