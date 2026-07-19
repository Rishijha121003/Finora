import { authManager } from './auth.js';
import { renderAuthView } from './views/authView.js';
import { renderDashboardView } from './views/dashboardView.js?v=1.2.0';
import { renderTransactionsView } from './views/transactionsView.js?v=1.2.0';
import { renderCategoriesView } from './views/categoriesView.js?v=1.2.0';
import { renderProfileView } from './views/profileView.js?v=1.2.0';
import { renderLandingView } from './views/landingView.js';
import APIClient from './api.js';

class App {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.selectedRating = 5;
  }

  async init() {
    // Disable automatic browser scroll restoration on page reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Check authentication
    await authManager.init();

    // Listen for hash routing
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('auth:unauthorized', () => {
      authManager.logout();
    });

    // Close mobile menu dropdown on outside click
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('mobile-menu-dropdown');
      const toggleBtn = document.getElementById('mobile-menu-toggle');
      if (dropdown && dropdown.classList.contains('active')) {
        if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      }
    });

    // Handle initial route
    this.handleRoute();
  }

  renderNavbar() {
    const user = authManager.currentUser;
    if (!user) return '';

    const currentHash = window.location.hash || '#dashboard';
    const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    return `
      <!-- Top Navbar (Desktop & Mobile Brand / Toggle) -->
      <nav class="navbar">
        <a href="#dashboard" class="brand">
          <img src="assets/logo.png?v=1.2.0" class="brand-logo-img" alt="Finora Logo" />
          <span>Finora</span>
        </a>

        <!-- Desktop Navigation Links (>= 768px) -->
        <div class="nav-links">
          <a href="#dashboard" class="nav-item ${currentHash.startsWith('#dashboard') ? 'active' : ''}">Dashboard</a>
          <a href="#transactions" class="nav-item ${currentHash.startsWith('#transactions') ? 'active' : ''}">Transactions</a>
          <a href="#categories" class="nav-item ${currentHash.startsWith('#categories') ? 'active' : ''}">Categories</a>
          <a href="#profile" class="nav-item ${currentHash.startsWith('#profile') ? 'active' : ''}">Profile</a>
        </div>

        <!-- Desktop User Actions (>= 768px) -->
        <div class="nav-actions">
          <div class="user-badge">
            <span style="font-weight:600;">${this.escapeHTML(user.name)}</span>
            <select id="header-currency-select" class="currency-select">
              <option value="INR" ${user.currency_code === 'INR' ? 'selected' : ''}>₹ INR</option>
              <option value="USD" ${user.currency_code === 'USD' ? 'selected' : ''}>$ USD</option>
              <option value="EUR" ${user.currency_code === 'EUR' ? 'selected' : ''}>€ EUR</option>
              <option value="GBP" ${user.currency_code === 'GBP' ? 'selected' : ''}>£ GBP</option>
            </select>
          </div>
          <button class="btn btn-secondary" id="btn-feedback" style="padding:0.4rem 0.8rem; font-size:0.85rem; margin-right:0.4rem;">
            Feedback
          </button>
          <button class="btn btn-secondary" id="btn-logout" style="padding:0.4rem 0.8rem; font-size:0.85rem;">
            Logout
          </button>
        </div>

        <!-- Mobile Profile Menu Toggle Button (< 768px) -->
        <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="User Profile Menu">
          ${userInitial}
        </button>

        <!-- Mobile Profile Menu Dropdown (< 768px) -->
        <div class="mobile-menu-dropdown" id="mobile-menu-dropdown">
          <div class="mobile-menu-user-info">
            <div class="user-avatar-lg">${userInitial}</div>
            <div style="overflow:hidden;">
              <div style="font-weight:700; font-size:0.95rem; color:var(--text-main); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">
                ${this.escapeHTML(user.name)}
              </div>
              <div style="font-size:0.78rem; color:var(--text-muted); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">
                ${this.escapeHTML(user.email)}
              </div>
            </div>
          </div>
          <div class="mobile-menu-divider"></div>
          <div>
            <label style="font-size:0.8rem; color:var(--text-muted); font-weight:600; display:block; margin-bottom:0.3rem;">Preferred Currency</label>
            <select id="mobile-currency-select" class="currency-select" style="width:100%;">
              <option value="INR" ${user.currency_code === 'INR' ? 'selected' : ''}>₹ INR</option>
              <option value="USD" ${user.currency_code === 'USD' ? 'selected' : ''}>$ USD</option>
              <option value="EUR" ${user.currency_code === 'EUR' ? 'selected' : ''}>€ EUR</option>
              <option value="GBP" ${user.currency_code === 'GBP' ? 'selected' : ''}>£ GBP</option>
            </select>
          </div>
          <div class="mobile-menu-divider"></div>
          <button class="btn btn-secondary btn-block" id="btn-mobile-feedback" style="padding:0.5rem; font-size:0.85rem; margin-bottom:0.5rem;">
            Send Feedback
          </button>
          <button class="btn btn-danger btn-block" id="btn-mobile-logout" style="padding:0.5rem; font-size:0.85rem;">
            Logout
          </button>
        </div>
      </nav>

      <!-- Fixed Mobile Bottom Navigation Bar (< 768px) -->
      <div class="bottom-nav">
        <a href="#dashboard" class="bottom-nav-item ${currentHash.startsWith('#dashboard') ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1"/>
            <rect x="14" y="3" width="7" height="5" rx="1"/>
            <rect x="14" y="12" width="7" height="9" rx="1"/>
            <rect x="3" y="16" width="7" height="5" rx="1"/>
          </svg>
          <span>Dashboard</span>
        </a>
        <a href="#transactions" class="bottom-nav-item ${currentHash.startsWith('#transactions') ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>Transactions</span>
        </a>
        <a href="#categories" class="bottom-nav-item ${currentHash.startsWith('#categories') ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <span>Categories</span>
        </a>
        <a href="#profile" class="bottom-nav-item ${currentHash.startsWith('#profile') ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Profile</span>
        </a>
      </div>

      <!-- Feedback Modal -->
      <div class="modal-overlay" id="feedback-modal">
        <div class="modal">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2rem;">
            <h3 style="font-size:1.25rem; font-weight:700; color:var(--text-main); margin:0;">Send Feedback</h3>
            <button type="button" class="btn" id="btn-close-feedback-modal" style="padding:0.2rem 0.5rem; font-size:1.3rem; border:none; background:transparent; color:var(--text-muted); cursor:pointer;">&times;</button>
          </div>
          <div id="feedback-alert" style="display:none; padding:0.75rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.88rem;"></div>
          <form id="feedback-form">
            <div style="margin-bottom:1rem;">
              <label class="form-label" style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;">Overall Rating (1 - 5)</label>
              <div class="rating-selector" id="feedback-rating-selector">
                <button type="button" class="rating-btn" data-val="1">★ 1</button>
                <button type="button" class="rating-btn" data-val="2">★ 2</button>
                <button type="button" class="rating-btn" data-val="3">★ 3</button>
                <button type="button" class="rating-btn" data-val="4">★ 4</button>
                <button type="button" class="rating-btn active" data-val="5">★ 5</button>
              </div>
            </div>
            <div style="margin-bottom:1rem;">
              <label class="form-label" style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;">Feedback Type</label>
              <select id="feedback-type" class="form-control" style="width:100%;" required>
                <option value="GENERAL">General Feedback</option>
                <option value="BUG">Bug Report</option>
                <option value="FEATURE_REQUEST">Feature Request</option>
              </select>
            </div>
            <div style="margin-bottom:1rem;">
              <label class="form-label" style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;">Message</label>
              <textarea id="feedback-msg" class="form-control" style="width:100%; resize:none;" rows="4" placeholder="Tell us what you think or what we can improve..." minlength="5" maxlength="2000" required></textarea>
            </div>
            <div style="margin-bottom:1.2rem;">
              <label class="form-label" style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;">Would you use Finora again?</label>
              <select id="feedback-again" class="form-control" style="width:100%;" required>
                <option value="YES">Yes, absolutely</option>
                <option value="MAYBE">Maybe</option>
                <option value="NO">No</option>
              </select>
            </div>
            <button type="submit" id="btn-submit-feedback-form" class="btn btn-primary btn-block" style="padding:0.65rem; font-weight:600;">Submit Feedback</button>
          </form>
        </div>
      </div>

      <!-- About Finora Modal -->
      <div class="modal-overlay" id="about-modal">
        <div class="modal" style="max-width:380px; text-align:center;">
          <div style="display:flex; justify-content:flex-end;">
            <button type="button" class="btn" id="btn-close-about-modal" style="padding:0.2rem 0.5rem; font-size:1.3rem; border:none; background:transparent; color:var(--text-muted); cursor:pointer;">&times;</button>
          </div>
          <div style="width:56px; height:56px; background:linear-gradient(135deg, var(--primary), #8b5cf6); border-radius:14px; display:inline-flex; align-items:center; justify-content:center; color:#fff; font-size:1.6rem; font-weight:800; margin-bottom:0.75rem; box-shadow:0 4px 16px rgba(99,102,241,0.4);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 style="font-size:1.35rem; font-weight:800; color:var(--text-main); margin-bottom:0.2rem;">Finora</h3>
          <p style="font-size:0.85rem; font-weight:600; color:var(--primary); margin-bottom:0.75rem;">Personal Finance Management Platform</p>
          <div style="display:inline-block; font-size:0.75rem; font-weight:700; color:var(--text-main); background:rgba(255,255,255,0.08); border:1px solid var(--glass-border); padding:0.25rem 0.75rem; border-radius:20px; margin-bottom:1rem;">
            Version v1.2.0
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; margin-bottom:1.2rem;">
            Track your income, expenses, and financial activity in one simple place.
          </p>
          <button type="button" class="btn btn-primary" id="btn-done-about-modal" style="width:100%; padding:0.6rem; font-weight:700; border-radius:10px;">Close</button>
        </div>
      </div>
    `;
  }

  async handleRoute() {
    let rawHash = window.location.hash;
    if (!rawHash || rawHash === '#') {
      rawHash = authManager.isAuthenticated() ? '#dashboard' : '#landing';
    }

    const [hash, queryString] = rawHash.split('?');
    const queryParams = {};
    if (queryString) {
      const urlParams = new URLSearchParams(queryString);
      for (const [key, value] of urlParams.entries()) {
        queryParams[key] = value;
      }
    }

    const isLandingSection = ['#landing', '#hero', '#features', '#about'].includes(hash);
    const isPublicRoute = isLandingSection || ['#login', '#register'].includes(hash);

    if (!authManager.isAuthenticated() && !isPublicRoute) {
      window.location.hash = '#landing';
      return;
    }

    if (authManager.isAuthenticated() && isPublicRoute) {
      window.location.hash = '#dashboard';
      return;
    }

    // Render App Navigation & Modal when authenticated and on an app route
    const showAppNavbar = authManager.isAuthenticated() && !isLandingSection;
    const navbarHTML = showAppNavbar ? this.renderNavbar() : '';

    this.appContainer.innerHTML = `
      ${navbarHTML}
      <main class="${isLandingSection ? '' : 'main-container'}" id="main-content"></main>
    `;

    const mainContent = document.getElementById('main-content');

    // Attach Event Handlers for Authenticated User Navigation & Feedback Modal
    if (authManager.isAuthenticated() && showAppNavbar) {
      // Desktop Logout & Mobile Logout
      document.getElementById('btn-logout')?.addEventListener('click', () => authManager.logout());
      document.getElementById('btn-mobile-logout')?.addEventListener('click', () => authManager.logout());

      // Toggle Mobile Profile Dropdown Menu
      const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
      const mobileDropdown = document.getElementById('mobile-menu-dropdown');
      if (mobileToggleBtn && mobileDropdown) {
        mobileToggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          mobileDropdown.classList.toggle('active');
        });
      }

      // Currency Select Change Handler (Desktop & Mobile)
      const handleCurrencyChange = async (newCurrency) => {
        try {
          await APIClient.updateProfile({ currency_code: newCurrency });
          authManager.currentUser.currency_code = newCurrency;
          this.handleRoute(); // Refresh view with new currency symbol
        } catch (err) {
          alert('Failed to update currency preference.');
        }
      };

      document.getElementById('header-currency-select')?.addEventListener('change', (e) => handleCurrencyChange(e.target.value));
      document.getElementById('mobile-currency-select')?.addEventListener('change', (e) => handleCurrencyChange(e.target.value));

      // Feedback Modal Controls
      const feedbackModal = document.getElementById('feedback-modal');
      const openFeedbackModal = () => {
        if (mobileDropdown) mobileDropdown.classList.remove('active');
        if (feedbackModal) feedbackModal.classList.add('active');
      };
      const closeFeedbackModal = () => {
        if (feedbackModal) feedbackModal.classList.remove('active');
        const alertBox = document.getElementById('feedback-alert');
        if (alertBox) alertBox.style.display = 'none';
      };

      document.getElementById('btn-feedback')?.addEventListener('click', openFeedbackModal);
      document.getElementById('btn-mobile-feedback')?.addEventListener('click', openFeedbackModal);
      document.getElementById('btn-close-feedback-modal')?.addEventListener('click', closeFeedbackModal);

      // Close modal on backdrop click
      feedbackModal?.addEventListener('click', (e) => {
        if (e.target === feedbackModal) closeFeedbackModal();
      });

      // About Modal Controls
      const aboutModal = document.getElementById('about-modal');
      const closeAboutModal = () => aboutModal?.classList.remove('active');
      document.getElementById('btn-close-about-modal')?.addEventListener('click', closeAboutModal);
      document.getElementById('btn-done-about-modal')?.addEventListener('click', closeAboutModal);
      aboutModal?.addEventListener('click', (e) => {
        if (e.target === aboutModal) closeAboutModal();
      });

      // Rating selector behavior
      const ratingBtns = document.querySelectorAll('#feedback-rating-selector .rating-btn');
      ratingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          ratingBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedRating = parseInt(btn.getAttribute('data-val'), 10);
        });
      });

      // Feedback Form Submission
      const feedbackForm = document.getElementById('feedback-form');
      feedbackForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('feedback-alert');
        const submitBtn = document.getElementById('btn-submit-feedback-form');

        const rating = this.selectedRating || 5;
        const feedback_type = document.getElementById('feedback-type').value;
        const message = document.getElementById('feedback-msg').value.trim();
        const would_use_again = document.getElementById('feedback-again').value;

        if (message.length < 5) {
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
          alertBox.style.color = '#ef4444';
          alertBox.style.border = '1px solid #ef4444';
          alertBox.textContent = 'Feedback message must be at least 5 characters long.';
          return;
        }

        try {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
          alertBox.style.display = 'none';

          await APIClient.submitFeedback({
            rating,
            feedback_type,
            message,
            would_use_again
          });

          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(16, 185, 129, 0.15)';
          alertBox.style.color = '#10b981';
          alertBox.style.border = '1px solid #10b981';
          alertBox.textContent = 'Thank you! Your feedback has been submitted successfully.';

          feedbackForm.reset();
          this.selectedRating = 5;
          ratingBtns.forEach(b => b.classList.remove('active'));
          document.querySelector('#feedback-rating-selector .rating-btn[data-val="5"]')?.classList.add('active');

          setTimeout(() => {
            closeFeedbackModal();
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Feedback';
          }, 1800);

        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Feedback';
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
          alertBox.style.color = '#ef4444';
          alertBox.style.border = '1px solid #ef4444';
          alertBox.textContent = err.message || 'Failed to submit feedback. Please try again.';
        }
      });
    }

    // Route Switcher
    switch (hash) {
      case '#landing':
      case '#hero':
      case '#features':
      case '#about':
        renderLandingView(mainContent, hash.replace('#', ''));
        break;
      case '#register':
        renderAuthView(mainContent, true);
        break;
      case '#login':
        renderAuthView(mainContent, false);
        break;
      case '#transactions':
        await renderTransactionsView(mainContent, queryParams);
        break;
      case '#categories':
        await renderCategoriesView(mainContent);
        break;
      case '#profile':
        await renderProfileView(mainContent);
        break;
      case '#dashboard':
        await renderDashboardView(mainContent);
        break;
      default:
        if (authManager.isAuthenticated()) {
          await renderDashboardView(mainContent);
        } else {
          renderLandingView(mainContent, 'landing');
        }
        break;
    }
  }

  escapeHTML(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
