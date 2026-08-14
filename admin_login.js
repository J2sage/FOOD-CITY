import { renderInfo } from "./dashboard/profile_page/profile.js";
import { loginUserWithApi } from "./data/auth-api.js";
import { redirectBasedOnRole, openLoginModal, showAlertModal, toggleMenuLink, updatedashBoardLabel, updateLoginLabel } from "./login.js";
const logInBox = document.querySelector('.form-container');
async function logIn(event) {
  event?.preventDefault();
  if (!logInBox) return;

  const email = logInBox.querySelector('.username')?.value.trim().toLowerCase() || '';
  const password = logInBox.querySelector('.password')?.value.trim() || '';

  try {
    const { token, user } = await loginUserWithApi({ email, password });

    if (user.role === 'user') {
      showAlertModal('Warning!', 'This login is for administrators only..', 'person-add-outline');
    }else{
      

      // This stores the API session, not the old mock users database.
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = '../Main_page/admin_page/admin.html';

      updateLoginLabel(user);
      updatedashBoardLabel(user);
      toggleMenuLink(user);
      renderInfo(user);
      // redirectBasedOnRole(user);
    }
  } catch (error) {
    if (error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('exist')) {
      showAlertModal('Account Not Found', 'This account does not exist. Please check your credentials or register an account.', 'person-add-outline');
    } else {
      showAlertModal('Login Failed', error.message || 'Invalid email or password combination.', 'lock-open-outline');
    }

  }
}

 document.getElementById('login-form')?.addEventListener('submit', logIn);
