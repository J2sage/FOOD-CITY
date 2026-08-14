import { renderInfo } from './dashboard/profile_page/profile.js';

import { loginUserWithApi, registerUserWithApi, updateProfileWithApi } from './data/auth-api.js';

export const logInBox = document.querySelector('.login-box');
const backdrop = document.querySelector('.remove-container-backdrop');
const menuLink = document.getElementById('menu-link');


if (logInBox) {
  logInBox.innerHTML = `
    <!-- LOGIN FORM CONTAINER -->
    <div class="form-container login-form-wrapper">
      <form id="login-form" action="">
        <ion-icon name="close" class="modal-close" id="login-close"></ion-icon>
        <h2>Login</h2>
        <div class="input-box">
          <span class="icon"><ion-icon name="mail"></ion-icon></span>
          <input id="login-email" name="email" class="username" type="email" autocomplete="email" required>
          <label for="login-email">Email</label>
        </div>
        <div class="input-box">
          <span class="icon"><ion-icon name="lock"></ion-icon></span>
          <input id="login-password" name="password" type="password" class="password" autocomplete="current-password" required>
          <label for="login-password">Password</label>
        </div>
        <div class="remember-forget">
          <label for="remember-me"><input id="remember-me" name="rememberMe" type="checkbox">Remember me</label>
          <a href="#">Forgot Password?</a>
        </div>
        <button type="submit" class="btn">Login</button>
        <div class="register-link">
          <p>Don't have an account? <a href="#" id="go-to-register">Register</a></p>
        </div>
      </form>
    </div>

    <!-- REGISTER FORM CONTAINER (Hidden by default via CSS) -->
    <div class="form-container register-form-wrapper" style="display: none;">
      <form id="register-form" action="">
        <ion-icon name="close" class="modal-close" id="register-close"></ion-icon>
        <h2>Registration</h2>
        <div class="input-box">
          <span class="icon"><ion-icon name="person"></ion-icon></span>
          <input id="register-name" name="name" class="reg-fullname" type="text" autocomplete="name" required>
          <label for="register-name">Full Name</label>
        </div>

        <div class="input-box">
          <span class="icon"><ion-icon name="mail"></ion-icon></span>
          <input id="register-email" name="email" class="reg-email" type="email" autocomplete="email" required>
          <label for="register-email">Email</label>
        </div>

        <div class="input-box">
          <span class="icon"><ion-icon name="call"></ion-icon></span>
          <input id="register-phone" name="phone" class="reg-phone" type="tel" autocomplete="tel" inputmode="tel" required>
          <label for="register-phone">Phone Number</label>
        </div>
        
        <div class="input-box">
          <span class="icon"><ion-icon name="lock"></ion-icon></span>
          <input id="register-password" name="password" type="password" class="reg-password" autocomplete="new-password" required>
          <label for="register-password">Password</label>
        </div>
        <button type="submit" class="btn">Register</button>
        <div class="register-link">
          <p>Already have an account? <a href="#" id="go-to-login">Login</a></p>
        </div>
      </form>
    </div>
  `;

  // Bind Event Listeners immediately after injection
  document.getElementById('login-close')?.addEventListener('click', closeLoginModal);
  document.getElementById('register-close')?.addEventListener('click', closeLoginModal);

  // UI Panel Toggles
  document.getElementById('go-to-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterPanel();
  });
  document.getElementById('go-to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginPanel();
  });

  // Form Submissions
  document.getElementById('login-form')?.addEventListener('submit', logIn);
  document.getElementById('register-form')?.addEventListener('submit', createAccount);
}

// UI Panel State Management
function showRegisterPanel() {
  if (!logInBox) return;
  logInBox.querySelector('.login-form-wrapper').style.display = 'none';
  logInBox.querySelector('.register-form-wrapper').style.display = 'block';
}

function showLoginPanel() {
  if (!logInBox) return;
  logInBox.querySelector('.login-form-wrapper').style.display = 'block';
  logInBox.querySelector('.register-form-wrapper').style.display = 'none';
}

export function openLoginModal() {
  if (logInBox) {
    showLoginPanel(); // Reset view to login when opened
    logInBox.style.display = 'flex';
    backdrop?.classList.add('show');
    document.body.classList.add('no-scroll');
  }
}

export function closeLoginModal() {
  if (logInBox) {
    logInBox.style.display = 'none';
  }
  backdrop?.classList.remove('show');
  document.body.classList.remove('no-scroll');
}

