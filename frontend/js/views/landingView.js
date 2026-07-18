import { authManager } from '../auth.js';

export function renderLandingView(container) {
  const isLoggedIn = authManager.isAuthenticated();

  container.innerHTML = `
    <div class="landing-page">
      <!-- Public Header Navigation -->
      <header class="landing-header">
        <div class="landing-nav-container">
          <a href="${isLoggedIn ? '#dashboard' : '#hero'}" class="brand">
            <div class="brand-icon">₹</div>
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

          <!-- Mobile Nav Hamburger -->
          <button class="landing-mobile-toggle" id="landing-mobile-toggle" aria-label="Toggle navigation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Mobile Menu Dropdown -->
        <div class="landing-mobile-dropdown" id="landing-mobile-dropdown">
          <a href="#hero" class="landing-mobile-item">Home</a>
          <a href="#features" class="landing-mobile-item">Features</a>
          <a href="#about" class="landing-mobile-item">About</a>
          <div class="landing-mobile-divider"></div>
          ${isLoggedIn ? `
            <a href="#dashboard" class="btn btn-primary btn-block">Go to Dashboard</a>
          ` : `
            <a href="#login" class="btn btn-secondary btn-block" style="margin-bottom:0.5rem;">Login</a>
            <a href="#register" class="btn btn-primary btn-block">Get Started</a>
          `}
        </div>
      </header>

      <!-- Hero Section -->
      <section id="hero" class="landing-section hero-section">
        <div class="hero-content">
          <div class="hero-badge">v1.1.0 Released — Personal Finance Platform</div>
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
            <div class="brand-icon" style="width:28px; height:28px; font-size:0.9rem;">₹</div>
            <span style="font-weight:700; color:var(--text-main);">Finora</span>
          </div>

          <div class="footer-links">
            <a href="#hero">Home</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="https://github.com/Rishijha121003/Finora" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>

          <div class="footer-copy">
            &copy; 2026 Finora v1.1.0. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  `;

  // Attach Mobile Navigation Dropdown Toggle
  const mobileToggle = document.getElementById('landing-mobile-toggle');
  const mobileDropdown = document.getElementById('landing-mobile-dropdown');
  if (mobileToggle && mobileDropdown) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileDropdown.classList.toggle('active');
    });

    // Close on link click
    const mobileLinks = mobileDropdown.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDropdown.classList.remove('active');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (mobileDropdown.classList.contains('active') && !mobileDropdown.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileDropdown.classList.remove('active');
      }
    });
  }
}
