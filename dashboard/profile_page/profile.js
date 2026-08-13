import { changePasswordWithApi, updateProfileWithApi } from "../../data/auth-api.js";
import { getMyOrdersFromApi } from "../../data/orders-api.js";

const passwordInput = document.querySelector('.password');
const toggleBtn = document.querySelector('.toggle-password');
const changePasswordBtn = document.querySelector('.change-password-btn');
const savePasswordBtn = document.querySelector('.save-password-btn');

function getCurrentUser(user = null) {
  if (user) return user;

  try {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  } catch {
    return null;
  }
}

function setFieldValue(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;

  if ('value' in el) {
    el.value = value ?? '';
  } else {
    el.textContent = value ?? '';
  }
}

export function renderInfo(user = null) {
  const currentUser = getCurrentUser(user);
  const fields = {
    '#fullName': currentUser?.fullName ?? '',
    '#email': currentUser?.email ?? '',
    '#phone': currentUser?.phoneNumber ?? '',
  };

  Object.entries(fields).forEach(([selector, value]) => {
    setFieldValue(selector, value);
  });

  renderRecentOrders();
}

async function renderRecentOrders() {
  const recentOrdersContainer = document.querySelector(".recent-orders");

  if (!recentOrdersContainer) return;

  let orders = [];
  try {
    orders = await getMyOrdersFromApi({ limit: 4 });
  } catch (error) {
    recentOrdersContainer.innerHTML = `<p class="empty-state">${error.message || 'Could not load recent orders.'}</p>`;
    return;
  }

  const rows = orders
    .toReversed()
    .slice(0, 4)
    .map(
      (order) => `
      <div class="order-row">
        <div class="order-meta">
          <p class="order-id">${order.id}</p>
          <p class="order-details">${order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
        </div>
        <p class="order-date">${order.createdAt}</p>
        <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
        <p class="order-price">₦${order.total.toLocaleString()}</p>
      </div>
    `
    ).join("");

  recentOrdersContainer.innerHTML = `
    <div class="heading">
      <h2>Recent Orders</h2>
      <a href="../order_page/order.html">View All Orders</a>
    </div>
    ${rows || '<p class="empty-state">No orders yet. Place an order from the menu to see it here.</p>'}
  `;
}

/* ============================================================
   LOCAL PROFILE UPDATE FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================
document.querySelector('.edit-button')?.addEventListener('click', ()=>  {
  const currentUser = getCurrentUser();
  if(!currentUser) return

  const newProfileData = {
    fullName: document.querySelector('#fullName').value || currentUser.fullName,
    email: document.querySelector('#email').value || currentUser.email,
    phoneNumber: document.querySelector('#phone').value || currentUser.phoneNumber,
    password: currentUser.password
  }
  updateProfile(newProfileData);
})

if (passwordInput && toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    const icon = toggleBtn.querySelector('ion-icon');
    if (icon) {
      icon.name = isPassword ? 'eye-off' : 'eye';
    }
  });
}

function initializeProfile() {
  renderInfo(getCurrentUser());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProfile, { once: true });
} else {
  initializeProfile();
}


const passwordWrapper = document.querySelector('.password-wrapper');

changePasswordBtn?.addEventListener('click', () => {
  
  passwordWrapper?.classList.toggle('show');
  changePasswordBtn?.classList.toggle('active');
})

/* ============================================================
   LOCAL PASSWORD FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================
savePasswordBtn?.addEventListener('click', () => {
  const currentUser = getCurrentUser();
  const errorMessage = document.querySelector('.error-mssg');
  const currentPasswordInput = document.getElementById('current-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmNewPasswordInput= document.getElementById('confirm-password');

  if (!currentUser || !errorMessage || !currentPasswordInput || !newPasswordInput || !confirmNewPasswordInput) return;

  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmNewPassword = confirmNewPasswordInput.value.trim();

  if (!currentPassword || !newPassword || !confirmNewPassword) return;

  if (currentPassword !== currentUser.password) {
    errorMessage.style.display = 'block';
  }else{
    const newPasswordsMatch = newPassword === confirmNewPassword;
    const errorNewMessage = document.querySelector('.error-new');
    
    if (!newPasswordsMatch) {
      errorNewMessage.style.display = 'block';
    } else {
      errorNewMessage.style.display = 'none';
      errorMessage.style.display = 'none';
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmNewPasswordInput.value = '';
      passwordWrapper?.classList.toggle('show');
      changePasswordBtn?.classList.toggle('active');
      updateProfile({ ...currentUser, password: newPassword });
    }
  }
})
*/

/* ============================================================
   API PASSWORD FLOW — ACTIVE
   ============================================================
*/

const passwordWrapper = document.querySelector('.password-wrapper');
changePasswordBtn?.addEventListener('click', () => {
  
  passwordWrapper?.classList.toggle('show');
  changePasswordBtn?.classList.toggle('active');
})

savePasswordBtn?.addEventListener('click', async () => {
  const errorMessage = document.querySelector('.error-mssg');
  const errorNewMessage = document.querySelector('.error-new');
  const currentPassword = document.getElementById('current-password')?.value.trim() || '';
  const newPassword = document.getElementById('new-password')?.value.trim() || '';
  const confirmNewPassword = document.getElementById('confirm-password')?.value.trim() || '';

  if (errorMessage) errorMessage.style.display = 'none';
  if (errorNewMessage) errorNewMessage.style.display = 'none';

  try {
    await changePasswordWithApi({ oldPassword: currentPassword, newPassword, confirmNewPassword });
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    passwordWrapper?.classList.remove('show');
    changePasswordBtn?.classList.remove('active');
    alert('Password changed successfully.');
  } catch (error) {
    if (error.message?.toLowerCase().includes('match')) {
      if (errorNewMessage) errorNewMessage.style.display = 'block';
    } else if (errorMessage) {
      errorMessage.textContent = error.message || 'Could not change password.';
      errorMessage.style.display = 'block';
    }
  }
});


/* ============================================================
   API PROFILE UPDATE FLOW — ACTIVE
   ============================================================
   Mapping: frontend fullName/phoneNumber -> API name/phone
*/
document.querySelector('.edit-button')?.addEventListener('click', async () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  try {
    const user = await updateProfileWithApi({
      fullName: document.querySelector('#fullName')?.value.trim() || currentUser.fullName,
      email: document.querySelector('#email')?.value.trim() || currentUser.email,
      phoneNumber: document.querySelector('#phone')?.value.trim() || ''
    });

    localStorage.setItem('currentUser', JSON.stringify(user));
    renderInfo(user);
    alert('Profile updated successfully.');
  } catch (error) {
    alert(error.message || 'Could not update profile.');
  }
});