export function seedUsers() {
  const storedUsers = JSON.parse(localStorage.getItem('usersDB') || 'null');
  if (storedUsers && storedUsers.length) {
    return storedUsers;
  }
  const mockUsers = [
    { username: 'admin', password: '123', role: 'admin' },
    { username: 'jibril', password: '123', role: 'customer', fullName: 'Jibril Adebayo', active: true, email: 'jibril@example.com', phoneNumber: '+1 202 555 0174' },
    { username: 'balo', password: '456', role: 'customer', fullName: 'Balo Johnson', active: false, email: 'balo@example.com', phoneNumber: '+1 202 555 0183' }
  ];
  localStorage.setItem('usersDB', JSON.stringify(mockUsers));
  return mockUsers;
}

/* ============================================================
   LOCAL STORAGE REGISTER FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================

   Mapping: form fullName -> newUser.fullName -> localStorage.usersDB

function createAccountLocalStorage(event) {
  event?.preventDefault();
  
  const fullName = logInBox.querySelector('.reg-fullname').value.trim();
  const email = logInBox.querySelector('.reg-email').value.trim();
  const password = logInBox.querySelector('.reg-password').value.trim();

  const users = seedUsers();

  // Check if user already exists
  const userExists = users.some(u => u.username === username);
  if (userExists) {
    alert('This username is already taken. Please try another.');
    return;
  }

  // Structure the new customer profile
  const newUser = {
    password,
    role: 'customer',
    fullName,
    active: true,
    email
  };

  // Update database array
  users.push(newUser);
  localStorage.setItem('usersDB', JSON.stringify(users));

  // Log the user in automatically after success
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  updateLoginLabel(newUser);
  updatedashBoardLabel(newUser);
  toggleMenuLink(newUser);
  closeLoginModal();
  redirectBasedOnRole(newUser);
  renderInfo(newUser);

  // Clear input fields
  document.getElementById('register-form').reset();
}
*/

/* ============================================================
   API REGISTER FLOW — ACTIVE
   ============================================================

   Mapping: form fullName -> API name -> API user.name -> frontend fullName
*/

async function createAccount(event) {
  event?.preventDefault();
  if (!logInBox) return;

  const fullName = logInBox.querySelector('.reg-fullname')?.value.trim() || '';
  const email = logInBox.querySelector('.reg-email')?.value.trim() || '';
  const phoneNumber = logInBox.querySelector('.reg-phone')?.value.trim() || '';
  const password = logInBox.querySelector('.reg-password')?.value.trim() || '';

  try {
    const { token, user } = await registerUserWithApi({
      fullName,
      email,
      phoneNumber,
      password
    });

    // This stores the API session, not the old mock users database.
    localStorage.setItem('authToken', token);
    const updatedUser = await updateProfileWithApi({
      fullName,
      email,
      phoneNumber
    });
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    updateLoginLabel(updatedUser);
    updatedashBoardLabel(updatedUser);
    toggleMenuLink(updatedUser);
    closeLoginModal();
    renderInfo(updatedUser);
    document.getElementById('register-form')?.reset();
    redirectBasedOnRole(updatedUser);
  } catch (error) {
    alert(error.message || 'Registration failed. Please try again.');
  }
}

export function updateLoginLabel(user = null) {
  document.querySelectorAll('.login-span').forEach((span) => {
    span.textContent = user ? user.username : 'LOGIN';
  });
}

export function updatedashBoardLabel(user = null) {
  document.querySelectorAll('.full-name').forEach((span) => {
    span.textContent = user ? user.fullName : '';
  });
}

export function toggleMenuLink(user = null) {
  if (menuLink) {
    const shouldHide = !!user && user.role === 'admin';
    menuLink.style.display = shouldHide ? 'none' : '';
  }
}

function protectMenuPage(user = null) {
  const isMenuPage = window.location.pathname.includes('/Menu_page/');
  if (isMenuPage && user?.role === 'admin') {
    window.location.href = '../Main_page/admin_page/admin.html';
  }
}

export function redirectBasedOnRole(user) {
  if (!user) return;
  toggleMenuLink(user);
  // const redirectPath = user.role === 'admin' ? '../Main_page/admin_page/admin.html' : '../dashboard/index.html';
  window.location.href = `../dashboard/index.html`;
}

