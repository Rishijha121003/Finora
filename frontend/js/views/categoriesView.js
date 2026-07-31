import APIClient from '../api.js';

let editingCategoryId = null;

export async function renderCategoriesView(container) {
  editingCategoryId = null;

  container.innerHTML = `
    <div class="cat-page-container">
      <!-- Header Section -->
      <div class="cat-header-section">
        <h1 class="cat-title">Categories</h1>
        <p class="cat-subtitle">Organize your income and expenses</p>
      </div>

      <!-- Add Category Button -->
      <button class="btn-add-category-main" id="btn-add-category">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Add Category</span>
      </button>

      <!-- Segmented Tab Switcher -->
      <div class="category-tab-switcher">
        <button type="button" class="cat-tab-btn active-expense" id="tab-cat-expense">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="7" x2="17" y2="17"/>
            <polyline points="17 7 17 17 7 17"/>
          </svg>
          <span>Expenses</span>
          <span class="cat-tab-badge" id="expense-tab-badge">0</span>
        </button>

        <button type="button" class="cat-tab-btn" id="tab-cat-income">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"/>
            <polyline points="7 7 17 7 17 17"/>
          </svg>
          <span>Income</span>
          <span class="cat-tab-badge" id="income-tab-badge">0</span>
        </button>
      </div>

      <!-- Categories Content Container -->
      <div class="categories-content-wrapper">
        <!-- Expense Categories Card -->
        <div class="cat-card-wrapper" id="expense-card-section">
          <div class="cat-card-header">
            <div class="cat-card-title-left expense">
              <span>Expense Categories</span>
            </div>
            <span class="cat-count-badge" id="expense-count-badge">0 Categories</span>
          </div>
          <div id="expense-categories-list" class="cat-list-container">
            <div class="empty-state" style="padding:1rem;">Loading expense categories...</div>
          </div>
        </div>

        <!-- Income Categories Card -->
        <div class="cat-card-wrapper" id="income-card-section" style="display:none;">
          <div class="cat-card-header">
            <div class="cat-card-title-left income">
              <span>Income Categories</span>
            </div>
            <span class="cat-count-badge" id="income-count-badge">0 Categories</span>
          </div>
          <div id="income-categories-list" class="cat-list-container">
            <div class="empty-state" style="padding:1rem;">Loading income categories...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Creating/Editing Custom Category -->
    <div class="modal-overlay" id="cat-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="cat-modal-title">Create Custom Category</h3>
          <button class="modal-close" id="cat-modal-close-btn">&times;</button>
        </div>
        <form id="cat-form">
          <div id="cat-modal-error" style="display:none; padding:0.6rem; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.3); color:#F43F5E; border-radius:6px; margin-bottom:1rem; font-size:0.85rem;"></div>

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
            <button type="submit" id="cat-modal-submit-btn" class="btn btn-primary">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Attach Modal Handlers
  const modal = document.getElementById('cat-modal');
  const openAddCategoryModal = () => {
    editingCategoryId = null;
    document.getElementById('cat-modal-title').textContent = 'Create Custom Category';
    document.getElementById('cat-modal-submit-btn').textContent = 'Save Category';
    document.getElementById('cat-form').reset();
    document.getElementById('cat-color').value = '#3b82f6';
    document.getElementById('cat-modal-error').style.display = 'none';

    const dialog = modal.querySelector('.modal-dialog') || modal.querySelector('.modal');
    if (dialog) {
      if (window.innerWidth <= 640) {
        dialog.classList.add('modal-dialog-bottom-sheet');
      } else {
        dialog.classList.remove('modal-dialog-bottom-sheet');
      }
    }
    modal.classList.add('active');
  };

  document.getElementById('btn-add-category')?.addEventListener('click', openAddCategoryModal);
  document.getElementById('cat-modal-close-btn')?.addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('cat-modal-cancel-btn')?.addEventListener('click', () => modal.classList.remove('active'));

  // Single Source of Truth for Active Category Tab State
  let activeTabType = 'EXPENSE';

  const updateTabVisibility = (type) => {
    activeTabType = type;
    const tabExpense = document.getElementById('tab-cat-expense');
    const tabIncome = document.getElementById('tab-cat-income');
    const expenseSection = document.getElementById('expense-card-section');
    const incomeSection = document.getElementById('income-card-section');

    if (type === 'EXPENSE') {
      if (tabExpense) tabExpense.className = 'cat-tab-btn active-expense';
      if (tabIncome) tabIncome.className = 'cat-tab-btn';
      if (expenseSection) expenseSection.style.display = 'block';
      if (incomeSection) incomeSection.style.display = 'none';
    } else {
      if (tabExpense) tabExpense.className = 'cat-tab-btn';
      if (tabIncome) tabIncome.className = 'cat-tab-btn active-income';
      if (expenseSection) expenseSection.style.display = 'none';
      if (incomeSection) incomeSection.style.display = 'block';
    }
  };

  // Attach Tab Switcher Event Listeners
  document.getElementById('tab-cat-expense')?.addEventListener('click', () => updateTabVisibility('EXPENSE'));
  document.getElementById('tab-cat-income')?.addEventListener('click', () => updateTabVisibility('INCOME'));

  // Enforce Initial Render State Immediately
  updateTabVisibility(activeTabType);

  // Form submit handler (Create or Update)
  document.getElementById('cat-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('cat-modal-error');
    const submitBtn = document.getElementById('cat-modal-submit-btn');
    errorDiv.style.display = 'none';

    const payload = {
      name: document.getElementById('cat-name').value.trim(),
      type: document.getElementById('cat-type').value,
      color: document.getElementById('cat-color').value,
      icon: 'tag'
    };

    try {
      submitBtn.disabled = true;
      if (editingCategoryId) {
        await APIClient.updateCategory(editingCategoryId, payload);
        if (window.showToast) window.showToast('Category updated successfully!', 'success');
      } else {
        await APIClient.createCategory(payload);
        if (window.showToast) window.showToast('Category created successfully!', 'success');
      }
      modal.classList.remove('active');
      document.getElementById('cat-form').reset();
      editingCategoryId = null;
      await loadCategoryLists();
    } catch (err) {
      errorDiv.textContent = err.message || 'Failed to save category.';
      errorDiv.style.display = 'block';
      if (window.showToast) window.showToast(err.message || 'Failed to save category.', 'error');
    } finally {
      submitBtn.disabled = false;
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

    // Update count badges
    if (document.getElementById('expense-tab-badge')) document.getElementById('expense-tab-badge').textContent = expenseCats.length;
    if (document.getElementById('income-tab-badge')) document.getElementById('income-tab-badge').textContent = incomeCats.length;
    if (document.getElementById('expense-count-badge')) document.getElementById('expense-count-badge').textContent = `${expenseCats.length} Categories`;
    if (document.getElementById('income-count-badge')) document.getElementById('income-count-badge').textContent = `${incomeCats.length} Categories`;

    const renderList = (cats) => {
      if (cats.length === 0) return `<div class="empty-state" style="padding:1.25rem;">No categories found.</div>`;
      return cats.map(c => {
        const iconConfig = getCategoryIconConfig(c.name, c.type, c.color);
        return `
          <div class="category-mobile-row">
            <div class="category-mobile-left">
              <div class="category-mobile-icon" style="background: ${iconConfig.bg};">
                ${iconConfig.icon}
              </div>
              <span class="category-mobile-name">${escapeHTML(c.name)}</span>
            </div>
            <div class="category-mobile-right">
              ${c.is_system 
                ? `<span class="category-badge-pill">System</span>` 
                : `<div style="display:flex; align-items:center; gap:0.3rem;">
                    <button class="btn-cat-more btn-edit-cat" data-id="${c.id}" data-name="${escapeHTML(c.name)}" data-type="${c.type}" data-color="${c.color || '#3b82f6'}" title="Edit Category" aria-label="Edit Category">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button class="btn-cat-more btn-delete-cat" data-id="${c.id}" data-name="${escapeHTML(c.name)}" title="Delete Custom Category" aria-label="Delete Custom Category">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                   </div>`
              }
            </div>
          </div>
        `;
      }).join('');
    };

    if (expenseList) expenseList.innerHTML = renderList(expenseCats);
    if (incomeList) incomeList.innerHTML = renderList(incomeCats);

    // Attach edit handlers for custom categories
    document.querySelectorAll('.btn-edit-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        editingCategoryId = btn.dataset.id;
        document.getElementById('cat-modal-title').textContent = 'Edit Custom Category';
        document.getElementById('cat-modal-submit-btn').textContent = 'Update Category';
        document.getElementById('cat-name').value = btn.dataset.name;
        document.getElementById('cat-type').value = btn.dataset.type;
        document.getElementById('cat-color').value = btn.dataset.color || '#3b82f6';
        document.getElementById('cat-modal-error').style.display = 'none';

        const modal = document.getElementById('cat-modal');
        const dialog = modal.querySelector('.modal-dialog') || modal.querySelector('.modal');
        if (dialog) {
          if (window.innerWidth <= 640) dialog.classList.add('modal-dialog-bottom-sheet');
          else dialog.classList.remove('modal-dialog-bottom-sheet');
        }
        modal.classList.add('active');
      });
    });

    // Attach delete handlers for custom categories
    document.querySelectorAll('.btn-delete-cat').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Delete this custom category? Associated transactions will be moved to Uncategorized Expense.')) {
          try {
            await APIClient.deleteCategory(btn.dataset.id);
            if (window.showToast) window.showToast('Category deleted', 'info');
            await loadCategoryLists();
          } catch (err) {
            if (window.showToast) window.showToast(err.message || 'Failed to delete category.', 'error');
            else alert(err.message || 'Failed to delete category.');
          }
        }
      });
    });

  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

function getCategoryIconConfig(categoryName, type, customColor) {
  const name = (categoryName || '').toLowerCase();

  if (name.includes('dining') || name.includes('food')) {
    return {
      bg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2))',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v16"/><path d="M9 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M6 2v16"/></svg>`
    };
  }
  if (name.includes('grocer') || name.includes('daily')) {
    return {
      bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2))',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
    };
  }
  if (name.includes('health') || name.includes('medical')) {
    return {
      bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.2))',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
    };
  }
  if (name.includes('housing') || name.includes('rent')) {
    return {
      bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(220, 38, 38, 0.2))',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
    };
  }
  if (name.includes('utilit') || name.includes('bill')) {
    return {
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
    };
  }
  if (name.includes('freelance') || name.includes('consulting') || name.includes('salary')) {
    return {
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
    };
  }

  const color = customColor || (type === 'EXPENSE' ? '#F43F5E' : '#10b981');
  return {
    bg: `${color}25`,
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`
  };
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
