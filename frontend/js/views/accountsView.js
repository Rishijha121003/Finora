import APIClient from '../api.js';
import { formatCurrency } from '../currency.js';

export async function renderAccountsView(container) {
  let accounts = [];

  container.innerHTML = `
    <div class="view-container">
      <div class="view-header">
        <div>
          <h1>Accounts</h1>
          <p>Manage your cash, bank accounts and wallets.</p>
        </div>

        <div>
          <button id="transfer-money-btn" class="btn">
            Transfer Money
          </button>

          <button id="add-account-btn" class="btn btn-primary">
            + Add Account
          </button>
        </div>
      </div>

      <div id="accounts-content">
        <p>Loading accounts...</p>
      </div>

      <!-- Add Account Modal -->
      <div id="account-modal" class="account-modal" hidden>
        <div class="account-modal-content">
          <div class="account-modal-header">
            <h2>Add Account</h2>
            <button id="close-account-modal" type="button">×</button>
          </div>

          <form id="account-form">
            <div class="form-group">
              <label for="account-name">Account Name</label>
              <input
                id="account-name"
                type="text"
                maxlength="100"
                placeholder="e.g. SBI Bank"
                required
              >
            </div>

            <div class="form-group">
              <label for="account-type">Account Type</label>
              <select id="account-type" required>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
                <option value="WALLET">Wallet</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label for="opening-balance">Opening Balance</label>
              <input
                id="opening-balance"
                type="number"
                step="0.01"
                value="0.00"
                required
              >
            </div>

            <p id="account-form-error" hidden></p>

            <div class="account-form-actions">
              <button
                id="cancel-account-btn"
                type="button"
                class="btn"
              >
                Cancel
              </button>

              <button
                id="save-account-btn"
                type="submit"
                class="btn btn-primary"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Transfer Modal -->
      <div id="transfer-modal" class="account-modal" hidden>
        <div class="account-modal-content">
          <div class="account-modal-header">
            <h2>Transfer Money</h2>
            <button id="close-transfer-modal" type="button">×</button>
          </div>

          <form id="transfer-form">

            <div class="form-group">
              <label for="from-account">From Account</label>
              <select id="from-account" required></select>
            </div>

            <div class="form-group">
              <label for="to-account">To Account</label>
              <select id="to-account" required></select>
            </div>

            <div class="form-group">
              <label for="transfer-amount">Amount</label>
              <input
                id="transfer-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
              >
            </div>

            <div class="form-group">
              <label for="transfer-date">Date</label>
              <input
                id="transfer-date"
                type="date"
                required
              >
            </div>

            <div class="form-group">
              <label for="transfer-note">Note</label>
              <input
                id="transfer-note"
                type="text"
                placeholder="Optional note"
              >
            </div>

            <p id="transfer-form-error" hidden></p>

            <div class="account-form-actions">
              <button
                id="cancel-transfer-btn"
                type="button"
                class="btn"
              >
                Cancel
              </button>

              <button
                id="save-transfer-btn"
                type="submit"
                class="btn btn-primary"
              >
                Transfer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const content = container.querySelector('#accounts-content');

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
      <div class="skeleton-card" style="padding:1.5rem;">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line subtitle"></div>
      </div>
    `;

    try {
      const [accountsData, summaryData] = await Promise.all([
        APIClient.getAccounts(),
        APIClient.getAccountSummary().catch(() => [])
      ]);

      accounts = accountsData;

      if (!accounts.length) {
        content.innerHTML = `
          <div class="empty-state" style="padding:2.5rem 1rem;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.5rem;">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <h3 style="font-size:1rem; font-weight:700; color:var(--text-main); margin-bottom:0.2rem;">No accounts yet</h3>
            <p style="font-size:0.82rem; color:var(--text-muted);">Create your first account (Bank, Cash, or Wallet) to start tracking transactions.</p>
          </div>
        `;
        return;
      }

      // Map summary data by account name
      const summaryMap = {};
      (summaryData || []).forEach(item => {
        summaryMap[item.account_name] = item;
      });

      content.innerHTML = `
        <div class="accounts-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1.25rem;">
          ${accounts.map(account => {
            const accType = (account.account_type || 'BANK').toUpperCase();
            const summary = summaryMap[account.name] || {};
            const incomeAmt = summary.income || 0;
            const expenseAmt = summary.expense || 0;

            let typeLabel = 'Bank Account';
            let iconClass = 'bank';
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

            if (accType === 'CASH') {
              typeLabel = 'Cash Account';
              iconClass = 'cash';
              typeIconSvg = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
                </svg>
              `;
            } else if (accType === 'WALLET') {
              typeLabel = 'Digital Wallet';
              iconClass = 'wallet';
              typeIconSvg = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M6 8h12"/>
                  <path d="M6 12h8"/>
                </svg>
              `;
            } else if (accType === 'OTHER') {
              typeLabel = 'Other Account';
              iconClass = 'other';
            }

            return `
              <div class="account-card-v2 card" style="display:flex; flex-direction:column; gap:0.85rem; padding:1.25rem;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <div class="account-icon-box ${iconClass}">
                    ${typeIconSvg}
                  </div>
                  <div style="flex:1; min-width:0;">
                    <h3 style="font-size:1rem; font-weight:700; color:var(--text-main); margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${account.name}</h3>
                    <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">${typeLabel}</span>
                  </div>
                </div>

                <div style="padding:0.6rem 0; border-top:1px solid var(--glass-border); border-bottom:1px solid var(--glass-border);">
                  <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Current Balance</div>
                  <div style="font-size:1.4rem; font-weight:800; color:var(--text-main); font-variant-numeric:tabular-nums; margin-top:0.15rem;">
                    ${formatCurrency(account.current_balance)}
                  </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; font-size:0.78rem;">
                  <span class="stat-badge income" style="display:inline-flex; align-items:center; gap:0.3rem; padding:0.2rem 0.5rem; border-radius:6px; background:var(--income-light); color:var(--income); font-weight:600;">
                    ↑ ${formatCurrency(incomeAmt)}
                  </span>
                  <span class="stat-badge expense" style="display:inline-flex; align-items:center; gap:0.3rem; padding:0.2rem 0.5rem; border-radius:6px; background:var(--expense-light); color:var(--expense); font-weight:600;">
                    ↓ ${formatCurrency(expenseAmt)}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (error) {
      content.innerHTML = `
        <div class="empty-state" style="padding:2rem;">
          <h3 style="font-size:1rem; color:#F43F5E; font-weight:700;">Could not load accounts</h3>
          <p style="font-size:0.85rem; color:var(--text-muted);">${error.message}</p>
        </div>
      `;
    }
  }

  function openAccountModal() {
    accountModal.hidden = false;
    accountError.hidden = true;
    container.querySelector('#account-name').focus();
  }

  function closeAccountModal() {
    accountModal.hidden = true;
    accountForm.reset();
    container.querySelector('#opening-balance').value = '0.00';
    accountError.hidden = true;
  }

  function openTransferModal() {
    if (accounts.length < 2) {
      alert('You need at least two accounts to make a transfer.');
      return;
    }

    const options = accounts.map(account => `
      <option value="${account.id}">
        ${account.name} (${formatCurrency(account.current_balance)})
      </option>
    `).join('');

    fromAccountSelect.innerHTML = options;
    toAccountSelect.innerHTML = options;

    // Default destination to second account.
    if (accounts.length > 1) {
      toAccountSelect.selectedIndex = 1;
    }

    container.querySelector('#transfer-date').value =
      new Date().toISOString().split('T')[0];

    transferError.hidden = true;
    transferModal.hidden = false;
  }

  function closeTransferModal() {
    transferModal.hidden = true;
    transferForm.reset();
    transferError.hidden = true;
  }

  container
    .querySelector('#add-account-btn')
    .addEventListener('click', openAccountModal);

  container
    .querySelector('#close-account-modal')
    .addEventListener('click', closeAccountModal);

  container
    .querySelector('#cancel-account-btn')
    .addEventListener('click', closeAccountModal);

  container
    .querySelector('#transfer-money-btn')
    .addEventListener('click', openTransferModal);

  container
    .querySelector('#close-transfer-modal')
    .addEventListener('click', closeTransferModal);

  container
    .querySelector('#cancel-transfer-btn')
    .addEventListener('click', closeTransferModal);

  accountForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = container
      .querySelector('#account-name')
      .value
      .trim();

    const accountType = container
      .querySelector('#account-type')
      .value;

    const openingBalance = container
      .querySelector('#opening-balance')
      .value;

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
      transferError.textContent =
        'From account and to account must be different.';
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

      // Reload balances after successful transfer.
      await loadAccounts();
    } catch (error) {
      transferError.textContent = error.message;
      transferError.hidden = false;
    } finally {
      saveTransferButton.disabled = false;
      saveTransferButton.textContent = 'Transfer';
    }
  });

  await loadAccounts();
}