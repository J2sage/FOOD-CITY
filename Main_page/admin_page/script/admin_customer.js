import { getCustomersFromApi, updateCustomerActive } from '../../../data/admin-api.js';

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
const statusModal = document.getElementById('customer-status-modal');
const statusModalTitle = document.getElementById('customer-status-title');
const statusModalMessage = document.querySelector('.js-customer-status-message');
const cancelStatusChangeButton = document.querySelector('.js-cancel-status-change');
const confirmStatusChangeButton = document.querySelector('.js-confirm-status-change');
let customers = [];
let customerStatusChange = null;

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

const isCustomerActive = (customer) => Boolean(customer.active);

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
        <td class="action-buttons"><button type="button" aria-label="${status === 'active' ? 'Suspend' : 'Reactivate'} ${customer.name}" class="customer-status-action ${status}" data-customer-id="${customer.id}"><ion-icon name="${status === 'active' ? 'pause' : 'play'}"></ion-icon><span>${status === 'active' ? 'Suspend' : 'Reactivate'}</span></button></td>
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

function closeStatusModal() {
  customerStatusChange = null;
  statusModal?.classList.remove('is-open');
  statusModal?.setAttribute('aria-hidden', 'true');
  if (statusModal) statusModal.style.display = 'none';
}

function openStatusModal(customer) {
  const nextActive = !isCustomerActive(customer);
  customerStatusChange = { customer, nextActive };
  const action = nextActive ? 'Reactivate' : 'Suspend';
  if (statusModalTitle) statusModalTitle.textContent = `${action} customer account?`;
  if (statusModalMessage) statusModalMessage.textContent = nextActive
    ? `This will reactivate ${customer.name}. They will be able to use their account again.`
    : `This will suspend ${customer.name}. They will not be able to use their account until it is reactivated.`;
  if (confirmStatusChangeButton) confirmStatusChangeButton.textContent = `Yes, ${action.toLowerCase()}`;
  statusModal?.classList.add('is-open');
  statusModal?.setAttribute('aria-hidden', 'false');
  if (statusModal) statusModal.style.display = 'flex';
  confirmStatusChangeButton?.focus();
}

cancelStatusChangeButton?.addEventListener('click', closeStatusModal);
statusModal?.addEventListener('click', (event) => {
  if (event.target === statusModal) closeStatusModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && statusModal?.classList.contains('is-open')) closeStatusModal();
});

confirmStatusChangeButton?.addEventListener('click', async () => {
  if (!customerStatusChange) return;
  const { customer, nextActive } = customerStatusChange;
  confirmStatusChangeButton.disabled = true;
  confirmStatusChangeButton.innerHTML = `<span class="loading-spinner" aria-hidden="true"></span> ${nextActive ? 'Reactivating' : 'Suspending'}...`;
  try {
    await updateCustomerActive(customer.id, nextActive);
    closeStatusModal();
    await loadCustomers();
  } catch (error) {
    alert(error.message || 'Could not update customer account status.');
  } finally {
    confirmStatusChangeButton.disabled = false;
    confirmStatusChangeButton.textContent = `Yes, ${nextActive ? 'reactivate' : 'suspend'}`;
  }
});

document.addEventListener('click', (event) => {
  const statusButton = event.target instanceof Element ? event.target.closest('.customer-status-action') : null;
  if (!statusButton) return;
  const customer = customers.find((item) => String(item.id) === statusButton.dataset.customerId);
  if (customer) openStatusModal(customer);
});

loadCustomers();
