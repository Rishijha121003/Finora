import { authManager } from '../auth.js';

export function renderAuthView(container, isRegister = false) {
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
          <div id="login-error" style="display:none; padding:0.75rem; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.3); color:#ef4444; border-radius:8px; margin-bottom:1rem; font-size:0.88rem; text-align:center;"></div>
          <form id="login-form">
            <div class="form-group">
              <label for="login-email-input">Email Address</label>
              <input type="email" id="login-email-input" autocomplete="username" class="form-control" placeholder="name@example.com" required />
            </div>
            <div class="form-group">
              <label for="login-password-input">Password</label>
              <input type="password" id="login-password-input" autocomplete="current-password" class="form-control" placeholder="••••••••" required />
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
          <div id="register-error" style="display:none; padding:0.75rem; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.3); color:#ef4444; border-radius:8px; margin-bottom:1rem; font-size:0.88rem; text-align:center;"></div>
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
              <input type="password" id="register-password-input" autocomplete="new-password" class="form-control" placeholder="••••••••" required />
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

  document.getElementById('link-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#register');
    document.getElementById('auth-split-container').classList.add('is-register');
  });

  document.getElementById('link-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState(null, '', '#login');
    document.getElementById('auth-split-container').classList.remove('is-register');
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
