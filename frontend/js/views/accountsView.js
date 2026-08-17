import APIClient from '../api.js';

export async function renderAccountsView(container) {
  let accounts = [];

  const currencyCode = (window.authManager && window.authManager.getUserCurrency)
    ? window.authManager.getUserCurrency()
    : 'INR';

  function formatCurr(amount) {
    if (window.formatCurrency) return window.formatCurrency(amount, currencyCode);
    return `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  container.innerHTML = `
    <div class="view-container" style="max-width: 1280px; margin: 0 auto; padding: 1.5rem 1.5rem 3rem 1.5rem;">
      <!-- Hero Header -->
      <div class="view-header accounts-hero" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div class="accounts-header-copy">
          <div class="accounts-eyebrow" style="font-size: 0.75rem; font-weight: 800; color: #10B981; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.25rem;">Finora Vault</div>
          <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin: 0 0 0.25rem 0;">Accounts & Vault</h1>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">Organize your bank accounts, cash, and digital wallets in one place.</p>
        </div>

        <div class="accounts-header-actions" style="display: flex; gap: 0.75rem;">
          <button id="transfer-money-btn" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.55rem 1rem; border-radius: 12px; font-size: 0.85rem; font-weight: 700;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            <span>Transfer Money</span>
          </button>

          <button id="add-account-btn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.55rem 1rem; border-radius: 12px; font-size: 0.85rem; font-weight: 700; background: #10B981; border: none; color: #FFF;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Account</span>
          </button>
        </div>
      </div>

      <!-- Portfolio Summary Section -->
      <div id="accounts-summary" class="accounts-summary-shell" style="margin-bottom: 1.5rem;"></div>

      <!-- Main Content Grid / List -->
      <div id="accounts-content">
        <p style="color: var(--text-muted);">Loading accounts...</p>
      </div>

      <!-- Add Account Modal -->
      <div id="account-modal" class="account-modal" hidden>
        <div class="account-modal-content card" style="max-width: 460px; margin: 2rem auto; padding: 1.5rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px;">
          <div class="account-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h2 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main); margin: 0;">Add New Account</h2>
            <button id="close-account-modal" type="button" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">×</button>
          </div>

          <form id="account-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
              <label for="account-name" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem;">Account Name</label>
              <input
                id="account-name"
                class="form-control"
                type="text"
                maxlength="100"
                placeholder="e.g. HDFC Checking / Main Wallet"
                required
                style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); color: var(--text-main);"
              >
            </div>

            <div class="form-group">
              <label for="account-type" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem;">Account Type</label>
              <select id="account-type" class="form-control" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; background: rgba(17, 27, 50, 0.95); border: 1px solid var(--glass-border); color: var(--text-main);">
                <option value="BANK">Bank Account</option>
                <option value="CASH">Cash</option>
                <option value="WALLET">Digital Wallet</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label for="opening-balance" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem;">Opening Balance</label>
              <input
                id="opening-balance"
                class="form-control"
                type="number"
                step="0.01"
                value="0.00"
                required
                style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); color: var(--text-main);"
              >
            </div>

            <p id="account-form-error" style="color: #F43F5E; font-size: 0.82rem; margin: 0;" hidden></p>

            <div class="account-form-actions" style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
              <button id="cancel-account-btn" type="button" class="btn btn-secondary" style="padding: 0.55rem 1rem; border-radius: 10px;">Cancel</button>
              <button id="save-account-btn" type="submit" class="btn btn-primary" style="padding: 0.55rem 1.25rem; border-radius: 10px; background: #10B981; border: none; color: #FFF; font-weight: 700;">Create Account</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Transfer Modal -->
      <div id="transfer-modal" class="account-modal" hidden>
        <div class="account-modal-content card" style="max-width: 460px; margin: 2rem auto; padding: 1.5rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px;">
          <div class="account-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h2 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main); margin: 0;">Transfer Money</h2>
            <button id="close-transfer-modal" type="button" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">×</button>
          </div>

          <form id="transfer-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
              <label for="from-account" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem;">From Account</label>
              <select id="from-account" class="form-control" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; background: rgba(17, 27, 50, 0.95); border: 1px solid var(--glass-border); color: var(--text-main);"></select>
            </div>

            <div class="form-group">
              <label for="to-account" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem;">To Account</label>
              <select id="to-account" class="form-control" required style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; background: rgba(17, 27, 50, 0.95); border: 1px solid var(--glass-border); color: var(--text-main);"></select>
            </div>

            <div class="form-group">
              <label for="transfer-amount" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem;">Amount</label>
              <input
                id="transfer-amount"
                class="form-control"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
                style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); color: var(--text-main);"
              >
            </div>

            <div class="form-group">
              <label for="transfer-date" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem;">Transfer Date</label>
              <input
                id="transfer-date"
                class="form-control"
                type="date"
                required
                style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); color: var(--text-main);"
              >
            </div>

            <div class="form-group">
              <label for="transfer-note" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem;">Note (Optional)</label>
              <input
                id="transfer-note"
                class="form-control"
                type="text"
                placeholder="e.g. Savings allocation"
                style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); color: var(--text-main);"
              >
            </div>

            <p id="transfer-form-error" style="color: #F43F5E; font-size: 0.82rem; margin: 0;" hidden></p>

            <div class="account-form-actions" style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
              <button id="cancel-transfer-btn" type="button" class="btn btn-secondary" style="padding: 0.55rem 1rem; border-radius: 10px;">Cancel</button>
              <button id="save-transfer-btn" type="submit" class="btn btn-primary" style="padding: 0.55rem 1.25rem; border-radius: 10px; background: #6366F1; border: none; color: #FFF; font-weight: 700;">Submit Transfer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const content = container.querySelector('#accounts-content');
  const summaryCard = container.querySelector('#accounts-summary');

  const accountModal = container.querySelector('#account-modal');
  const accountForm = container.querySelector('#account-form');
  const accountError = container.querySelector('#account-form-error');
  const saveAccountButton = container.querySelector('#save-account-btn');

  const transferModal = container.querySelector('#transfer-modal');
  const transferForm = container.querySelector('#transfer-form');
  const transferError = container.querySelector('#transfer-form-error');
  const saveTransferButton = container.querySelector('#save-transfer-btn');

  const fromAccountSelect = container.querySelector('#from-account');
  const toAccountSelect = container.querySelector('#to-account');

  async function loadAccounts() {
    content.innerHTML = `
      <div style="padding: 2.5rem; text-align: center; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="animation: spin 1s linear infinite; margin-bottom: 0.5rem;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        <div style="font-weight: 600; font-size: 0.9rem;">Fetching account balances...</div>
      </div>
    `;
    summaryCard.innerHTML = `
      <div style="padding: 1.5rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 20px; text-align: center;">
        <div style="height: 20px; width: 140px; background: rgba(255,255,255,0.06); border-radius: 6px; margin: 0 auto 0.5rem auto;"></div>
        <div style="height: 32px; width: 220px; background: rgba(255,255,255,0.06); border-radius: 6px; margin: 0 auto;"></div>
      </div>
    `;

    try {
      const [accountsData, summaryData] = await Promise.all([
        APIClient.getAccounts(),
        APIClient.getAccountSummary().catch(() => [])
      ]);

      accounts = accountsData;

      const summaryMap = {};
      (summaryData || []).forEach(item => {
        summaryMap[item.account_name] = item;
        if (item.account_id) {
          summaryMap[item.account_id] = item;
        }
      });

      const totalBalance = accounts.reduce((sum, account) => sum + Number(account.current_balance || 0), 0);
      const totalIncome = accounts.reduce((sum, account) => {
        const summary = summaryMap[account.id] || summaryMap[account.name] || {};
        return sum + Number(summary.income || 0);
      }, 0);
      const totalExpense = accounts.reduce((sum, account) => {
        const summary = summaryMap[account.id] || summaryMap[account.name] || {};
        return sum + Number(summary.expense || 0);
      }, 0);

      // Render Portfolio Summary Card
      summaryCard.innerHTML = `
        <div class="card accounts-summary-card" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(17, 27, 50, 0.95)); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 24px;">
          <div class="accounts-summary-copy" style="margin-bottom: 1.25rem;">
            <div class="accounts-eyebrow" style="font-size: 0.75rem; font-weight: 800; color: #10B981; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.2rem;">Portfolio Overview</div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin: 0;">Total Financial Vault</h2>
          </div>

          <div class="accounts-summary-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
            <div class="accounts-summary-stat primary" style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 16px;">
              <span class="accounts-summary-label" style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.3rem;">Total Balance</span>
              <span class="accounts-summary-value" style="font-size: 1.35rem; font-weight: 800; color: #10B981;">${formatCurr(totalBalance)}</span>
            </div>

            <div class="accounts-summary-stat accent" style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 16px;">
              <span class="accounts-summary-label" style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.3rem;">Active Accounts</span>
              <span class="accounts-summary-value" style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">${accounts.length}</span>
            </div>

            <div class="accounts-summary-stat income" style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 16px;">
              <span class="accounts-summary-label" style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.3rem;">Total Income</span>
              <span class="accounts-summary-value" style="font-size: 1.35rem; font-weight: 800; color: #10B981;">${formatCurr(totalIncome)}</span>
            </div>

            <div class="accounts-summary-stat expense" style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 16px;">
              <span class="accounts-summary-label" style="display: block; font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.3rem;">Total Expense</span>
              <span class="accounts-summary-value" style="font-size: 1.35rem; font-weight: 800; color: #F43F5E;">${formatCurr(totalExpense)}</span>
            </div>
          </div>
        </div>
      `;

      if (!accounts.length) {
        content.innerHTML = `
          <div class="card empty-state accounts-empty-state" style="padding: 3rem 1.5rem; text-align: center; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 24px;">
            <div style="width: 54px; height: 54px; border-radius: 16px; background: rgba(16, 185, 129, 0.12); color: #10B981; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main); margin: 0 0 0.4rem 0;">No accounts found</h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0 0 1.25rem 0; max-width: 400px; margin-left: auto; margin-right: auto;">
              Create your first Bank, Cash, or Digital Wallet account to start tracking transactions and balances.
            </p>
            <button id="empty-add-account-btn" type="button" class="btn btn-primary" style="padding: 0.6rem 1.25rem; border-radius: 12px; background: #10B981; border: none; color: #FFF; font-weight: 700;">
              + Create First Account
            </button>
          </div>
        `;

        const emptyAddBtn = content.querySelector('#empty-add-account-btn');
        if (emptyAddBtn) {
          emptyAddBtn.addEventListener('click', openAccountModal);
        }
        return;
      }

      // Render Account Cards Grid
      content.innerHTML = `
        <div class="accounts-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
          ${accounts.map(account => {
            const rawType = (account.account_type || 'BANK').toUpperCase();
            const summary = summaryMap[account.id] || summaryMap[account.name] || {};
            const incomeAmt = Number(summary.income || 0);
            const expenseAmt = Number(summary.expense || 0);

            let typeLabel = 'Bank Account';
            let iconClass = 'green';
            let typeIconSvg = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="21" x2="21" y2="21"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <polyline points="5 10 12 3 19 10"/>
                <line x1="6" y1="18" x2="6" y2="10"/>
                <line x1="10" y1="18" x2="10" y2="10"/>
                <line x1="14" y1="18" x2="14" y2="10"/>
                <line x1="18" y1="18" x2="18" y2="10"/>
              </svg>
            `;

            if (rawType === 'CASH') {
              typeLabel = 'Cash';
              iconClass = 'blue';
              typeIconSvg = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
                </svg>
              `;
            } else if (rawType === 'WALLET') {
              typeLabel = 'Digital Wallet';
              iconClass = 'purple';
              typeIconSvg = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M6 8h12"/>
                  <path d="M6 12h8"/>
                </svg>
              `;
            } else if (rawType === 'OTHER') {
              typeLabel = 'Other';
              iconClass = 'orange';
              typeIconSvg = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M16 12l-4-4-4 4M12 8v8"/>
                </svg>
              `;
            }

            return `
              <article class="card account-card-v2" style="background: var(--bg-card); border: 1px solid var(--glass-border); padding: 1.35rem; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div class="account-card-header" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
                    <div class="factor-v2-icon-box ${iconClass}" style="width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                      ${typeIconSvg}
                    </div>
                    <div class="account-card-title-wrap" style="flex: 1; overflow: hidden;">
                      <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin: 0 0 0.15rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(account.name)}</h3>
                      <span style="display: inline-block; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); background: rgba(255,255,255,0.06); padding: 0.12rem 0.45rem; border-radius: 6px;">${typeLabel}</span>
                    </div>
                  </div>

                  <div class="account-card-balance-pane" style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 14px; margin-bottom: 1rem;">
                    <div class="account-card-balance-label" style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.2rem;">Current Balance</div>
                    <div class="account-card-balance" style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.3rem;">${formatCurr(account.current_balance)}</div>
                    <div class="account-card-opening" style="font-size: 0.75rem; color: var(--text-muted);">Opening Balance • ${formatCurr(account.opening_balance)}</div>
                  </div>
                </div>

                <div class="account-card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid var(--glass-border);">
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">TOTAL INCOME</span>
                    <span style="font-size: 0.85rem; font-weight: 800; color: #10B981;">↑ ${formatCurr(incomeAmt)}</span>
                  </div>
                  <div style="display: flex; flex-direction: column; text-align: right;">
                    <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700;">TOTAL EXPENSE</span>
                    <span style="font-size: 0.85rem; font-weight: 800; color: #F43F5E;">↓ ${formatCurr(expenseAmt)}</span>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      `;
    } catch (error) {
      content.innerHTML = `
        <div class="card empty-state accounts-empty-state error-state" style="padding: 2.5rem; text-align: center; background: var(--bg-card); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 20px;">
          <h3 style="color: #F43F5E; font-size: 1.1rem; font-weight: 800; margin-bottom: 0.4rem;">Could not load accounts</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.25rem;">${escapeHTML(error.message || 'An API error occurred while loading your financial accounts.')}</p>
          <button id="retry-accounts-btn" type="button" class="btn btn-primary" style="padding: 0.55rem 1.2rem; border-radius: 10px; background: #6366F1; border: none; color: #FFF; font-weight: 700;">Retry</button>
        </div>
      `;
      const retryBtn = content.querySelector('#retry-accounts-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadAccounts);
      }
    }
  }

  function openAccountModal() {
    accountModal.hidden = false;
    accountError.hidden = true;
    const nameInput = container.querySelector('#account-name');
    if (nameInput) nameInput.focus();
  }

  function closeAccountModal() {
    accountModal.hidden = true;
    accountForm.reset();
    const opBal = container.querySelector('#opening-balance');
    if (opBal) opBal.value = '0.00';
    accountError.hidden = true;
  }

  function openTransferModal() {
    if (accounts.length < 2) {
      alert('You need at least two accounts to execute an inter-account transfer.');
      return;
    }

    const options = accounts.map(account => `
      <option value="${account.id}">
        ${escapeHTML(account.name)} (${formatCurr(account.current_balance)})
      </option>
    `).join('');

    fromAccountSelect.innerHTML = options;
    toAccountSelect.innerHTML = options;

    if (accounts.length > 1) {
      toAccountSelect.selectedIndex = 1;
    }

    const dateInput = container.querySelector('#transfer-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    transferError.hidden = true;
    transferModal.hidden = false;
  }

  function closeTransferModal() {
    transferModal.hidden = true;
    transferForm.reset();
    transferError.hidden = true;
  }

  // Event Listeners
  container.querySelector('#add-account-btn').addEventListener('click', openAccountModal);
  container.querySelector('#close-account-modal').addEventListener('click', closeAccountModal);
  container.querySelector('#cancel-account-btn').addEventListener('click', closeAccountModal);

  container.querySelector('#transfer-money-btn').addEventListener('click', openTransferModal);
  container.querySelector('#close-transfer-modal').addEventListener('click', closeTransferModal);
  container.querySelector('#cancel-transfer-btn').addEventListener('click', closeTransferModal);

  accountForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = container.querySelector('#account-name').value.trim();
    const accountType = container.querySelector('#account-type').value;
    const openingBalance = container.querySelector('#opening-balance').value;

    accountError.hidden = true;
    saveAccountButton.disabled = true;
    saveAccountButton.textContent = 'Creating...';

    try {
      await APIClient.createAccount({
        name,
        account_type: accountType,
        opening_balance: openingBalance
      });

      closeAccountModal();
      await loadAccounts();
    } catch (error) {
      accountError.textContent = error.message;
      accountError.hidden = false;
    } finally {
      saveAccountButton.disabled = false;
      saveAccountButton.textContent = 'Create Account';
    }
  });

  transferForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fromAccountId = fromAccountSelect.value;
    const toAccountId = toAccountSelect.value;
    const amount = container.querySelector('#transfer-amount').value;
    const transferDate = container.querySelector('#transfer-date').value;
    const note = container.querySelector('#transfer-note').value.trim();

    if (fromAccountId === toAccountId) {
      transferError.textContent = 'From account and to account must be different.';
      transferError.hidden = false;
      return;
    }

    transferError.hidden = true;
    saveTransferButton.disabled = true;
    saveTransferButton.textContent = 'Transferring...';

    try {
      await APIClient.createTransfer({
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount,
        transfer_date: transferDate,
        note: note || null
      });

      closeTransferModal();
      await loadAccounts();
    } catch (error) {
      transferError.textContent = error.message;
      transferError.hidden = false;
    } finally {
      saveTransferButton.disabled = false;
      saveTransferButton.textContent = 'Submit Transfer';
    }
  });

  await loadAccounts();
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}