import { authManager } from './auth.js';
import { renderAuthView } from './views/authView.js';
import { renderDashboardView } from './views/dashboardView.js';
import { renderTransactionsView } from './views/transactionsView.js';
import { renderCategoriesView } from './views/categoriesView.js';
import { renderProfileView } from './views/profileView.js';
import APIClient from './api.js';

class App {
  constructor() {
    this.appContainer = document.getElementById('app');
  }

  async init() {
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
          <div class="brand-icon">₹</div>
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
      </div>
    `;
  }

  async handleRoute() {
    const rawHash = window.location.hash || (authManager.isAuthenticated() ? '#dashboard' : '#login');
    const [hash, queryString] = rawHash.split('?');
    const queryParams = {};
    if (queryString) {
      const urlParams = new URLSearchParams(queryString);
      for (const [key, value] of urlParams.entries()) {
        queryParams[key] = value;
      }
    }

    const isPublicRoute = ['#login', '#register'].includes(hash);

    if (!authManager.isAuthenticated() && !isPublicRoute) {
      window.location.hash = '#login';
      return;
    }

    if (authManager.isAuthenticated() && isPublicRoute) {
      window.location.hash = '#dashboard';
      return;
    }

    // Render Navigation
    const navbarHTML = authManager.isAuthenticated() ? this.renderNavbar() : '';

    this.appContainer.innerHTML = `
      ${navbarHTML}
      <main class="main-container" id="main-content"></main>
    `;

    const mainContent = document.getElementById('main-content');

    // Attach Event Handlers for Authenticated User Navigation
    if (authManager.isAuthenticated()) {
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
    }

    // Route Switcher
    switch (hash) {
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
      default:
        await renderDashboardView(mainContent);
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
