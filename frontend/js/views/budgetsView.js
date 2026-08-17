import APIClient from '../api.js';
import { formatCurrency } from '../currency.js';
import { authManager } from '../auth.js';

let currentCategories = [];
let editingBudgetId = null;

export async function renderBudgetsView(container) {
  const currencyCode = authManager.getUserCurrency();

  container.innerHTML = `
    <div class="budgets-page-container">
      <!-- Header Section -->
      <div class="budgets-header-row">
        <div>
          <h1 class="budgets-title">Budgets</h1>
          <p class="budgets-subtitle">Monitor and control your monthly spending limits</p>
        </div>

        <button class="btn btn-primary" id="btn-add-budget" style="display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.6rem 1.1rem; border-radius: 12px; font-weight: 700;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Set Budget</span>
        </button>
      </div>

      <!-- Top Summary Section -->
      <div id="budget-summary-container" class="budget-summary-grid">
        <div class="budget-summary-card">
          <span class="summary-label">Total Monthly Limit</span>
          <span class="summary-value" id="summary-total-limit">...</span>
        </div>
        <div class="budget-summary-card">
          <span class="summary-label">Total Spent</span>
          <span class="summary-value" id="summary-total-spent">...</span>
        </div>
        <div class="budget-summary-card">
          <span class="summary-label">Remaining Budget</span>
          <span class="summary-value" id="summary-remaining">...</span>
        </div>
        <div class="budget-summary-card">
          <span class="summary-label">Overall Usage</span>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.25rem;">
            <span class="summary-value" id="summary-usage-pct">...</span>
            <span class="budget-status-pill" id="summary-status-pill">Healthy</span>
          </div>
        </div>
      </div>

      <!-- Budget Smart Insight Card -->
      <div id="budget-insight-container" style="margin-bottom: 1.5rem;"></div>

      <!-- Main Budgets List Container -->
      <div class="budgets-section">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 style="font-size:1.15rem; font-weight:700; color:var(--text-main);">Your Active Budgets</h2>
        </div>

        <div id="budgets-grid-container" class="budgets-grid">
          <div style="padding:2.5rem; text-align:center; color:var(--text-muted); grid-column: 1 / -1;">
            Loading budgets...
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Budget Modal -->
    <div class="modal-overlay" id="budget-modal">
      <div class="modal" style="max-width:420px;">
        <div class="modal-header">
          <h3 class="modal-title" id="budget-modal-title">Set Monthly Budget</h3>
          <button class="modal-close" id="budget-modal-close-btn">&times;</button>
        </div>
        <form id="budget-form">
          <div id="budget-modal-error" style="display:none; padding:0.6rem; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.3); color:#F43F5E; border-radius:8px; margin-bottom:1rem; font-size:0.85rem;"></div>

          <div class="form-group" style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;">Budget Type / Scope</label>
            <select id="budget-scope-select" class="form-control" style="width:100%;" required>
              <option value="OVERALL">Overall Monthly Budget (All Expenses)</option>
              <option value="CATEGORY">Category Specific Budget</option>
            </select>
          </div>

          <div class="form-group" id="category-select-group" style="display:none; margin-bottom:1rem;">
            <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;">Category</label>
            <select id="budget-category-select" class="form-control" style="width:100%;">
            </select>
          </div>

          <div class="form-group" style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;">Monthly Limit (${currencyCode})</label>
            <input type="number" step="0.01" min="1" id="budget-amount" class="form-control" placeholder="e.g. 500.00" required />
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
            <button type="button" class="btn btn-secondary" id="budget-modal-cancel-btn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="budget-modal-submit-btn">Save Budget</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Fetch Categories for budget dropdown
  try {
    currentCategories = await APIClient.getCategories();
    populateCategorySelect(currentCategories);
  } catch (err) {
    console.error('Failed to load categories for budgets view:', err);
  }

  // Handle Budget Modal scope toggle
  const scopeSelect = document.getElementById('budget-scope-select');
  const catGroup = document.getElementById('category-select-group');
  scopeSelect?.addEventListener('change', (e) => {
    if (e.target.value === 'CATEGORY') {
      catGroup.style.display = 'block';
      document.getElementById('budget-category-select').required = true;
    } else {
      catGroup.style.display = 'none';
      document.getElementById('budget-category-select').required = false;
    }
  });

  // Modal open/close handlers
  const modal = document.getElementById('budget-modal');
  const openModal = (budget = null) => {
    editingBudgetId = budget ? budget.id : null;
    document.getElementById('budget-modal-title').textContent = budget ? 'Edit Budget' : 'Set Monthly Budget';
    document.getElementById('budget-modal-error').style.display = 'none';

    const dialog = modal.querySelector('.modal-dialog') || modal.querySelector('.modal');
    if (dialog) {
      if (window.innerWidth <= 640) dialog.classList.add('modal-dialog-bottom-sheet');
      else dialog.classList.remove('modal-dialog-bottom-sheet');
    }

    if (budget) {
      document.getElementById('budget-amount').value = budget.amount;
      if (budget.category_id) {
        scopeSelect.value = 'CATEGORY';
        catGroup.style.display = 'block';
        document.getElementById('budget-category-select').value = budget.category_id;
      } else {
        scopeSelect.value = 'OVERALL';
        catGroup.style.display = 'none';
      }
    } else {
      document.getElementById('budget-form').reset();
      scopeSelect.value = 'OVERALL';
      catGroup.style.display = 'none';
    }
    modal.classList.add('active');
  };

  const closeModal = () => {
    modal.classList.remove('active');
    editingBudgetId = null;
  };

  document.getElementById('btn-add-budget')?.addEventListener('click', () => openModal());
  document.getElementById('budget-modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('budget-modal-cancel-btn')?.addEventListener('click', closeModal);

  // Form submit handler
  document.getElementById('budget-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('budget-modal-error');
    errorDiv.style.display = 'none';

    const scope = scopeSelect.value;
    const amountVal = parseFloat(document.getElementById('budget-amount').value);

    if (isNaN(amountVal) || amountVal <= 0) {
      errorDiv.textContent = 'Please enter a valid positive budget amount.';
      errorDiv.style.display = 'block';
      return;
    }

    const payload = {
      amount: amountVal,
      period: 'MONTHLY',
      category_id: scope === 'CATEGORY' ? document.getElementById('budget-category-select').value : null
    };

    try {
      await APIClient.createOrUpdateBudget(payload);
      if (window.showToast) window.showToast('Budget saved successfully!', 'success');
      closeModal();
      await loadBudgetsData(currencyCode);
    } catch (err) {
      errorDiv.textContent = err.message || 'Failed to save budget.';
      errorDiv.style.display = 'block';
      if (window.showToast) window.showToast(err.message || 'Failed to save budget.', 'error');
    }
  });

  await loadBudgetsData(currencyCode);
}

function populateCategorySelect(categories) {
  const catSelect = document.getElementById('budget-category-select');
  if (catSelect) {
    const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
    catSelect.innerHTML = expenseCategories
      .map(c => `<option value="${c.id}">${escapeHTML(c.name)}</option>`)
      .join('');
  }
}

async function loadBudgetsData(currencyCode) {
  const gridContainer = document.getElementById('budgets-grid-container');
  const insightContainer = document.getElementById('budget-insight-container');

  gridContainer.innerHTML = `
    <div style="padding:2.5rem; text-align:center; color:var(--text-muted); grid-column: 1 / -1; background:var(--bg-card); border:1px solid var(--glass-border); border-radius:18px;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="animation: spin 1s linear infinite; margin-bottom:0.5rem;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      <div style="font-weight:600; font-size:0.9rem;">Loading budget metrics...</div>
    </div>
  `;

  try {
    const [summary, budgets] = await Promise.all([
      APIClient.getBudgetSummary(),
      APIClient.getBudgets()
    ]);

    // Update Top Summary Cards using real backend summary values
    const totLimit = summary.total_budget_limit ? parseFloat(summary.total_budget_limit) : 0;
    const totSpend = summary.total_budget_spend ? parseFloat(summary.total_budget_spend) : 0;
    const remBudget = totLimit - totSpend;
    const overallPct = summary.overall_percentage_used !== undefined ? summary.overall_percentage_used : (totLimit > 0 ? (totSpend / totLimit) * 100 : 0);

    document.getElementById('summary-total-limit').textContent = formatCurrency(totLimit, currencyCode);
    document.getElementById('summary-total-spent').textContent = formatCurrency(totSpend, currencyCode);
    document.getElementById('summary-remaining').textContent = formatCurrency(remBudget, currencyCode);
    document.getElementById('summary-usage-pct').textContent = `${overallPct.toFixed(1)}%`;

    const statusPill = document.getElementById('summary-status-pill');
    if (statusPill) {
      if (overallPct >= 100) {
        statusPill.textContent = 'Exceeded';
        statusPill.className = 'budget-status-pill exceeded';
      } else if (overallPct >= 80) {
        statusPill.textContent = 'Warning';
        statusPill.className = 'budget-status-pill warning';
      } else {
        statusPill.textContent = 'Healthy';
        statusPill.className = 'budget-status-pill healthy';
      }
    }

    // Render Data-Driven Smart Insight Card
    renderBudgetInsight(insightContainer, summary, budgets, currencyCode);

    // Empty state check
    if (!budgets || budgets.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state" style="padding:3rem 1.5rem; text-align:center; background:var(--bg-card); border:1px solid var(--glass-border); border-radius:20px; grid-column: 1 / -1;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.75rem;">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <h3 style="font-size:1.05rem; font-weight:700; color:var(--text-main); margin-bottom:0.25rem;">No budgets set yet</h3>
          <p style="font-size:0.85rem; color:var(--text-muted); max-width:340px; margin:0 auto 1.25rem auto;">Set a monthly spending limit to track your financial health and prevent overspending.</p>
          <button type="button" class="btn btn-primary" id="btn-empty-add-budget" style="padding:0.5rem 1.2rem; font-weight:700; border-radius:10px;">Set Your First Budget</button>
        </div>
      `;
      gridContainer.querySelector('#btn-empty-add-budget')?.addEventListener('click', () => {
        document.getElementById('btn-add-budget')?.click();
      });
      return;
    }

    // Render Budget Cards
    gridContainer.innerHTML = budgets.map(b => {
      const category = currentCategories.find(c => c.id === b.category_id);
      const categoryName = b.category_id ? (category ? category.name : 'Category Budget') : 'Overall Monthly Budget';
      const categoryIcon = category ? category.icon : '🎯';
      const categoryColor = category ? (category.color || '#6366F1') : '#10B981';

      const limit = parseFloat(b.amount);
      const spend = parseFloat(b.current_spend);
      const remaining = parseFloat(b.remaining_budget);
      const pct = b.percentage_used || 0;
      const isExceeded = b.is_exceeded;
      const isWarning = b.is_warning;

      let statusClass = 'healthy';
      let statusText = 'Healthy';
      let barColor = 'linear-gradient(90deg, #10B981, #059669)';

      if (isExceeded) {
        statusClass = 'exceeded';
        statusText = 'Exceeded';
        barColor = 'linear-gradient(90deg, #F43F5E, #E11D48)';
      } else if (isWarning) {
        statusClass = 'warning';
        statusText = 'Near Limit';
        barColor = 'linear-gradient(90deg, #F59E0B, #D97706)';
      }

      const progressWidth = Math.min(100, Math.max(0, pct));

      return `
        <div class="budget-card">
          <div class="budget-card-header">
            <div style="display:flex; align-items:center; gap:0.65rem;">
              <div class="budget-icon-circle" style="background:${categoryColor}20; color:${categoryColor}; border:1px solid ${categoryColor}40;">
                <span style="font-size:1.1rem;">${categoryIcon}</span>
              </div>
              <div>
                <h3 class="budget-card-title">${escapeHTML(categoryName)}</h3>
                <span class="budget-card-period">${b.period}</span>
              </div>
            </div>
            <span class="budget-status-pill ${statusClass}">${statusText}</span>
          </div>

          <div class="budget-progress-section">
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.4rem;">
              <span style="font-size:0.82rem; color:var(--text-muted); font-weight:600;">Spent: ${formatCurrency(spend, currencyCode)}</span>
              <span style="font-size:0.88rem; font-weight:800; color:var(--text-main);">${pct.toFixed(1)}%</span>
            </div>

            <div class="budget-progress-track">
              <div class="budget-progress-fill" style="width: ${progressWidth}%; background: ${barColor};"></div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-muted); margin-top:0.45rem;">
              <span>Limit: ${formatCurrency(limit, currencyCode)}</span>
              <span style="color: ${isExceeded ? '#F43F5E' : 'var(--text-muted)'}; font-weight:600;">
                ${isExceeded ? `Over by ${formatCurrency(Math.abs(remaining), currencyCode)}` : `Left: ${formatCurrency(remaining, currencyCode)}`}
              </span>
            </div>
          </div>

          <div class="budget-card-actions">
            <button type="button" class="btn btn-secondary btn-edit-budget" data-id="${b.id}" style="padding:0.35rem 0.75rem; font-size:0.8rem;">Edit</button>
            <button type="button" class="btn btn-danger btn-delete-budget" data-id="${b.id}" style="padding:0.35rem 0.75rem; font-size:0.8rem;">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Edit & Delete Listeners
    gridContainer.querySelectorAll('.btn-edit-budget').forEach(btn => {
      btn.addEventListener('click', () => {
        const budget = budgets.find(b => b.id === btn.dataset.id);
        if (budget) document.getElementById('btn-add-budget')?.click();
      });
    });

    gridContainer.querySelectorAll('.btn-delete-budget').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this budget limit?')) {
          try {
            await APIClient.deleteBudget(btn.dataset.id);
            if (window.showToast) window.showToast('Budget deleted', 'info');
            await loadBudgetsData(currencyCode);
          } catch (err) {
            if (window.showToast) window.showToast(err.message || 'Failed to delete budget.', 'error');
            else alert(err.message || 'Failed to delete budget.');
          }
        }
      });
    });

  } catch (err) {
    console.error(err);
    gridContainer.innerHTML = `
      <div class="empty-state" style="padding:2.5rem; text-align:center; background:var(--bg-card); border:1px solid rgba(244,63,94,0.3); border-radius:20px; grid-column: 1 / -1;">
        <h3 style="color:#F43F5E; font-size:1.05rem; font-weight:700; margin-bottom:0.4rem;">Failed to load budget data</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">${escapeHTML(err.message || 'An API error occurred while retrieving budget metrics.')}</p>
        <button id="retry-budgets-btn" class="btn btn-primary" style="padding:0.45rem 1rem; border-radius:10px; background:#6366F1; border:none; color:#FFF; font-weight:700;">Retry</button>
      </div>
    `;
    gridContainer.querySelector('#retry-budgets-btn')?.addEventListener('click', () => loadBudgetsData(currencyCode));
  }
}

function renderBudgetInsight(container, summary, budgets, currencyCode) {
  if (!budgets || budgets.length === 0) {
    container.innerHTML = '';
    return;
  }

  const exceededBudgets = budgets.filter(b => b.is_exceeded);
  const warningBudgets = budgets.filter(b => b.is_warning && !b.is_exceeded);

  let icon = '💡';
  let title = 'Budget Insight';
  let message = 'You are spending well within your configured budget limits. Keep up the good work!';
  let borderColor = 'rgba(16, 185, 129, 0.3)';
  let bgGradient = 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.04))';

  if (exceededBudgets.length > 0) {
    icon = '🚨';
    title = 'Budget Exceeded Warning';
    const topExceeded = exceededBudgets[0];
    const catName = getCategoryName(topExceeded.category_id);
    message = `You have exceeded your ${catName} budget limit by ${formatCurrency(Math.abs(topExceeded.remaining_budget), currencyCode)}. Consider scaling back non-essential expenses.`;
    borderColor = 'rgba(244, 63, 94, 0.35)';
    bgGradient = 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(225, 29, 72, 0.05))';
  } else if (warningBudgets.length > 0) {
    icon = '⚠️';
    title = 'Approaching Budget Limit';
    const topWarn = warningBudgets[0];
    const catName = getCategoryName(topWarn.category_id);
    message = `Your ${catName} budget is at ${topWarn.percentage_used.toFixed(1)}% of its allocated limit. You have ${formatCurrency(topWarn.remaining_budget, currencyCode)} remaining.`;
    borderColor = 'rgba(245, 158, 11, 0.35)';
    bgGradient = 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.05))';
  }

  container.innerHTML = `
    <div style="background:${bgGradient}; border:1px solid ${borderColor}; border-radius:16px; padding:1.1rem 1.25rem; display:flex; align-items:flex-start; gap:0.85rem;">
      <span style="font-size:1.35rem; line-height:1;">${icon}</span>
      <div>
        <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-main); margin:0 0 0.2rem 0;">${title}</h4>
        <p style="font-size:0.85rem; color:var(--text-muted); margin:0; line-height:1.45;">${escapeHTML(message)}</p>
      </div>
    </div>
  `;
}

function getCategoryName(categoryId) {
  if (!categoryId) return 'Overall Monthly';
  const cat = currentCategories.find(c => c.id === categoryId);
  return cat ? cat.name : 'Category';
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
