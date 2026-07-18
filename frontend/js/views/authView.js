import { authManager } from '../auth.js';

export function renderAuthView(container, isRegister = false) {
  container.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-header">
        <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-bottom:1rem;">
          <div class="brand-icon">₹</div>
          <h1 style="font-size:1.6rem; font-weight:800;">Finora</h1>
        </div>
        <h2>${isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p>${isRegister ? 'Start tracking your money effortlessly' : 'Sign in to access your money dashboard'}</p>
      </div>

      <div id="auth-error" style="display:none; padding:0.75rem; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.3); color:#ef4444; border-radius:8px; margin-bottom:1rem; font-size:0.88rem; text-align:center;"></div>

      <form id="auth-form">
        ${isRegister ? `
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="name-input" class="form-control" placeholder="Rishi Kumar" required />
          </div>
        ` : ''}

        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="email-input" class="form-control" placeholder="name@example.com" required />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" id="password-input" class="form-control" placeholder="••••••••" required />
        </div>

        ${isRegister ? `
          <div class="form-group">
            <label>Primary Currency Preference</label>
            <select id="currency-input" class="form-control">
              <option value="INR" selected>INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>
        ` : ''}

        <button type="submit" class="btn btn-primary btn-block" style="margin-top:0.5rem;">
          ${isRegister ? 'Create Finora Account' : 'Sign In'}
        </button>
      </form>

      <div style="text-align:center; margin-top:1.5rem; font-size:0.9rem; color:var(--text-muted);">
        ${isRegister ? 
          `Already have an account? <a href="#login" style="color:var(--primary); font-weight:600; text-decoration:none;">Sign In</a>` : 
          `Don't have an account yet? <a href="#register" style="color:var(--primary); font-weight:600; text-decoration:none;">Register Now</a>`
        }
      </div>
    </div>
  `;

  const form = document.getElementById('auth-form');
  const errorDiv = document.getElementById('auth-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';

    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    try {
      if (isRegister) {
        const name = document.getElementById('name-input').value;
        const currency = document.getElementById('currency-input').value;
        await authManager.register(name, email, password, currency);
      } else {
        await authManager.login(email, password);
      }
      window.location.hash = '#dashboard';
    } catch (err) {
      errorDiv.textContent = err.message || 'Authentication failed. Please try again.';
      errorDiv.style.display = 'block';
    }
  });
}
