import APIClient from '../api.js';

export async function renderCategoriesView(container) {
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

  // Attach Modal Handlers
  const modal = document.getElementById('cat-modal');
  document.getElementById('btn-add-category')?.addEventListener('click', () => {
    const dialog = modal.querySelector('.modal-dialog') || modal.querySelector('.modal');
    if (dialog) {
      if (window.innerWidth <= 640) {
        dialog.classList.add('modal-dialog-bottom-sheet');
      } else {
        dialog.classList.remove('modal-dialog-bottom-sheet');
      }
    }
    modal.classList.add('active');
  });
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

  // Form submit handler
  document.getElementById('cat-form')?.addEventListener('submit', async (e) => {
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
      if (window.showToast) window.showToast('Category created successfully!', 'success');
      modal.classList.remove('active');
      document.getElementById('cat-form').reset();
      await loadCategoryLists();
    } catch (err) {
      errorDiv.textContent = err.message || 'Failed to create category.';
      errorDiv.style.display = 'block';
      if (window.showToast) window.showToast(err.message || 'Failed to create category.', 'error');
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
                : `<button class="btn-cat-more btn-delete-cat" data-id="${c.id}" data-name="${escapeHTML(c.name)}" title="Delete Custom Category" aria-label="Delete Custom Category">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="1.5"/>
                      <circle cx="12" cy="5" r="1.5"/>
                      <circle cx="12" cy="19" r="1.5"/>
                    </svg>
                  </button>`
              }
            </div>
          </div>
        `;
      }).join('');
    };

    if (expenseList) expenseList.innerHTML = renderList(expenseCats);
    if (incomeList) incomeList.innerHTML = renderList(incomeCats);

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
      bg: 'linear-gradient(135deg, #ec4899, #db2777)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v16"/><path d="M9 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M6 2v16"/></svg>`
    };
  }
  if (name.includes('grocer') || name.includes('daily')) {
    return {
      bg: 'linear-gradient(135deg, #f97316, #ea580c)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
    };
  }
  if (name.includes('health') || name.includes('medical')) {
    return {
      bg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
    };
  }
  if (name.includes('housing') || name.includes('rent')) {
    return {
      bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
    };
  }
  if (name.includes('utilit') || name.includes('bill')) {
    return {
      bg: 'linear-gradient(135deg, #a855f7, #9333ea)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
    };
  }
  if (name.includes('shopping') || name.includes('apparel')) {
    return {
      bg: 'linear-gradient(135deg, #eab308, #ca8a04)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
    };
  }
  if (name.includes('transport') || name.includes('fuel')) {
    return {
      bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
    };
  }
  if (name.includes('freelance') || name.includes('consulting') || name.includes('salary')) {
    return {
      bg: 'linear-gradient(135deg, #10b981, #059669)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
    };
  }
  if (name.includes('invest') || name.includes('dividend')) {
    return {
      bg: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
    };
  }

  const color = customColor || (type === 'EXPENSE' ? '#6366f1' : '#10b981');
  return {
    bg: color,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`
  };
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
