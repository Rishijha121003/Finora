import APIClient from '../api.js';
import { authManager } from '../auth.js';

export async function openTransactionModal({ transaction = null, onSuccess = null } = {}) {
  const currencyCode = authManager.getUserCurrency();
  let modalEl = document.getElementById('global-tx-modal');
  if (modalEl) modalEl.remove();

  let categories = [];
  try {
    categories = await APIClient.getCategories();
  } catch (err) {
    console.error('Failed to fetch categories for transaction modal:', err);
  }

  const isMobile = window.innerWidth <= 640;
  const isEdit = !!transaction;
  const editingTxId = transaction ? transaction.id : null;

  modalEl = document.createElement('div');
  modalEl.id = 'global-tx-modal';
  modalEl.className = 'modal-overlay active';
  modalEl.innerHTML = `
    <div class="modal ${isMobile ? 'modal-dialog-bottom-sheet' : ''}" style="${isMobile ? '' : 'max-width:520px; width:100%;'}">
      ${isMobile ? '<div class="bottom-sheet-handle"></div>' : ''}
      <div class="modal-header">
        <h3 class="modal-title">${isEdit ? 'Edit Transaction' : 'Add New Transaction'}</h3>
        <button type="button" class="btn-close-modal" id="gtx-close-btn" style="background:none; border:none; color:var(--text-muted); font-size:1.5rem; cursor:pointer;">&times;</button>
      </div>
      <form id="gtx-form" style="padding:0.5rem 0 0 0;">
        <div id="gtx-error" style="display:none; padding:0.6rem; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#ef4444; border-radius:6px; margin-bottom:1rem; font-size:0.85rem;"></div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div class="form-group">
            <label class="form-label" style="font-size:0.82rem; font-weight:600;">Type</label>
            <select id="gtx-type" class="form-control" required>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size:0.82rem; font-weight:600;">Amount (${currencyCode})</label>
            <input type="number" step="0.01" min="0.01" id="gtx-amount" class="form-control" placeholder="0.00" value="${transaction ? transaction.amount : ''}" required />
          </div>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label" style="font-size:0.82rem; font-weight:600;">Category</label>
          <select id="gtx-category" class="form-control" required></select>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div class="form-group">
            <label class="form-label" style="font-size:0.82rem; font-weight:600;">Date</label>
            <input type="date" id="gtx-date" class="form-control" value="${transaction ? transaction.transaction_date : new Date().toISOString().split('T')[0]}" required />
          </div>
          <div class="form-group">
            <label class="form-label" style="font-size:0.82rem; font-weight:600;">Payment Method</label>
            <select id="gtx-payment" class="form-control" required>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label" style="font-size:0.82rem; font-weight:600;">Note / Description (Optional)</label>
          <textarea id="gtx-note" class="form-control" rows="2" placeholder="Dinner with friends, Salary credit...">${transaction ? (transaction.note || '') : ''}</textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
          <button type="button" class="btn btn-secondary" id="gtx-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-primary" id="gtx-submit-btn">Save Transaction</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalEl);

  const typeSelect = document.getElementById('gtx-type');
  const catSelect = document.getElementById('gtx-category');
  const paymentSelect = document.getElementById('gtx-payment');

  if (transaction) {
    typeSelect.value = transaction.type;
    paymentSelect.value = transaction.payment_method || 'UPI';
  } else {
    typeSelect.value = 'EXPENSE';
    paymentSelect.value = 'UPI';
  }

  const updateCategoryOptions = (selectedType) => {
    const filtered = categories.filter(c => c.type === selectedType);
    catSelect.innerHTML = filtered.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    if (transaction && transaction.type === selectedType) {
      catSelect.value = transaction.category_id;
    }
  };

  updateCategoryOptions(typeSelect.value);

  typeSelect.addEventListener('change', (e) => {
    updateCategoryOptions(e.target.value);
  });

  const closeFn = () => modalEl.remove();
  modalEl.onclick = (e) => { if (e.target === modalEl) closeFn(); };
  document.getElementById('gtx-close-btn').onclick = closeFn;
  document.getElementById('gtx-cancel-btn').onclick = closeFn;

  const form = document.getElementById('gtx-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('gtx-error');
    errorDiv.style.display = 'none';

    const payload = {
      type: document.getElementById('gtx-type').value,
      amount: parseFloat(document.getElementById('gtx-amount').value),
      category_id: document.getElementById('gtx-category').value,
      transaction_date: document.getElementById('gtx-date').value,
      payment_method: document.getElementById('gtx-payment').value,
      note: document.getElementById('gtx-note').value
    };

    try {
      if (editingTxId) {
        await APIClient.updateTransaction(editingTxId, payload);
        if (window.showToast) window.showToast('Transaction updated successfully!', 'success');
      } else {
        await APIClient.createTransaction(payload);
        if (window.showToast) window.showToast('Transaction added successfully!', 'success');
      }
      closeFn();
      if (onSuccess) await onSuccess();
    } catch (err) {
      errorDiv.textContent = err.message || 'Failed to save transaction.';
      errorDiv.style.display = 'block';
      if (window.showToast) window.showToast(err.message || 'Failed to save transaction.', 'error');
    }
  };
}
