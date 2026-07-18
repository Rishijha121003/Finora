import APIClient from '../api.js';

export async function renderCategoriesView(container) {
  container.innerHTML = `
    <div class="section-toolbar">
      <div>
        <h1 style="font-size:1.6rem; font-weight:800;">Transaction Categories</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">Manage income and expense categories for better spending organization</p>
      </div>

      <button class="btn btn-primary" id="btn-add-category" style="width:100%; max-width:240px;">
        + Create Custom Category
      </button>
    </div>

    <!-- Categories List Responsive Grid -->
    <div class="categories-grid">
      <!-- Expense Categories Card -->
      <div class="card">
        <div class="card-title" style="color:var(--expense);">
          <span>Expense Categories</span>
        </div>
        <div id="expense-categories-list" class="category-breakdown-list">
          <div class="empty-state">Loading expense categories...</div>
        </div>
      </div>

      <!-- Income Categories Card -->
      <div class="card">
        <div class="card-title" style="color:var(--income);">
          <span>Income Categories</span>
        </div>
        <div id="income-categories-list" class="category-breakdown-list">
          <div class="empty-state">Loading income categories...</div>
        </div>
      </div>
    </div>

    <!-- Modal for Creating Custom Category -->
    <div class="modal-overlay" id="cat-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Create Custom Category</h3>
          <button class="modal-close" id="cat-modal-close-btn">&times;</button>
        </div>
        <form id="cat-form">
          <div id="cat-modal-error" style="display:none; padding:0.6rem; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#ef4444; border-radius:6px; margin-bottom:1rem; font-size:0.85rem;"></div>

          <div class="form-group">
            <label>Category Type</label>
            <select id="cat-type" class="form-control" required>
              <option value="EXPENSE">Expense Category</option>
              <option value="INCOME">Income Category</option>
            </select>
          </div>

          <div class="form-group">
            <label>Category Name</label>
            <input type="text" id="cat-name" class="form-control" placeholder="e.g. Subscriptions, Side Business..." required />
          </div>

          <div class="form-group">
            <label>Color Accent</label>
            <input type="color" id="cat-color" class="form-control" value="#3b82f6" style="height:45px; padding:0.2rem; cursor:pointer;" />
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
            <button type="button" class="btn btn-secondary" id="cat-modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Attach modal handlers
  const modal = document.getElementById('cat-modal');
  document.getElementById('btn-add-category').addEventListener('click', () => modal.classList.add('active'));
  document.getElementById('cat-modal-close-btn').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('cat-modal-cancel-btn').addEventListener('click', () => modal.classList.remove('active'));

  // Form submit handler
  document.getElementById('cat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('cat-modal-error');
    errorDiv.style.display = 'none';

    const payload = {
      name: document.getElementById('cat-name').value,
      type: document.getElementById('cat-type').value,
      color: document.getElementById('cat-color').value,
      icon: 'tag'
    };

    try {
      await APIClient.createCategory(payload);
      modal.classList.remove('active');
      document.getElementById('cat-form').reset();
      await loadCategoryLists();
    } catch (err) {
      errorDiv.textContent = err.message || 'Failed to create category.';
      errorDiv.style.display = 'block';
    }
  });

  await loadCategoryLists();
}

async function loadCategoryLists() {
  try {
    const categories = await APIClient.getCategories();
    
    const expenseList = document.getElementById('expense-categories-list');
    const incomeList = document.getElementById('income-categories-list');

    const expenseCats = categories.filter(c => c.type === 'EXPENSE');
    const incomeCats = categories.filter(c => c.type === 'INCOME');

    const renderList = (cats) => {
      if (cats.length === 0) return `<div class="empty-state">No categories found.</div>`;
      return cats.map(c => `
        <div class="category-row-item">
          <div style="display:flex; align-items:center; gap:0.75rem; min-width:0; flex:1;">
            <span style="width:12px; height:12px; border-radius:50%; background:${c.color || '#3b82f6'}; flex-shrink:0;"></span>
            <span style="font-weight:600; font-size:0.92rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(c.name)}</span>
            ${c.is_system ? `<span style="font-size:0.72rem; color:var(--text-sub); background:rgba(255,255,255,0.06); padding:0.1rem 0.4rem; border-radius:4px; flex-shrink:0;">System</span>` : ''}
          </div>
          ${!c.is_system ? `<button class="btn btn-danger btn-delete-cat" data-id="${c.id}" style="padding:0.2rem 0.5rem; font-size:0.78rem; flex-shrink:0;">Delete</button>` : ''}
        </div>
      `).join('');
    };

    expenseList.innerHTML = renderList(expenseCats);
    incomeList.innerHTML = renderList(incomeCats);

    // Attach delete handlers for custom categories
    document.querySelectorAll('.btn-delete-cat').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Delete this custom category? Associated transactions will be moved to Uncategorized Expense.')) {
          try {
            await APIClient.deleteCategory(btn.dataset.id);
            await loadCategoryLists();
          } catch (err) {
            alert(err.message || 'Failed to delete category.');
          }
        }
      });
    });

  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
