import APIClient from '../api.js';
import { formatCurrency } from '../currency.js';
import { authManager } from '../auth.js';

let currentCategories = [];
let editingTxId = null;

export async function renderTransactionsView(container, queryParams = {}) {
  const currencyCode = authManager.getUserCurrency();

  container.innerHTML = `
    <div class="tx-page-container">
      <!-- Header Section -->
      <div class="tx-header-row">
        <div>
          <h1 class="tx-title">Transactions</h1>
          <p class="tx-subtitle">Track and manage your financial activity</p>
        </div>

        <button class="btn-add-tx-main" id="btn-add-tx">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Add Transaction</span>
        </button>
      </div>

      <!-- Search Input Container -->
      <div class="tx-search-container">
        <svg class="tx-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" id="search-input" class="tx-search-input" placeholder="Search notes or category..." />
      </div>

      <!-- Filter Controls Grid -->
      <div class="tx-filters-grid">
        <select id="filter-type" class="tx-filter-select">
          <option value="">All Types</option>
          <option value="INCOME">Income Only</option>
          <option value="EXPENSE">Expense Only</option>
        </select>

        <select id="filter-category" class="tx-filter-select">
          <option value="">All Categories</option>
        </select>

        <button type="button" class="btn-adv-filters" id="btn-open-adv-filters">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span>Filters</span>
          <span class="adv-filter-dot" id="adv-filter-active-dot" style="display:none;"></span>
        </button>
      </div>

      <!-- Segmented Type Tabs Bar -->
      <div class="tx-type-tabs">
        <button type="button" class="tx-tab-btn active-all" id="tab-tx-all">
          <span>All</span>
          <span id="tab-count-all">(0)</span>
        </button>

        <button type="button" class="tx-tab-btn" id="tab-tx-income">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
          <span>Income</span>
          <span id="tab-count-income">(0)</span>
        </button>

        <button type="button" class="tx-tab-btn" id="tab-tx-expense">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="7" x2="17" y2="17"/>
            <polyline points="17 7 17 17 7 17"/>
          </svg>
          <span>Expense</span>
          <span id="tab-count-expense">(0)</span>
        </button>
      </div>

      <!-- Transaction Table / Mobile Cards Container -->
      <div id="tx-table-container">
        <div class="empty-state" style="padding:2rem;">Loading transactions...</div>
      </div>

      <div id="pagination-container" style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--glass-border); flex-wrap:wrap; gap:0.75rem;"></div>
    </div>

    <!-- Advanced Filters Modal -->
    <div class="modal-overlay" id="adv-filter-modal">
      <div class="modal" style="max-width:380px;">
        <div class="modal-header">
          <h3 class="modal-title">Advanced Filters</h3>
          <button class="modal-close" id="adv-filter-close-btn">&times;</button>
        </div>
        
        <div class="form-group" style="margin-bottom:1rem;">
          <label>Payment Method</label>
          <select id="filter-payment" class="form-control">
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; margin-bottom:1.25rem;">
          <div class="form-group">
            <label>From Date</label>
            <input type="date" id="filter-start-date" class="form-control" />
          </div>
          <div class="form-group">
            <label>To Date</label>
            <input type="date" id="filter-end-date" class="form-control" />
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem;">
          <button type="button" class="btn btn-secondary" id="adv-filter-reset-btn" style="flex:1;">Reset</button>
          <button type="button" class="btn btn-primary" id="adv-filter-apply-btn" style="flex:1.5;">Apply Filters</button>
        </div>
      </div>
    </div>

    <!-- Modal for Add/Edit Transaction -->
    <div class="modal-overlay" id="tx-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title">Add Transaction</h3>
          <button class="modal-close" id="modal-close-btn">&times;</button>
        </div>
        <form id="tx-form">
          <div id="modal-error" style="display:none; padding:0.6rem; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#ef4444; border-radius:6px; margin-bottom:1rem; font-size:0.85rem;"></div>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Type</label>
              <select id="tx-type" class="form-control" required>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div class="form-group">
              <label>Amount (${currencyCode})</label>
              <input type="number" step="0.01" min="0.01" id="tx-amount" class="form-control" placeholder="0.00" required />
            </div>
          </div>

          <div class="form-group">
            <label>Category</label>
            <select id="tx-category" class="form-control" required></select>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Date</label>
              <input type="date" id="tx-date" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Payment Method</label>
              <select id="tx-payment" class="form-control" required>
                <option value="UPI" selected>UPI</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Note / Description (Optional)</label>
            <textarea id="tx-note" class="form-control" rows="2" placeholder="Dinner with friends, Salary credit..."></textarea>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
            <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="modal-submit-btn">Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Load categories into select dropdowns
  try {
    currentCategories = await APIClient.getCategories();
    populateCategoryDropdowns(currentCategories);
  } catch (err) {
    console.error('Failed to load categories:', err);
  }

  // Set default today's date in tx form
  const dateInput = document.getElementById('tx-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  // Filters State & Reloaders
  let currentPage = 1;
  const triggerReload = () => {
    currentPage = 1;
    loadTransactions(currentPage, currencyCode);
  };

  document.getElementById('search-input')?.addEventListener('input', debounce(triggerReload, 300));
  document.getElementById('filter-type')?.addEventListener('change', (e) => {
    syncTabStyle(e.target.value);
    triggerReload();
  });
  document.getElementById('filter-category')?.addEventListener('change', triggerReload);

  // Advanced Filters Modal Handlers
  const advModal = document.getElementById('adv-filter-modal');
  const btnOpenAdv = document.getElementById('btn-open-adv-filters');
  const btnCloseAdv = document.getElementById('adv-filter-close-btn');
  const btnResetAdv = document.getElementById('adv-filter-reset-btn');
  const btnApplyAdv = document.getElementById('adv-filter-apply-btn');

  const updateAdvBadge = () => {
    const payment = document.getElementById('filter-payment')?.value;
    const start = document.getElementById('filter-start-date')?.value;
    const end = document.getElementById('filter-end-date')?.value;

    const isActive = Boolean(payment || start || end);
    const dot = document.getElementById('adv-filter-active-dot');
    if (dot) dot.style.display = isActive ? 'inline-block' : 'none';
    if (btnOpenAdv) {
      if (isActive) btnOpenAdv.classList.add('active');
      else btnOpenAdv.classList.remove('active');
    }
  };

  btnOpenAdv?.addEventListener('click', () => advModal.classList.add('active'));
  btnCloseAdv?.addEventListener('click', () => advModal.classList.remove('active'));

  btnResetAdv?.addEventListener('click', () => {
    const paymentSel = document.getElementById('filter-payment');
    const startInput = document.getElementById('filter-start-date');
    const endInput = document.getElementById('filter-end-date');

    if (paymentSel) paymentSel.value = '';
    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';

    updateAdvBadge();
    advModal.classList.remove('active');
    triggerReload();
  });

  btnApplyAdv?.addEventListener('click', () => {
    updateAdvBadge();
    advModal.classList.remove('active');
    triggerReload();
  });

  // Tab Switcher Handlers
  const tabAll = document.getElementById('tab-tx-all');
  const tabIncome = document.getElementById('tab-tx-income');
  const tabExpense = document.getElementById('tab-tx-expense');
  const filterTypeSelect = document.getElementById('filter-type');

  tabAll?.addEventListener('click', () => {
    filterTypeSelect.value = '';
    syncTabStyle('');
    triggerReload();
  });

  tabIncome?.addEventListener('click', () => {
    filterTypeSelect.value = 'INCOME';
    syncTabStyle('INCOME');
    triggerReload();
  });

  tabExpense?.addEventListener('click', () => {
    filterTypeSelect.value = 'EXPENSE';
    syncTabStyle('EXPENSE');
    triggerReload();
  });

  function syncTabStyle(type) {
    if (tabAll) tabAll.className = type === '' ? 'tx-tab-btn active-all' : 'tx-tab-btn';
    if (tabIncome) tabIncome.className = type === 'INCOME' ? 'tx-tab-btn active-income' : 'tx-tab-btn';
    if (tabExpense) tabExpense.className = type === 'EXPENSE' ? 'tx-tab-btn active-expense' : 'tx-tab-btn';
  }

  // Modal open/close handlers for Add/Edit Transaction
  const modal = document.getElementById('tx-modal');
  const openModal = (tx = null) => {
    editingTxId = tx ? tx.id : null;
    document.getElementById('modal-title').textContent = tx ? 'Edit Transaction' : 'Add New Transaction';
    document.getElementById('modal-error').style.display = 'none';

    // Apply mobile bottom-sheet class if viewport <= 640px
    const modalDialog = modal.querySelector('.modal-dialog') || modal.querySelector('.modal');
    if (modalDialog) {
      if (window.innerWidth <= 640) {
        modalDialog.classList.add('modal-dialog-bottom-sheet');
      } else {
        modalDialog.classList.remove('modal-dialog-bottom-sheet');
      }
    }

    if (tx) {
      document.getElementById('tx-type').value = tx.type;
      updateCategorySelectForType(tx.type);
      document.getElementById('tx-amount').value = tx.amount;
      document.getElementById('tx-category').value = tx.category_id;
      document.getElementById('tx-date').value = tx.transaction_date;
      document.getElementById('tx-payment').value = tx.payment_method;
      document.getElementById('tx-note').value = tx.note || '';
    } else {
      document.getElementById('tx-form').reset();
      document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('tx-type').value = 'EXPENSE';
      updateCategorySelectForType('EXPENSE');
    }
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    editingTxId = null;
  };

  document.getElementById('btn-add-tx')?.addEventListener('click', () => openModal());
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal);

  // Filter category dropdown on type change inside modal
  document.getElementById('tx-type')?.addEventListener('change', (e) => {
    updateCategorySelectForType(e.target.value);
  });

  // Modal Form Submit
  document.getElementById('tx-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('modal-error');
    errorDiv.style.display = 'none';

    const payload = {
      type: document.getElementById('tx-type').value,
      amount: parseFloat(document.getElementById('tx-amount').value),
      category_id: document.getElementById('tx-category').value,
      transaction_date: document.getElementById('tx-date').value,
      payment_method: document.getElementById('tx-payment').value,
      note: document.getElementById('tx-note').value
    };

    try {
      if (editingTxId) {
        await APIClient.updateTransaction(editingTxId, payload);
        if (window.showToast) window.showToast('Transaction updated successfully!', 'success');
      } else {
        await APIClient.createTransaction(payload);
        if (window.showToast) window.showToast('Transaction added successfully!', 'success');
      }
      closeModal();
      await loadTransactions(currentPage, currencyCode);
    } catch (err) {
      errorDiv.textContent = err.message || 'Failed to save transaction.';
      errorDiv.style.display = 'block';
      if (window.showToast) window.showToast(err.message || 'Failed to save transaction.', 'error');
    }
  });

  if (queryParams.action === 'new') {
    openModal();
  }

  await loadTransactions(currentPage, currencyCode);
}

function populateCategoryDropdowns(categories) {
  const filterCatSelect = document.getElementById('filter-category');
  if (filterCatSelect) {
    filterCatSelect.innerHTML = `<option value="">All Categories</option>` + 
      categories.map(c => `<option value="${c.id}">${escapeHTML(c.name)} (${c.type})</option>`).join('');
  }
  updateCategorySelectForType('EXPENSE');
}

function updateCategorySelectForType(type) {
  const txCatSelect = document.getElementById('tx-category');
  if (txCatSelect) {
    const filtered = currentCategories.filter(c => c.type === type);
    txCatSelect.innerHTML = filtered.map(c => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join('');
  }
}

async function loadTransactions(page, currencyCode) {
  const tableContainer = document.getElementById('tx-table-container');
  const paginationContainer = document.getElementById('pagination-container');

  const startDateInput = document.getElementById('filter-start-date');
  const endDateInput = document.getElementById('filter-end-date');

  const params = {
    page,
    limit: 15,
    search: document.getElementById('search-input')?.value || '',
    type: document.getElementById('filter-type')?.value || '',
    category_id: document.getElementById('filter-category')?.value || '',
    payment_method: document.getElementById('filter-payment')?.value || '',
    start_date: startDateInput ? startDateInput.value : '',
    end_date: endDateInput ? endDateInput.value : ''
  };

  try {
    const data = await APIClient.getTransactions(params);

    // Update tab count badges if available
    const totalCount = data.pagination ? data.pagination.total : (data.transactions ? data.transactions.length : 0);
    const tabAllCount = document.getElementById('tab-count-all');
    if (tabAllCount) tabAllCount.textContent = `(${totalCount})`;

    if (!data.transactions || data.transactions.length === 0) {
      tableContainer.innerHTML = `<div class="empty-state" style="padding:2rem;"><div class="empty-state-icon">🔍</div>No transactions found matching your filters.</div>`;
      paginationContainer.innerHTML = '';
      return;
    }

    // Render Desktop Table View & Mobile Cards Container
    tableContainer.innerHTML = `
      <!-- Desktop Table View (>= 769px) -->
      <div class="tx-desktop-table table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Method</th>
              <th>Note</th>
              <th>Type</th>
              <th style="text-align:right;">Amount</th>
              <th style="text-align:center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${data.transactions.map(tx => `
              <tr>
                <td><strong>${formatDateDisplay(tx.transaction_date)}</strong></td>
                <td>
                  <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${tx.category_color || '#64748b'}; margin-right:6px;"></span>
                  ${escapeHTML(tx.category_name || 'Uncategorized')}
                </td>
                <td><span class="badge badge-${tx.payment_method.toLowerCase()}">${tx.payment_method}</span></td>
                <td style="color:var(--text-muted); font-size:0.88rem;">${escapeHTML(tx.note || '-')}</td>
                <td><span class="badge badge-${tx.type.toLowerCase()}">${tx.type}</span></td>
                <td style="text-align:right; font-weight:700; color:${tx.type === 'INCOME' ? 'var(--income)' : 'var(--text-main)'}">
                  ${tx.type === 'INCOME' ? '+' : '-'}${formatCurrency(tx.amount, currencyCode)}
                </td>
                <td style="text-align:center;">
                  <button class="btn btn-secondary btn-edit-tx" data-id="${tx.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">Edit</button>
                  <button class="btn btn-danger btn-delete-tx" data-id="${tx.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem;">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Mobile Transaction Cards View (< 769px) -->
      <div class="tx-cards-container tx-page-mobile-cards">
        ${data.transactions.map(tx => {
          const iconConfig = getCategoryIconConfig(tx.category_name, tx.type, tx.category_color);
          const formattedDate = formatDateDisplay(tx.transaction_date);
          const paymentLabel = tx.payment_method === 'BANK_TRANSFER' ? 'Bank Transfer' : tx.payment_method;
          const isIncome = tx.type === 'INCOME';

          return `
            <div class="tx-card-item">
              <div class="tx-card-left">
                <div class="tx-category-icon" style="background: ${iconConfig.bg};">
                  ${iconConfig.icon}
                </div>
                <div class="tx-details">
                  <span class="tx-cat-name">${escapeHTML(tx.category_name || 'Uncategorized')}</span>
                  <span class="tx-sub-info">${formattedDate} • ${paymentLabel}</span>
                  <span class="tx-type-pill ${isIncome ? 'income' : 'expense'}">${isIncome ? 'Income' : 'Expense'}</span>
                </div>
              </div>

              <div class="tx-card-right">
                <span class="tx-amount ${isIncome ? 'income' : 'expense'}">
                  ${isIncome ? '+' : '-'}${formatCurrency(tx.amount, currencyCode)}
                </span>
                <button type="button" class="tx-more-btn btn-toggle-tx-menu" data-id="${tx.id}" title="Transaction options" aria-label="Transaction options">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="5" r="1.5"/>
                    <circle cx="12" cy="19" r="1.5"/>
                  </svg>
                </button>
              </div>

              <!-- Action Menu Dropdown -->
              <div class="tx-action-dropdown" id="tx-menu-${tx.id}">
                <button type="button" class="tx-action-item btn-edit-tx" data-id="${tx.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <span>Edit</span>
                </button>
                <button type="button" class="tx-action-item delete btn-delete-tx" data-id="${tx.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Render pagination with improved state (Issue #3 Fix)
    const meta = data.pagination;
    const totalPages = meta.total_pages || 1;
    const currentPageNum = meta.page || 1;

    if (totalPages <= 1) {
      paginationContainer.innerHTML = `
        <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600; text-align:center; width:100%;">
          Page 1 of 1 (${meta.total} total ${meta.total === 1 ? 'entry' : 'entries'})
        </div>
      `;
    } else {
      const isPrevDisabled = currentPageNum <= 1;
      const isNextDisabled = currentPageNum >= totalPages;

      paginationContainer.innerHTML = `
        <div style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">
          Page ${currentPageNum} of ${totalPages} (${meta.total} total entries)
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-secondary" id="prev-page" style="padding:0.4rem 0.85rem; font-size:0.82rem; ${isPrevDisabled ? 'opacity:0.45; pointer-events:none;' : ''}" ${isPrevDisabled ? 'disabled' : ''}>Previous</button>
          <button class="btn btn-secondary" id="next-page" style="padding:0.4rem 0.85rem; font-size:0.82rem; ${isNextDisabled ? 'opacity:0.45; pointer-events:none;' : ''}" ${isNextDisabled ? 'disabled' : ''}>Next</button>
        </div>
      `;

      if (!isPrevDisabled) {
        document.getElementById('prev-page')?.addEventListener('click', () => loadTransactions(currentPageNum - 1, currencyCode));
      }
      if (!isNextDisabled) {
        document.getElementById('next-page')?.addEventListener('click', () => loadTransactions(currentPageNum + 1, currencyCode));
      }
    }

    // Toggle Action Dropdown Menus for Mobile Cards
    tableContainer.querySelectorAll('.btn-toggle-tx-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const txId = btn.dataset.id;
        const menu = document.getElementById(`tx-menu-${txId}`);
        // Close other open menus
        document.querySelectorAll('.tx-action-dropdown').forEach(m => {
          if (m !== menu) m.classList.remove('active');
        });
        if (menu) menu.classList.toggle('active');
      });
    });

    // Close action dropdowns when clicking outside
    document.addEventListener('click', () => {
      document.querySelectorAll('.tx-action-dropdown').forEach(m => m.classList.remove('active'));
    });

    // Attach Edit Action Listener to both desktop & mobile views
    tableContainer.querySelectorAll('.btn-edit-tx').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.tx-action-dropdown').forEach(m => m.classList.remove('active'));
        const tx = data.transactions.find(t => t.id === btn.dataset.id);
        if (tx) {
          document.getElementById('tx-type').value = tx.type;
          updateCategorySelectForType(tx.type);
          document.getElementById('modal-title').textContent = 'Edit Transaction';
          editingTxId = tx.id;
          document.getElementById('tx-amount').value = tx.amount;
          document.getElementById('tx-category').value = tx.category_id;
          document.getElementById('tx-date').value = tx.transaction_date;
          document.getElementById('tx-payment').value = tx.payment_method;
          document.getElementById('tx-note').value = tx.note || '';
          document.getElementById('tx-modal').classList.add('active');
        }
      });
    });

    // Attach Delete Action Listener to both desktop & mobile views
    tableContainer.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        document.querySelectorAll('.tx-action-dropdown').forEach(m => m.classList.remove('active'));
        if (confirm('Are you sure you want to delete this transaction record?')) {
          try {
            await APIClient.deleteTransaction(btn.dataset.id);
            if (window.showToast) window.showToast('Transaction deleted', 'info');
            await loadTransactions(page, currencyCode);
          } catch (err) {
            if (window.showToast) window.showToast(err.message || 'Failed to delete transaction.', 'error');
            else alert(err.message || 'Failed to delete transaction.');
          }
        }
      });
    });

  } catch (err) {
    console.error(err);
    tableContainer.innerHTML = `<div class="empty-state" style="padding:2rem;">Failed to load transactions. Please try again.</div>`;
  }
}

function getCategoryIconConfig(categoryName, type, customColor) {
  const name = (categoryName || '').toLowerCase();

  if (name.includes('dining') || name.includes('food')) {
    return {
      bg: 'linear-gradient(135deg, #ec4899, #db2777)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v16"/><path d="M9 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M6 2v16"/></svg>`
    };
  }
  if (name.includes('grocer') || name.includes('daily')) {
    return {
      bg: 'linear-gradient(135deg, #f97316, #ea580c)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
    };
  }
  if (name.includes('health') || name.includes('medical')) {
    return {
      bg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
    };
  }
  if (name.includes('housing') || name.includes('rent')) {
    return {
      bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
    };
  }
  if (name.includes('utilit') || name.includes('bill')) {
    return {
      bg: 'linear-gradient(135deg, #a855f7, #9333ea)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
    };
  }
  if (name.includes('shopping') || name.includes('apparel')) {
    return {
      bg: 'linear-gradient(135deg, #eab308, #ca8a04)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
    };
  }
  if (name.includes('transport') || name.includes('fuel')) {
    return {
      bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
    };
  }
  if (name.includes('freelance') || name.includes('consulting') || name.includes('salary')) {
    return {
      bg: 'linear-gradient(135deg, #10b981, #059669)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
    };
  }
  if (name.includes('invest') || name.includes('dividend')) {
    return {
      bg: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
    };
  }

  const color = customColor || (type === 'EXPENSE' ? '#6366f1' : '#10b981');
  return {
    bg: color,
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`
  };
}

function formatDateDisplay(isoDateStr) {
  if (!isoDateStr) return '';
  try {
    const parts = isoDateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[monthIdx] || ''} ${year}`;
    }
  } catch (e) {}
  return isoDateStr;
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
