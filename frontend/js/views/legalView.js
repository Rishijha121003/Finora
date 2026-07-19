// Finora Legal Views: Privacy Policy (#privacy) & Terms of Service (#terms)

export function renderLegalView(hash = '#privacy') {
  const isPrivacy = hash === '#privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  const subtitle = isPrivacy ? 'How Finora protects your data and respects your privacy' : 'Terms and conditions governing your use of Finora';
  const lastUpdated = 'July 19, 2026';

  const privacyContent = `
    <section style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">1. Zero Bank Credential Collection</h3>
      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
        Finora operates on a 100% manual tracking and privacy-conscious model. We <strong>never</strong> ask for, store, or access your bank credentials, net banking passwords, credit card numbers, or automated SMS data. All income and expense entries are created solely by you.
      </p>
    </section>

    <section style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">2. Data Storage & Security</h3>
      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
        Your account details and financial records are stored securely in isolated database tables encrypted in transit using SSL/TLS. Authentication is managed via stateless JWT (JSON Web Tokens) with passwords hashed using industry-standard bcrypt.
      </p>
    </section>

    <section style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">3. Data Ownership, Export & Deletion</h3>
      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
        You own 100% of your financial data. Finora provides self-service features under <strong>Profile Settings</strong> allowing you to:
      </p>
      <ul style="font-size:0.9rem; color:var(--text-muted); line-height:1.6; margin-top:0.4rem; padding-left:1.2rem;">
        <li>Export your complete transaction history to a standard CSV spreadsheet at any time in 1 click.</li>
        <li>Permanently delete your account and wipe all associated financial records, custom categories, budgets, and preferences immediately with zero soft-deletes.</li>
      </ul>
    </section>

    <section style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">4. Analytics & Non-PII Usage</h3>
      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
        We collect minimal, aggregate non-PII operational events (such as session counts and feature usage) to improve application performance and stability. Finora does <strong>not</strong> track, sell, or share your individual transaction notes, amounts, or personal financial details with third-party advertisers.
      </p>
    </section>

    <section style="margin-bottom:1rem;">
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">5. Regulatory Disclaimer</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.6; background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:8px; border:1px solid var(--glass-border);">
        Finora's data ownership features strengthen user privacy control. However, this statement is for informational transparency and does not constitute formal legal advice or regulatory certification under GDPR, DPDP, or other regional compliance frameworks.
      </p>
    </section>
  `;

  const termsContent = `
    <section style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">1. Acceptance of Terms</h3>
      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
        By creating an account or accessing Finora, you agree to abide by these Terms of Service. If you do not agree to these terms, you should discontinue using the application.
      </p>
    </section>

    <section style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">2. User Responsibility & Accuracy</h3>
      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
        Finora is a personal budgeting and expense tracking tool designed for informational utility. You are solely responsible for the accuracy of the transactions and budgets you record. Finora is not a chartered accounting service, financial advisor, or registered banking institution.
      </p>
    </section>

    <section style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">3. Account Security</h3>
      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
        You are responsible for maintaining the confidentiality of your login credentials and password. Finora provides password change and full account deletion options in your Profile Settings.
      </p>
    </section>

    <section style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">4. Service Availability & Modifications</h3>
      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
        We strive to maintain continuous application availability. Finora reserves the right to update features, perform maintenance, or adjust service capabilities to improve security and user experience.
      </p>
    </section>

    <section style="margin-bottom:1rem;">
      <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.5rem;">5. Limitation of Liability</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.6; background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:8px; border:1px solid var(--glass-border);">
        Finora is provided "as is" without warranty of any kind. Finora and its creators shall not be liable for any direct, indirect, or incidental decisions made based on recorded financial entries or budget calculations.
      </p>
    </section>
  `;

  return `
    <div style="max-width:800px; margin:0 auto; padding:1.5rem 1rem 3rem 1rem;">
      <!-- Navigation Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <a href="javascript:history.back()" class="btn btn-secondary" style="padding:0.4rem 0.9rem; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.4rem; text-decoration:none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </a>
        <div style="display:flex; gap:0.5rem;">
          <a href="#privacy" class="btn ${isPrivacy ? 'btn-primary' : 'btn-secondary'}" style="padding:0.4rem 0.8rem; font-size:0.8rem; text-decoration:none;">Privacy Policy</a>
          <a href="#terms" class="btn ${!isPrivacy ? 'btn-primary' : 'btn-secondary'}" style="padding:0.4rem 0.8rem; font-size:0.8rem; text-decoration:none;">Terms of Service</a>
        </div>
      </div>

      <!-- Main Document Card -->
      <div class="card" style="padding:2rem 1.75rem; border:1px solid var(--glass-border); background:var(--bg-card); border-radius:16px;">
        <div style="border-bottom:1px solid var(--border-color); padding-bottom:1rem; margin-bottom:1.5rem;">
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--text-main); margin:0 0 0.4rem 0;">${title}</h1>
          <p style="font-size:0.9rem; color:var(--text-muted); margin:0 0 0.5rem 0;">${subtitle}</p>
          <span style="font-size:0.78rem; font-weight:600; color:var(--primary); background:rgba(99,102,241,0.1); padding:0.2rem 0.6rem; border-radius:12px;">Last Updated: ${lastUpdated}</span>
        </div>

        <div class="legal-body">
          ${isPrivacy ? privacyContent : termsContent}
        </div>

        <div style="margin-top:2rem; padding-top:1rem; border-top:1px solid var(--border-color); text-align:center; font-size:0.82rem; color:var(--text-muted);">
          Have questions regarding privacy or data ownership? Contact us via 
          <a href="#landing" style="color:var(--primary); text-decoration:none; font-weight:600;">Finora Feedback</a>.
        </div>
      </div>
    </div>
  `;
}
