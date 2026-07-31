import APIClient from '../api.js';
import { authManager } from '../auth.js';
import { formatCurrency } from '../currency.js';

export async function openManageFavoritesModal({ onSuccess = null } = {}) {
  const currencyCode = authManager.getUserCurrency();
  let modalEl = document.getElementById('manage-fav-modal');
  if (modalEl) modalEl.remove();

  const isMobile = window.innerWidth <= 640;

  modalEl = document.createElement('div');
  modalEl.id = 'manage-fav-modal';
  modalEl.className = 'modal-overlay active';
  modalEl.innerHTML = `
    <div class="modal ${isMobile ? 'modal-dialog-bottom-sheet' : ''}" style="${isMobile ? '' : 'max-width:560px; width:100%;'}">
      ${isMobile ? '<div class="bottom-sheet-handle"></div>' : ''}
      <div class="modal-header">
        <h3 class="modal-title">Manage Quick Add Favorites</h3>
        <button type="button" class="btn-close-modal" id="mfav-close-btn" style="background:none; border:none; color:var(--text-muted); font-size:1.5rem; cursor:pointer;">&times;</button>
      </div>
      <div style="padding:0.5rem 0;">
        <div id="mfav-error" style="display:none; padding:0.6rem; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.3); color:#F43F5E; border-radius:6px; margin-bottom:1rem; font-size:0.85rem;"></div>
        
        <!-- List of current favorites -->
        <div id="mfav-list-container" style="margin-bottom:1.25rem;">
          <div style="text-align:center; padding:1rem; color:var(--text-muted);">Loading favorites...</div>
        </div>

        <!-- Add / Edit Form -->
        <div id="mfav-form-box" style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:12px; padding:1rem;">
          <h4 style="margin:0 0 0.75rem 0; font-size:0.95rem; font-weight:700; color:var(--text-main);" id="mfav-form-title">Create Favorite Shortcut</h4>
          <form id="mfav-form">
            <input type="hidden" id="mfav-editing-id" value="" />
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; margin-bottom:0.75rem;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.8rem; font-weight:600;">Shortcut Label</label>
                <input type="text" id="mfav-name" class="form-control" placeholder="e.g. Morning Chai, Daily Metro" required />
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.8rem; font-weight:600;">Amount (${currencyCode})</label>
                <input type="number" step="0.01" min="0.01" id="mfav-amount" class="form-control" placeholder="50.00" required />
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; margin-bottom:0.75rem;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.8rem; font-weight:600;">Type</label>
                <select id="mfav-type" class="form-control" required>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.8rem; font-weight:600;">Category</label>
                <select id="mfav-category" class="form-control" required></select>
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.8rem; font-weight:600;">Payment Method</label>
                <select id="mfav-payment" class="form-control" required>
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.8rem; font-weight:600;">Note (Optional)</label>
                <input type="text" id="mfav-note" class="form-control" placeholder="Default note..." />
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
              <button type="button" class="btn btn-secondary" id="mfav-form-cancel-btn" style="display:none;">Cancel Edit</button>
              <button type="submit" class="btn btn-primary" id="mfav-submit-btn">Save Favorite</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  const closeFn = () => modalEl.remove();
  modalEl.onclick = (e) => { if (e.target === modalEl) closeFn(); };
  document.getElementById('mfav-close-btn').onclick = closeFn;

  let categories = [];
  try {
    categories = await APIClient.getCategories();
  } catch (e) {}

  const typeSelect = document.getElementById('mfav-type');
  const catSelect = document.getElementById('mfav-category');

  const populateCategories = (type) => {
    const filtered = categories.filter(c => c.type === type);
    catSelect.innerHTML = filtered.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  };

  typeSelect.addEventListener('change', (e) => populateCategories(e.target.value));
  populateCategories('EXPENSE');

  const loadFavoritesList = async () => {
    const listContainer = document.getElementById('mfav-list-container');
    try {
      const favs = await APIClient.getFavorites();
      if (favs.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding:1rem; font-size:0.85rem; color:var(--text-muted);">No favorites saved yet. Add up to 6 shortcuts below!</div>`;
        return;
      }
      listContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${favs.map(f => `
            <div style="display:flex; align-items:center; justify-space-between; padding:0.6rem 0.8rem; background:rgba(255,255,255,0.04); border:1px solid var(--glass-border); border-radius:10px;">
              <div style="flex:1; display:flex; align-items:center; gap:0.6rem;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${f.category_color || '#3b82f6'};"></span>
                <div>
                  <div style="font-weight:600; font-size:0.9rem; color:var(--text-main);">${escapeHTML(f.name)}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${f.type === 'INCOME' ? '+' : '-'} ${formatCurrency(f.amount, currencyCode)} • ${escapeHTML(f.category_name)} • ${f.payment_method}</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:0.4rem;">
                <button type="button" class="btn-edit-fav" data-fav='${JSON.stringify(f).replace(/'/g, "&apos;")}' style="background:none; border:none; color:var(--primary); cursor:pointer; padding:0.2rem 0.4rem;" title="Edit Favorite">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button type="button" class="btn-del-fav" data-id="${f.id}" style="background:none; border:none; color:#F43F5E; cursor:pointer; padding:0.2rem 0.4rem;" title="Delete Favorite">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Attach handlers
      listContainer.querySelectorAll('.btn-del-fav').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete this favorite shortcut?')) {
            try {
              await APIClient.deleteFavorite(btn.dataset.id);
              if (window.showToast) window.showToast('Favorite shortcut deleted', 'info');
              await loadFavoritesList();
              if (onSuccess) await onSuccess();
            } catch (err) {
              if (window.showToast) window.showToast(err.message || 'Failed to delete favorite.', 'error');
            }
          }
        });
      });

      listContainer.querySelectorAll('.btn-edit-fav').forEach(btn => {
        btn.addEventListener('click', () => {
          const f = JSON.parse(btn.dataset.fav);
          document.getElementById('mfav-editing-id').value = f.id;
          document.getElementById('mfav-form-title').textContent = 'Edit Favorite Shortcut';
          document.getElementById('mfav-name').value = f.name;
          document.getElementById('mfav-amount').value = f.amount;
          document.getElementById('mfav-type').value = f.type;
          populateCategories(f.type);
          document.getElementById('mfav-category').value = f.category_id;
          document.getElementById('mfav-payment').value = f.payment_method;
          document.getElementById('mfav-note').value = f.note || '';
          document.getElementById('mfav-form-cancel-btn').style.display = 'inline-block';
        });
      });

    } catch (err) {
      listContainer.innerHTML = `<div style="color:#F43F5E; padding:0.5rem; font-size:0.85rem;">Failed to load favorites.</div>`;
    }
  };

  const resetFavForm = () => {
    document.getElementById('mfav-editing-id').value = '';
    document.getElementById('mfav-form-title').textContent = 'Create Favorite Shortcut';
    document.getElementById('mfav-form').reset();
    document.getElementById('mfav-type').value = 'EXPENSE';
    populateCategories('EXPENSE');
    document.getElementById('mfav-form-cancel-btn').style.display = 'none';
  };

  document.getElementById('mfav-form-cancel-btn').onclick = resetFavForm;

  document.getElementById('mfav-form').onsubmit = async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('mfav-error');
    errorDiv.style.display = 'none';

    const editId = document.getElementById('mfav-editing-id').value;
    const payload = {
      name: document.getElementById('mfav-name').value.trim(),
      amount: parseFloat(document.getElementById('mfav-amount').value),
      type: document.getElementById('mfav-type').value,
      category_id: document.getElementById('mfav-category').value,
      payment_method: document.getElementById('mfav-payment').value,
      note: document.getElementById('mfav-note').value.trim() || null
    };

    try {
      if (editId) {
        await APIClient.updateFavorite(editId, payload);
        if (window.showToast) window.showToast('Favorite shortcut updated!', 'success');
      } else {
        await APIClient.createFavorite(payload);
        if (window.showToast) window.showToast('Favorite shortcut created!', 'success');
      }
      resetFavForm();
      await loadFavoritesList();
      if (onSuccess) await onSuccess();
    } catch (err) {
      errorDiv.textContent = err.message || 'Failed to save favorite.';
      errorDiv.style.display = 'block';
      if (window.showToast) window.showToast(err.message || 'Failed to save favorite.', 'error');
    }
  };

  await loadFavoritesList();
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
