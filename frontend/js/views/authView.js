import { authManager } from '../auth.js';

export function renderAuthView(container, isRegister = false) {
  const formId = isRegister ? 'register-form' : 'login-form';
  const errorId = isRegister ? 'register-error' : 'login-error';
  const emailInputId = isRegister ? 'register-email-input' : 'login-email-input';
  const passwordInputId = isRegister ? 'register-password-input' : 'login-password-input';

  container.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-header">
        <div style="display:flex; justify-content:center; align-items:center; gap:0.6rem; margin-bottom:1rem;">
          <img src="assets/logo.png?v=1.2.1" class="brand-logo-img" alt="Finora Logo" style="width:40px; height:40px;" />
          <h1 style="font-size:1.6rem; font-weight:800;">Finora</h1>
        </div>
        <h2>${isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p>${isRegister ? 'Start tracking your money effortlessly' : 'Sign in to access your money dashboard'}</p>
      </div>

      <div id="${errorId}" style="display:none; padding:0.75rem; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.3); color:#ef4444; border-radius:8px; margin-bottom:1rem; font-size:0.88rem; text-align:center;"></div>

      <form id="${formId}" autocomplete="${isRegister ? 'off' : 'on'}">
        ${isRegister ? `
          <div class="form-group">
            <label for="register-name-input">Full Name</label>
            <input type="text" id="register-name-input" name="name" autocomplete="name" class="form-control" placeholder="Rishi Kumar" required />
          </div>
        ` : ''}

        <div class="form-group">
          <label for="${emailInputId}">Email Address</label>
          <input type="email" id="${emailInputId}" name="email" autocomplete="${isRegister ? 'off' : 'username'}" class="form-control" placeholder="name@example.com" required />
        </div>

        <div class="form-group">
          <label for="${passwordInputId}">Password</label>
          <input type="password" id="${passwordInputId}" name="password" autocomplete="${isRegister ? 'new-password' : 'current-password'}" class="form-control" placeholder="••••••••" required />
        </div>

        ${isRegister ? `
          <div class="form-group">
            <label for="register-currency-input">Primary Currency Preference</label>
            <select id="register-currency-input" name="currency_code" class="form-control">
              <option value="INR" selected>INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>
        ` : ''}

        <button type="submit" id="${isRegister ? 'btn-register-submit' : 'btn-login-submit'}" class="btn btn-primary btn-block" style="margin-top:0.5rem;">
          ${isRegister ? 'Create Finora Account' : 'Sign In'}
        </button>
      </form>

      <div style="text-align:center; margin-top:1.5rem; font-size:0.9rem; color:var(--text-muted);">
        ${isRegister ? 
          `Already have an account? <a href="#login" id="link-to-login" style="color:var(--primary); font-weight:600; text-decoration:none;">Sign In</a>` : 
          `Don't have an account yet? <a href="#register" id="link-to-register" style="color:var(--primary); font-weight:600; text-decoration:none;">Register Now</a>`
        }
      </div>
    </div>
  `;

  const form = document.getElementById(formId);
  const errorDiv = document.getElementById(errorId);

  if (form) {
    form.reset();
  }
  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorDiv) {
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
    }

    const email = document.getElementById(emailInputId).value.trim();
    const password = document.getElementById(passwordInputId).value;
    const submitBtn = document.getElementById(isRegister ? 'btn-register-submit' : 'btn-login-submit');

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isRegister ? 'Creating Account...' : 'Signing In...';
      }

      if (isRegister) {
        const name = document.getElementById('register-name-input').value.trim();
        const currency = document.getElementById('register-currency-input').value;
        await authManager.register(name, email, password, currency);
      } else {
        await authManager.login(email, password);
      }
      window.location.hash = '#dashboard';
    } catch (err) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = isRegister ? 'Create Finora Account' : 'Sign In';
      }
      if (errorDiv) {
        errorDiv.textContent = err.message || 'Authentication failed. Please try again.';
        errorDiv.style.display = 'block';
      }
    }
  });
}
