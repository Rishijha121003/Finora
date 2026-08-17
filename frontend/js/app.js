import { authManager } from './auth.js';
import { renderAuthView } from './views/authView.js';
import { renderDashboardView } from './views/dashboardView.js?v=2.0.0';
import { renderTransactionsView } from './views/transactionsView.js?v=2.0.0';
import { renderCategoriesView } from './views/categoriesView.js?v=2.0.0';
import { renderProfileView } from './views/profileView.js?v=2.0.0';
import { renderLandingView } from './views/landingView.js';
import { renderLegalView } from './views/legalView.js?v=2.0.0';
import { renderPulseView } from './views/pulseView.js?v=2.0.0';
import APIClient from './api.js';
import { renderAccountsView } from './views/accountsView.js?v=2.0.0';
import { renderBudgetsView } from './views/budgetsView.js?v=2.0.0';
import { renderInsightsView } from './views/insightsView.js?v=2.0.0';
import { renderGoalsView } from './views/goalsView.js?v=2.0.0';
import { renderReportsView } from './views/reportsView.js?v=2.0.0';
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

    // Initialize PWA Offline Banner Handler
    this.initOfflineHandler();

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
      <!-- Desktop Sidebar Navigation (>= 1024px) -->
      <aside class="sidebar-v2" id="desktop-sidebar">
        <!-- Sidebar Brand -->
        <a href="#dashboard" class="sidebar-v2-brand">
          <div class="sidebar-v2-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="sidebar-v2-brand-text">Finora</span>
        </a>

        <!-- Sidebar Navigation Items -->
        <nav class="sidebar-v2-nav">
          <a href="#dashboard" class="sidebar-v2-link ${currentHash.startsWith('#dashboard') ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            <span>Dashboard</span>
          </a>

          <a href="#insights" class="sidebar-v2-link ${currentHash.startsWith('#insights') ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span>Insights</span>
          </a>

          <a href="#transactions" class="sidebar-v2-link ${currentHash.startsWith('#transactions') ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Transactions</span>
          </a>

          <a href="#accounts" class="sidebar-v2-link ${currentHash.startsWith('#accounts') ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span>Accounts</span>
          </a>

          <a href="#budgets" class="sidebar-v2-link ${currentHash.startsWith('#budgets') ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>Budgets</span>
          </a>

          <a href="#categories" class="sidebar-v2-link ${currentHash.startsWith('#categories') ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            <span>Categories</span>
          </a>

          <a href="#pulse" class="sidebar-v2-link pulse-highlight ${currentHash === '#pulse' ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span style="color:#10B981; font-weight:700;">Finora Pulse</span>
            <span class="sidebar-v2-beta-badge">BETA</span>
          </a>

          <a href="#goals" class="sidebar-v2-link ${currentHash.startsWith('#goals') ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <span>Goals</span>
          </a>

          <a href="#reports" class="sidebar-v2-link ${currentHash.startsWith('#reports') ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span>Reports</span>
          </a>

          <a href="#profile" class="sidebar-v2-link ${currentHash.startsWith('#profile') || currentHash.startsWith('#settings') ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Settings</span>
          </a>

          <a href="#profile" class="sidebar-v2-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Settings</span>
          </a>
        </nav>

        <!-- Sidebar Bottom Promo Box -->
        <div class="sidebar-v2-promo-box">
          <div class="sidebar-v2-promo-title">👑 Finora Premium</div>
          <p class="sidebar-v2-promo-sub">Unlock advanced insights and premium features.</p>
          <button class="btn btn-emerald btn-block" style="padding:0.45rem; font-size:0.78rem; font-weight:700; border-radius:10px;">Upgrade Now</button>
        </div>

        <!-- Sidebar Bottom Theme & User Control -->
        <div class="sidebar-v2-footer">
          <div class="sidebar-v2-darkmode-row">
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <span>Dark Mode</span>
            </div>
            <label class="toggle-switch-v2">
              <input type="checkbox" checked disabled />
              <span class="toggle-slider-v2"></span>
            </label>
          </div>
        </div>
      </aside>

      <!-- Mobile Top Navbar (< 1024px) -->
      <nav class="navbar mobile-navbar">
        <a href="#dashboard" class="brand">
          <img src="assets/logo.png?v=1.3.0" class="brand-logo-img" alt="Finora Logo" />
          <span>Finora</span>
        </a>

        <div class="nav-actions">
          <button class="btn btn-secondary" id="btn-feedback" style="padding:0.35rem 0.65rem; font-size:0.8rem; margin-right:0.3rem;">
            Feedback
          </button>
          <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="User Profile Menu">
            ${userInitial}
          </button>
        </div>

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
          <button class="btn btn-danger btn-block" id="btn-mobile-logout" style="padding:0.5rem; font-size:0.85rem;">
            Logout
          </button>
        </div>
      </nav>

      <!-- Fixed Mobile Bottom Navigation Bar (< 1024px) -->
      <div class="bottom-nav">
        <a href="#dashboard" class="bottom-nav-item ${currentHash.startsWith('#dashboard') ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
          </svg>
          <span>Dashboard</span>
        </a>

        <a href="#transactions" class="bottom-nav-item ${currentHash.startsWith('#transactions') ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>Transactions</span>
        </a>

        <a href="#pulse" class="bottom-nav-item ${currentHash === '#pulse' ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>Pulse</span>
        </a>

        <a href="#accounts" class="bottom-nav-item ${currentHash.startsWith('#accounts') ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <span>Accounts</span>
        </a>

        <a href="#profile" class="bottom-nav-item ${currentHash.startsWith('#profile') ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
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
          <div style="width:56px; height:56px; background:linear-gradient(135deg, var(--primary), #059669); border-radius:14px; display:inline-flex; align-items:center; justify-content:center; color:#fff; font-size:1.6rem; font-weight:800; margin-bottom:0.75rem; box-shadow:0 4px 16px rgba(16,185,129,0.4);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 style="font-size:1.35rem; font-weight:800; color:var(--text-main); margin-bottom:0.2rem;">Finora</h3>
          <p style="font-size:0.85rem; font-weight:600; color:var(--primary); margin-bottom:0.75rem;">Personal Finance Management Platform</p>
          <div style="display:inline-block; font-size:0.75rem; font-weight:700; color:var(--text-main); background:rgba(255,255,255,0.08); border:1px solid var(--glass-border); padding:0.25rem 0.75rem; border-radius:20px; margin-bottom:1rem;">
            Version v1.4.0
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
    const isLegalSection = ['#privacy', '#terms'].includes(hash);
    const isPublicRoute = isLandingSection || isLegalSection || ['#login', '#register'].includes(hash);

    if (!authManager.isAuthenticated() && !isPublicRoute) {
      window.location.hash = '#landing';
      return;
    }

    if (authManager.isAuthenticated() && isPublicRoute && !isLegalSection) {
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
        const previousCurrency = authManager.getUserCurrency();
        const headerSelect = document.getElementById('header-currency-select');
        const mobileSelect = document.getElementById('mobile-currency-select');

        // Keep UI dropdowns synchronized immediately
        if (headerSelect) headerSelect.value = newCurrency;
        if (mobileSelect) mobileSelect.value = newCurrency;

        try {
          await APIClient.updateProfile({ currency_code: newCurrency });
          authManager.currentUser.currency_code = newCurrency;
          if (window.showToast) window.showToast(`Currency changed to ${newCurrency}`, 'success');
          this.handleRoute(); // Refresh view with new currency symbol
        } catch (err) {
          // Revert both dropdowns to previous persisted currency on failure
          if (headerSelect) headerSelect.value = previousCurrency;
          if (mobileSelect) mobileSelect.value = previousCurrency;
          if (window.showToast) window.showToast('Failed to update currency preference, reverting...', 'error');
          else alert('Failed to update currency preference.');
        }
      };

      document.getElementById('header-currency-select')?.addEventListener('change', (e) => handleCurrencyChange(e.target.value));
      document.getElementById('mobile-currency-select')?.addEventListener('change', (e) => handleCurrencyChange(e.target.value));

      // Feedback Modal Controls
      const feedbackModal = document.getElementById('feedback-modal');
      const openFeedbackModal = () => {
        if (mobileDropdown) mobileDropdown.classList.remove('active');
        if (feedbackModal) {
          const dialog = feedbackModal.querySelector('.modal-dialog') || feedbackModal.querySelector('.modal');
          if (dialog) {
            if (window.innerWidth <= 640) dialog.classList.add('modal-dialog-bottom-sheet');
            else dialog.classList.remove('modal-dialog-bottom-sheet');
          }
          feedbackModal.classList.add('active');
        }
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
          alertBox.style.background = 'rgba(244, 63, 94, 0.15)';
          alertBox.style.color = '#F43F5E';
          alertBox.style.border = '1px solid #F43F5E';
          alertBox.textContent = 'Feedback message must be at least 5 characters long.';
          if (window.showToast) window.showToast('Feedback message must be at least 5 characters.', 'warning');
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

          if (window.showToast) window.showToast('Thank you! Your feedback has been submitted.', 'success');
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
          }, 1500);
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Feedback';
          alertBox.style.display = 'block';
          alertBox.style.background = 'rgba(244, 63, 94, 0.15)';
          alertBox.style.color = '#F43F5E';
          alertBox.style.border = '1px solid #F43F5E';
          alertBox.textContent = err.message || 'Failed to submit feedback. Please try again.';
          if (window.showToast) window.showToast(err.message || 'Failed to submit feedback.', 'error');
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
      case '#privacy':
      case '#terms':
        mainContent.innerHTML = renderLegalView(hash);
        break;

      case '#transactions':
        await renderTransactionsView(mainContent, queryParams);
        break;
      case '#categories':
        await renderCategoriesView(mainContent);
        break;
      case '#profile':
      case '#settings':
        await renderProfileView(mainContent);
        break;
      case '#dashboard':
        await renderDashboardView(mainContent);
        break;
      case '#pulse':
        await renderPulseView(mainContent);
        break;
      case '#accounts':
        await renderAccountsView(mainContent);
        break;  
      case '#budgets':
        await renderBudgetsView(mainContent);
        break;
      case '#insights':
        await renderInsightsView(mainContent);
        break;
      case '#goals':
        await renderGoalsView(mainContent);
        break;
      case '#reports':
        await renderReportsView(mainContent);
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

  initOfflineHandler() {
    let banner = document.getElementById('pwa-offline-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'pwa-offline-banner';
      banner.className = 'pwa-offline-banner';
      banner.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
        <span>You are currently offline. Connect to the internet to update financial data.</span>
      `;
      document.body.appendChild(banner);
    }

    const updateStatus = () => {
      if (!navigator.onLine) {
        banner.classList.add('active');
      } else {
        banner.classList.remove('active');
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  }

  static showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconMap = {
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--income)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--expense)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };

    toast.innerHTML = `${iconMap[type] || iconMap.success}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(1rem)';
      toast.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  escapeHTML(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

window.showToast = App.showToast;

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();

  // Register Service Worker for PWA Capability
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[Finora PWA] Service Worker registered successfully scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Finora PWA] Service Worker registration failed:', err);
        });
    });
  }

  // Handle PWA Install Prompt
  window.deferredPWAInstallPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPWAInstallPrompt = e;
    window.dispatchEvent(new Event('pwa:installable'));
  });
});
