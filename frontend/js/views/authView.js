import { authManager } from '../auth.js';

function updatePanelAccessibility(splitEl, isRegister) {
  const loginPanel = splitEl.querySelector('.login-panel');
  const registerPanel = splitEl.querySelector('.register-panel');
  if (loginPanel && registerPanel) {
    if (isRegister) {
      loginPanel.setAttribute('aria-hidden', 'true');
      loginPanel.setAttribute('inert', '');
      registerPanel.setAttribute('aria-hidden', 'false');
      registerPanel.removeAttribute('inert');
    } else {
      loginPanel.setAttribute('aria-hidden', 'false');
      loginPanel.removeAttribute('inert');
      registerPanel.setAttribute('aria-hidden', 'true');
      registerPanel.setAttribute('inert', '');
    }
  }
}

export function renderAuthView(container, isRegister = false) {
  const existingSplit = container.querySelector('#auth-split-container');
  if (existingSplit) {
    if (isRegister) {
      existingSplit.classList.add('is-register');
    } else {
      existingSplit.classList.remove('is-register');
    }
    updatePanelAccessibility(existingSplit, isRegister);
    return;
  }

  container.innerHTML = `
    <div class="auth-split-container ${isRegister ? 'is-register' : ''}" id="auth-split-container">
      
      <!-- Visual Branding Panel -->
      <div class="auth-visual-panel">
        <div class="visual-panel-content">
          <img src="assets/logo.png?v=1.3.0" alt="Finora Logo" style="width:64px; height:64px; margin-bottom:1.5rem;" />
          <h2>Take control of your money.</h2>
          <p>Track spending. Stay on budget. Spend smarter with Finora.</p>
        </div>
      </div>

      <!-- Forms Area -->
      <div class="auth-form-area">
        
        <!-- Login Panel -->
        <div class="auth-form-panel login-panel">
          <div class="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to access your money dashboard</p>
          </div>
          <div id="login-error" style="display:none; padding:0.75rem; background:rgba(244, 63, 94, 0.15); border:1px solid rgba(244, 63, 94, 0.3); color:#F43F5E; border-radius:8px; margin-bottom:1rem; font-size:0.88rem; text-align:center;"></div>
          <form id="login-form">
            <div class="form-group">
              <label for="login-email-input">Email Address</label>
              <input type="email" id="login-email-input" autocomplete="username" class="form-control" placeholder="name@example.com" required />
            </div>
            <div class="form-group">
              <label for="login-password-input">Password</label>
              <div class="password-input-wrapper">
                <input type="password" id="login-password-input" autocomplete="current-password" class="form-control" placeholder="••••••••" required />
                <button type="button" class="password-toggle-btn" aria-label="Toggle password visibility" data-target="login-password-input">
                  <svg class="eye-icon eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg class="eye-icon eye-hide" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" id="btn-login-submit" class="btn btn-primary btn-block" style="margin-top:0.5rem;">Sign In</button>
          </form>
          <div style="text-align:center; margin-top:1.5rem; font-size:0.9rem; color:var(--text-muted);">
            Don't have an account yet? <a href="#register" id="link-to-register" style="color:var(--primary); font-weight:600; text-decoration:none;">Register Now</a>
          </div>
        </div>

        <!-- Register Panel -->
        <div class="auth-form-panel register-panel">
          <div class="auth-header">
            <h2>Create Account</h2>
            <p>Start tracking your money effortlessly</p>
          </div>
          <div id="register-error" style="display:none; padding:0.75rem; background:rgba(244, 63, 94, 0.15); border:1px solid rgba(244, 63, 94, 0.3); color:#F43F5E; border-radius:8px; margin-bottom:1rem; font-size:0.88rem; text-align:center;"></div>
          <form id="register-form" autocomplete="off">
            <div class="form-group">
              <label for="register-name-input">Full Name</label>
              <input type="text" id="register-name-input" autocomplete="name" class="form-control" placeholder="Rishi Kumar" required />
            </div>
            <div class="form-group">
              <label for="register-email-input">Email Address</label>
              <input type="email" id="register-email-input" autocomplete="off" class="form-control" placeholder="name@example.com" required />
            </div>
            <div class="form-group">
              <label for="register-password-input">Password</label>
              <div class="password-input-wrapper">
                <input type="password" id="register-password-input" autocomplete="new-password" class="form-control" placeholder="••••••••" required />
                <button type="button" class="password-toggle-btn" aria-label="Toggle password visibility" data-target="register-password-input">
                  <svg class="eye-icon eye-show" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg class="eye-icon eye-hide" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label for="register-currency-input">Primary Currency Preference</label>
              <select id="register-currency-input" class="form-control">
                <option value="INR" selected>INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
            <button type="submit" id="btn-register-submit" class="btn btn-primary btn-block" style="margin-top:0.5rem;">Create Finora Account</button>
          </form>
          <div style="text-align:center; margin-top:1.5rem; font-size:0.9rem; color:var(--text-muted);">
            Already have an account? <a href="#login" id="link-to-login" style="color:var(--primary); font-weight:600; text-decoration:none;">Sign In</a>
          </div>
        </div>

      </div>
    </div>
  `;

  const splitEl = container.querySelector('#auth-split-container');
  updatePanelAccessibility(splitEl, isRegister);

  // Attach Password Visibility Toggle Handlers
  container.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const eyeShow = btn.querySelector('.eye-show');
      const eyeHide = btn.querySelector('.eye-hide');
      if (input) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        if (eyeShow && eyeHide) {
          eyeShow.style.display = isPassword ? 'none' : 'block';
          eyeHide.style.display = isPassword ? 'block' : 'none';
        }
      }
    });
  });

  document.getElementById('link-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#register');
    const container = document.getElementById('auth-split-container');
    if (container) {
      container.classList.add('is-register');
      updatePanelAccessibility(container, true);
    }
  });

  document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#login');
    const container = document.getElementById('auth-split-container');
    if (container) {
      container.classList.remove('is-register');
      updatePanelAccessibility(container, false);
    }
  });

  const navigateToDashboard = () => {
    if (document.startViewTransition) {
      document.documentElement.classList.add('auth-success-transition');
      const transition = document.startViewTransition(() => {
        window.location.hash = '#dashboard';
      });
      transition.finished.finally(() => {
        document.documentElement.classList.remove('auth-success-transition');
      });
    } else {
      const container = document.getElementById('auth-split-container');
      if (container) {
        container.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.opacity = '0';
        container.style.transform = 'scale(0.96)';
        container.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
            window.location.hash = '#dashboard';
          }
        }, { once: true });
      } else {
        window.location.hash = '#dashboard';
      }
    }
  };

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('login-error');
    errorDiv.style.display = 'none';
    
    const email = document.getElementById('login-email-input').value.trim();
    const password = document.getElementById('login-password-input').value;
    const btn = document.getElementById('btn-login-submit');
    
    try {
      btn.disabled = true;
      btn.textContent = 'Signing In...';
      await authManager.login(email, password);
      navigateToDashboard();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Sign In';
      errorDiv.textContent = err.message || 'Authentication failed. Please try again.';
      errorDiv.style.display = 'block';
    }
  });

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('register-error');
    errorDiv.style.display = 'none';
    
    const name = document.getElementById('register-name-input').value.trim();
    const email = document.getElementById('register-email-input').value.trim();
    const password = document.getElementById('register-password-input').value;
    const currency = document.getElementById('register-currency-input').value;
    const btn = document.getElementById('btn-register-submit');
    
    try {
      btn.disabled = true;
      btn.textContent = 'Creating Account...';
      await authManager.register(name, email, password, currency);
      navigateToDashboard();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Create Finora Account';
      errorDiv.textContent = err.message || 'Registration failed.';
      errorDiv.style.display = 'block';
    }
  });
}

