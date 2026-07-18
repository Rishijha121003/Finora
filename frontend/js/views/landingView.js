import { authManager } from '../auth.js';

export function renderLandingView(container, targetSection = 'landing') {
  const isLoggedIn = authManager.isAuthenticated();

  container.innerHTML = `
    <div class="landing-page">
      <!-- Public Header Navigation -->
      <header class="landing-header">
        <div class="landing-nav-container">
          <a href="${isLoggedIn ? '#dashboard' : '#hero'}" class="brand">
            <img src="assets/logo.png?v=1.1.0" class="brand-logo-img" alt="Finora Logo" />
            <span>Finora</span>
          </a>

          <nav class="landing-nav-links" id="landing-nav-menu">
            <a href="#hero" class="landing-nav-item">Home</a>
            <a href="#features" class="landing-nav-item">Features</a>
            <a href="#about" class="landing-nav-item">About</a>
          </nav>

          <div class="landing-nav-actions">
            ${isLoggedIn ? `
              <a href="#dashboard" class="btn btn-primary" style="padding: 0.45rem 1rem; font-size:0.88rem;">Go to Dashboard</a>
            ` : `
              <a href="#login" class="btn btn-secondary" style="padding: 0.45rem 0.9rem; font-size:0.88rem;">Login</a>
              <a href="#register" class="btn btn-primary" style="padding: 0.45rem 1rem; font-size:0.88rem;">Get Started</a>
            `}
          </div>

          <!-- Mobile Nav Hamburger Button -->
          <button class="landing-mobile-toggle" id="landing-mobile-toggle" aria-label="Open mobile navigation menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      <!-- Mobile Navigation Slide-in Drawer & Backdrop -->
      <div class="landing-drawer-overlay" id="landing-drawer-overlay"></div>

      <aside class="landing-drawer" id="landing-drawer" aria-hidden="true" role="dialog" aria-label="Mobile Navigation Menu">
        <div class="landing-drawer-header">
          <div class="brand">
            <img src="assets/logo.png?v=1.1.0" class="brand-logo-img" alt="Finora Logo" />
            <span>Finora</span>
          </div>
          <button class="landing-drawer-close" id="landing-drawer-close" aria-label="Close menu">&times;</button>
        </div>

        <nav class="landing-drawer-nav">
          <a href="#hero" class="landing-drawer-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Home</span>
          </a>
          <a href="#features" class="landing-drawer-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            <span>Features</span>
          </a>
          <a href="#about" class="landing-drawer-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>About</span>
          </a>
        </nav>

        <div class="landing-drawer-divider"></div>

        <div class="landing-drawer-actions">
          ${isLoggedIn ? `
            <a href="#dashboard" class="btn btn-primary btn-block btn-lg" style="justify-content:center;">Go to Dashboard</a>
          ` : `
            <a href="#login" class="btn btn-secondary btn-block" style="justify-content:center; margin-bottom:0.75rem; padding:0.7rem;">Login</a>
            <a href="#register" class="btn btn-primary btn-block btn-lg" style="justify-content:center;">Get Started</a>
          `}
        </div>
      </aside>

      <!-- Hero Section -->
      <section id="hero" class="landing-section hero-section">
        <div class="hero-content">
          <div class="hero-badge">Simple Finance Tracking. Clearer Decisions.</div>
          <h1 class="hero-title">Take Control of Your Money with <span class="highlight-text">Finora</span></h1>
          <p class="hero-subtitle">
            Track your income, manage expenses, and understand your financial health — all in one simple and secure place.
          </p>
          <div class="hero-cta-group">
            ${isLoggedIn ? `
              <a href="#dashboard" class="btn btn-primary btn-lg">Go to Your Dashboard →</a>
            ` : `
              <a href="#register" class="btn btn-primary btn-lg">Get Started Free</a>
              <a href="#login" class="btn btn-secondary btn-lg">Login</a>
            `}
          </div>
        </div>

        <!-- Hero Preview Mockup -->
        <div class="hero-preview-container">
          <div class="hero-preview-card">
            <div class="hero-preview-header">
              <div class="preview-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="preview-title">Finora Dashboard Overview</span>
            </div>
            <div class="hero-preview-body">
              <div class="preview-stats-grid">
                <div class="preview-stat income">
                  <div class="stat-label">Total Income</div>
                  <div class="stat-value">₹2,00,000.00</div>
                </div>
                <div class="preview-stat expense">
                  <div class="stat-label">Total Expenses</div>
                  <div class="stat-value">₹45,000.00</div>
                </div>
                <div class="preview-stat balance">
                  <div class="stat-label">Net Balance</div>
                  <div class="stat-value">₹1,55,000.00</div>
                </div>
              </div>
              <div class="preview-recent-tx">
                <div class="recent-tx-header">Recent Activity</div>
                <div class="recent-tx-row">
                  <div class="tx-info">
                    <span class="tx-icon green">↑</span>
                    <div>
                      <div class="tx-name">Salary & Payroll</div>
                      <div class="tx-date">Bank Transfer</div>
                    </div>
                  </div>
                  <div class="tx-amount green">+₹2,00,000.00</div>
                </div>
                <div class="recent-tx-row">
                  <div class="tx-info">
                    <span class="tx-icon red">↓</span>
                    <div>
                      <div class="tx-name">Housing & Rent</div>
                      <div class="tx-date">UPI Payment</div>
                    </div>
                  </div>
                  <div class="tx-amount red">-₹45,000.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="landing-section">
        <div class="section-header center">
          <h2 class="section-title">Designed for Complete Financial Clarity</h2>
          <p class="section-description">
            Everything you need to track cash flow, categorize spending, and monitor your overall net worth.
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3 class="feature-title">Income & Expense Tracking</h3>
            <p class="feature-desc">Record income and expenses with exact decimal precision, transaction dates, payment methods, and optional notes.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3 class="feature-title">Financial Dashboard</h3>
            <p class="feature-desc">Get an instant overview of total income, expenses, net balance, and breakdown across custom timeframes.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📜</div>
            <h3 class="feature-title">Transaction History</h3>
            <p class="feature-desc">Search notes, filter by payment method (UPI, Cash, Card, Transfer) or category, and paginate effortlessly.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🏷️</div>
            <h3 class="feature-title">Custom Categories</h3>
            <p class="feature-desc">Organize spending with system default categories or create custom categories tailored to your budget.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">💱</div>
            <h3 class="feature-title">Multi-Currency Support</h3>
            <p class="feature-desc">Select your preferred default currency (INR ₹, USD $, EUR €, GBP £) with seamless format rendering.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3 class="feature-title">Secure Authentication</h3>
            <p class="feature-desc">Stateless JWT authentication and industry-standard password hashing protect your personal account.</p>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="landing-section steps-section">
        <div class="section-header center">
          <h2 class="section-title">How Finora Works</h2>
          <p class="section-description">Start tracking your money in three simple steps.</p>
        </div>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3 class="step-title">Create Your Account</h3>
            <p class="step-desc">Register in seconds with your name, email, and preferred currency.</p>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <h3 class="step-title">Add Transactions</h3>
            <p class="step-desc">Log daily income and expense transactions with categories and payment methods.</p>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <h3 class="step-title">Understand Your Health</h3>
            <p class="step-desc">View your net balance and analyze spending patterns on the interactive dashboard.</p>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section id="about" class="landing-section about-section">
        <div class="about-card">
          <div class="about-content">
            <span class="about-label">ABOUT FINORA</span>
            <h2 class="about-heading">Simplifying Personal Finance Management</h2>
            <p class="about-text">
              Finora was created to provide a clean, reliable, and transparent platform for tracking personal finances. Managing finances across scattered statements can be confusing. Finora brings your income and expenses into a clear, unified view so you always know where your money goes.
            </p>
            <p class="about-text">
              Built with precision engineering principles, Finora enforces exact decimal financial calculations, isolated multi-user data protection, and responsive usability across all devices.
            </p>

            <div class="developer-box">
              <div class="dev-avatar">RJ</div>
              <div class="dev-info">
                <div class="dev-name">Built by Rishi Kumar Jha</div>
                <div class="dev-role">B.Tech Computer Science student and aspiring full-stack developer.</div>
                <a href="https://github.com/Rishijha121003/Finora" target="_blank" rel="noopener noreferrer" class="dev-github-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  View Project on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Final Call to Action -->
      <section class="landing-section cta-section">
        <div class="cta-card">
          <h2 class="cta-title">Ready to take control of your finances?</h2>
          <p class="cta-subtitle">Join Finora today and experience simple, transparent financial tracking.</p>
          <a href="${isLoggedIn ? '#dashboard' : '#register'}" class="btn btn-primary btn-lg">
            ${isLoggedIn ? 'Go to Dashboard' : 'Create Free Account'}
          </a>
        </div>
      </section>

      <!-- Minimal Landing Footer -->
      <footer class="landing-footer">
        <div class="footer-container">
          <div class="footer-brand">
            <img src="assets/logo.png?v=1.1.0" class="brand-logo-img" alt="Finora Logo" style="width:28px; height:28px;" />
            <span style="font-weight:700; color:var(--text-main);">Finora</span>
          </div>

          <div class="footer-links">
            <a href="#hero">Home</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="https://github.com/Rishijha121003/Finora" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>

          <div class="footer-copy">
            Finora v1.1.0 &bull; &copy; 2026 All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  `;

  // Attach Mobile Navigation Drawer Controls
  const mobileToggle = document.getElementById('landing-mobile-toggle');
  const drawer = document.getElementById('landing-drawer');
  const overlay = document.getElementById('landing-drawer-overlay');
  const drawerClose = document.getElementById('landing-drawer-close');

  const openDrawer = () => {
    if (drawer && overlay) {
      drawer.classList.add('active');
      overlay.classList.add('active');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeDrawer = () => {
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Close drawer on link click
  const drawerLinks = drawer ? drawer.querySelectorAll('a') : [];
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Close drawer on Escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('active')) {
      closeDrawer();
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // Smooth Section Scrolling Click Handlers (Prevents conflicting SPA hash navigation on reload)
  const sectionLinks = container.querySelectorAll('a[href="#hero"], a[href="#features"], a[href="#about"]');
  sectionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').replace('#', '');
      const targetEl = document.getElementById(targetId);

      if (targetId === 'hero' || targetId === 'landing') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }

      closeDrawer();
    });
  });

  // Handle Initial View Scroll Position
  if (targetSection === 'features' || targetSection === 'about') {
    const initialEl = document.getElementById(targetSection);
    if (initialEl) {
      setTimeout(() => initialEl.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  } else {
    window.scrollTo(0, 0);
  }
}
