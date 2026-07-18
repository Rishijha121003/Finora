import APIClient from '../api.js';
import { formatCurrency } from '../currency.js';
import { authManager } from '../auth.js';

let currentCategories = [];
let editingTxId = null;

export async function renderTransactionsView(container, queryParams = {}) {
  const currencyCode = authManager.getUserCurrency();

  container.innerHTML = `
    <div class="section-toolbar">
      <div>
        <h1 style="font-size:1.6rem; font-weight:800;">Transactions</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">View, search, filter, and manage income & expense records</p>
      </div>

      <button class="btn btn-primary" id="btn-add-tx" style="width:100%; max-width:220px;">
        + Add New Transaction
      </button>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="card" style="margin-bottom:1.5rem; padding:1.2rem;">
      <div class="filter-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; align-items:center;">
        <div>
          <input type="text" id="search-input" class="form-control" placeholder="Search notes or category..." />
        </div>
        <div>
          <select id="filter-type" class="form-control">
            <option value="">All Types (Income & Expense)</option>
            <option value="INCOME">Income Only</option>
            <option value="EXPENSE">Expense Only</option>
          </select>
        </div>
        <div>
          <select id="filter-category" class="form-control">
            <option value="">All Categories</option>
          </select>
        </div>
        <div>
          <select id="filter-payment" class="form-control">
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div class="date-range-container" style="display:flex; gap:0.5rem;">
          <input type="date" id="filter-start-date" class="form-control" title="Start Date" />
          <input type="date" id="filter-end-date" class="form-control" title="End Date" />
        </div>
      </div>
    </div>

    <!-- Transaction Table / Mobile Cards Container -->
    <div class="card">
      <div id="tx-table-container">
        <div class="empty-state">Loading transactions...</div>
      </div>
      <div id="pagination-container" style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--glass-border); flex-wrap:wrap; gap:1rem;"></div>
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
  document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];

  // Event Listeners for Filters
  let currentPage = 1;
  const triggerReload = () => {
    currentPage = 1;
    loadTransactions(currentPage, currencyCode);
  };

  document.getElementById('search-input').addEventListener('input', debounce(triggerReload, 300));
  document.getElementById('filter-type').addEventListener('change', triggerReload);
  document.getElementById('filter-category').addEventListener('change', triggerReload);
  document.getElementById('filter-payment').addEventListener('change', triggerReload);
  document.getElementById('filter-start-date').addEventListener('change', triggerReload);
  document.getElementById('filter-end-date').addEventListener('change', triggerReload);

  // Modal open/close handlers
  const modal = document.getElementById('tx-modal');
  const openModal = (tx = null) => {
    editingTxId = tx ? tx.id : null;
    document.getElementById('modal-title').textContent = tx ? 'Edit Transaction' : 'Add New Transaction';
    document.getElementById('modal-error').style.display = 'none';

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

  document.getElementById('btn-add-tx').addEventListener('click', () => openModal());
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

  // Filter category dropdown on type change inside modal
  document.getElementById('tx-type').addEventListener('change', (e) => {
    updateCategorySelectForType(e.target.value);
  });

  // Modal Form Submit
  document.getElementById('tx-form').addEventListener('submit', async (e) => {
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
      } else {
        await APIClient.createTransaction(payload);
      }
      closeModal();
      await loadTransactions(currentPage, currencyCode);
    } catch (err) {
      errorDiv.textContent = err.message || 'Failed to save transaction.';
      errorDiv.style.display = 'block';
    }
  });

  // Check if query params triggered quick add modal
  if (queryParams.action === 'new') {
    openModal();
  }

  await loadTransactions(currentPage, currencyCode);
}

function populateCategoryDropdowns(categories) {
  const filterCatSelect = document.getElementById('filter-category');
  filterCatSelect.innerHTML = `<option value="">All Categories</option>` + 
    categories.map(c => `<option value="${c.id}">${escapeHTML(c.name)} (${c.type})</option>`).join('');

  updateCategorySelectForType('EXPENSE');
}

function updateCategorySelectForType(type) {
  const txCatSelect = document.getElementById('tx-category');
  const filtered = currentCategories.filter(c => c.type === type);
  txCatSelect.innerHTML = filtered.map(c => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join('');
}

async function loadTransactions(page, currencyCode) {
  const tableContainer = document.getElementById('tx-table-container');
  const paginationContainer = document.getElementById('pagination-container');

  const params = {
    page,
    limit: 15,
    search: document.getElementById('search-input').value,
    type: document.getElementById('filter-type').value,
    category_id: document.getElementById('filter-category').value,
    payment_method: document.getElementById('filter-payment').value,
    start_date: document.getElementById('filter-start-date').value,
    end_date: document.getElementById('filter-end-date').value
  };

  try {
    const data = await APIClient.getTransactions(params);

    if (!data.transactions || data.transactions.length === 0) {
      tableContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div>No transactions found matching your filters.</div>`;
      paginationContainer.innerHTML = '';
      return;
    }

    // Render Desktop Table View & Mobile Cards View (ISSUE-UI-04 Fix)
    tableContainer.innerHTML = `
      <!-- Desktop/Tablet View -->
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
                <td><strong>${tx.transaction_date}</strong></td>
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

      <!-- Compact Mobile Cards View (< 640px) -->
      <div class="tx-mobile-cards">
        ${data.transactions.map(tx => `
          <div class="tx-mobile-card">
            <div class="tx-mobile-header">
              <span style="font-size:0.82rem; color:var(--text-muted); font-weight:600;">${tx.transaction_date}</span>
              <span class="badge badge-${tx.type.toLowerCase()}">${tx.type}</span>
            </div>

            <div class="tx-mobile-body">
              <div>
                <div style="font-weight:700; font-size:1rem; display:flex; align-items:center; gap:0.4rem;">
                  <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${tx.category_color || '#64748b'};"></span>
                  ${escapeHTML(tx.category_name || 'Uncategorized')}
                </div>
                ${tx.note ? `<div style="font-size:0.82rem; color:var(--text-muted); margin-top:0.2rem;">${escapeHTML(tx.note)}</div>` : ''}
              </div>
              <div style="text-align:right;">
                <div style="font-size:1.1rem; font-weight:800; color:${tx.type === 'INCOME' ? 'var(--income)' : 'var(--text-main)'};">
                  ${tx.type === 'INCOME' ? '+' : '-'}${formatCurrency(tx.amount, currencyCode)}
                </div>
                <div style="margin-top:0.2rem;"><span class="badge badge-${tx.payment_method.toLowerCase()}">${tx.payment_method}</span></div>
              </div>
            </div>

            <div class="tx-mobile-footer">
              <span style="font-size:0.78rem; color:var(--text-sub);">ID: ${tx.id.substring(0, 8)}</span>
              <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-secondary btn-edit-tx" data-id="${tx.id}" style="padding:0.3rem 0.6rem; font-size:0.78rem;">Edit</button>
                <button class="btn btn-danger btn-delete-tx" data-id="${tx.id}" style="padding:0.3rem 0.6rem; font-size:0.78rem;">Delete</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Render pagination
    const meta = data.pagination;
    paginationContainer.innerHTML = `
      <div style="font-size:0.88rem; color:var(--text-muted);">
        Page ${meta.page} of ${meta.total_pages} (${meta.total} total entries)
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-secondary" id="prev-page" ${meta.page <= 1 ? 'disabled' : ''}>Previous</button>
        <button class="btn btn-secondary" id="next-page" ${meta.page >= meta.total_pages ? 'disabled' : ''}>Next</button>
      </div>
    `;

    document.getElementById('prev-page')?.addEventListener('click', () => {
      if (meta.page > 1) loadTransactions(meta.page - 1, currencyCode);
    });
    document.getElementById('next-page')?.addEventListener('click', () => {
      if (meta.page < meta.total_pages) loadTransactions(meta.page + 1, currencyCode);
    });

    // Attach Edit Action Listener to both desktop & mobile views
    tableContainer.querySelectorAll('.btn-edit-tx').forEach(btn => {
      btn.addEventListener('click', () => {
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
      btn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this transaction record?')) {
          try {
            await APIClient.deleteTransaction(btn.dataset.id);
            await loadTransactions(page, currencyCode);
          } catch (err) {
            alert(err.message || 'Failed to delete transaction.');
          }
        }
      });
    });

  } catch (err) {
    tableContainer.innerHTML = `<div class="empty-state">Failed to load transactions. Please try again.</div>`;
  }
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