/* ============================================================
   LOCAL STORAGE LOGIN FLOW — COMMENTED OUT FOR COMPARISON
   ============================================================

function logInLocalStorage(event) {
  event?.preventDefault();
  if (!logInBox) return;

  const name = logInBox.querySelector('.username')?.value.trim().toLowerCase() || '';
  const password = logInBox.querySelector('.password')?.value.trim() || '';
  const users = seedUsers();
  
  const foundUser = users.find((u) => u.email === name && u.password === password);
  if (foundUser) {
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    updateLoginLabel(foundUser);
    updatedashBoardLabel(foundUser);
    toggleMenuLink(foundUser);
    closeLoginModal();
    redirectBasedOnRole(foundUser);
    renderInfo(foundUser);
  } else {
    alert('Invalid Credentials');
  }
}
*/

/* ============================================================
   API LOGIN FLOW — ACTIVE
   ============================================================

   Mapping: frontend email/password -> API email/password
   API user.name -> frontend fullName
*/
async function logIn(event) {
  event?.preventDefault();
  if (!logInBox) return;

  const email = logInBox.querySelector('.username')?.value.trim().toLowerCase() || '';
  const password = logInBox.querySelector('.password')?.value.trim() || '';

  try {
    const { token, user } = await loginUserWithApi({ email, password });

    if (user.role === 'admin') {
      showAlertModal('Warning!', 'Please use the administrator login..', 'person-add-outline');
    }else{
      

      // This stores the API session, not the old mock users database.
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      updateLoginLabel(user);
      updatedashBoardLabel(user);
      toggleMenuLink(user);
      closeLoginModal();
      renderInfo(user);
      redirectBasedOnRole(user);
    }
  } catch (error) {
    if (error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('exist')) {
      showAlertModal('Account Not Found', 'This account does not exist. Please check your credentials or register an account.', 'person-add-outline');
    } else {
      showAlertModal('Login Failed', error.message || 'Invalid email or password combination.', 'lock-open-outline');
    }

  }
}

document.querySelector('.logout-btn')?.addEventListener('click', logOut);

function getHomePagePath() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/dashboard/order_page/')) return '../../index.html';
  if (path.includes('/dashboard/')) return '../index.html';
  if (path.includes('/main_page/admin_page/')) return '../../index.html';
  if (path.includes('/main_page/')) return '../index.html';
  if (path.includes('/menu_page/')) return '../index.html';
  return 'index.html';
}

function logOut() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
  updateLoginLabel();
  updatedashBoardLabel();
  renderInfo();
  toggleMenuLink();
  window.location.replace(getHomePagePath());
}

// Intercept Login navigation button clicks
document.querySelectorAll('.log-in').forEach((logInButton) => {
  logInButton.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
      redirectBasedOnRole(currentUser);
    } else {
      openLoginModal();

    }
  });
});

// App Initializationexport 
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

if (currentUser) {
  updateLoginLabel(currentUser);
  updatedashBoardLabel(currentUser);
  toggleMenuLink(currentUser);
  protectMenuPage(currentUser);
  renderInfo(currentUser);
} else {
  toggleMenuLink();
}
export function updateProfile({ fullName, email, phoneNumber, password }) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!currentUser) return null;
  const usersDB = JSON.parse(localStorage.getItem('usersDB') || '[]');
  const updatedUser = { ...currentUser, fullName, email, phoneNumber, password };
  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  const newUsersDB = usersDB.map((user) => user.username === updatedUser.username ? updatedUser : user);
  localStorage.setItem('usersDB', JSON.stringify(newUsersDB));
  renderInfo(updatedUser);
  updatedashBoardLabel(updatedUser);
  return updatedUser;
}



// Dynamic Global Alert Modal Trigger
export function showAlertModal(title, message, iconName = 'alert-circle') {

  if (document.querySelector('.alert-modal-wrapper')) return;

  backdrop?.classList.add('show');
  document.body.classList.add('no-scroll');

  const alertContainer = document.createElement('div');
  alertContainer.className = 'alert-modal-wrapper';
  alertContainer.innerHTML = `
    <ion-icon name="${iconName}"></ion-icon>
    <h3>${title}</h3>
    <p>${message}</p>
    <button class="alert-btn">OK</button>
  `;

  alertContainer.querySelector('.alert-btn').addEventListener('click', () => {
    alertContainer.remove();
    if (logInBox && logInBox.style.display === 'flex') {
      closeLoginModal();
    } else {
      backdrop?.classList.remove('show');
      document.body.classList.remove('no-scroll');
    }
  });

  document.body.appendChild(alertContainer);
}

