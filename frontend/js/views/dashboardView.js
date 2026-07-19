import APIClient from '../api.js';
import { formatCurrency } from '../currency.js';
import { authManager } from '../auth.js';

export async function renderDashboardView(container) {
  const user = authManager.currentUser;
  const userName = user ? user.name.split(' ')[0] : 'User';
  const currencyCode = authManager.getUserCurrency();
  
  // Calculate dynamic greeting based on hour of day
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17) {
    greeting = 'Good evening';
  }

  container.innerHTML = `
    <div class="dash-mobile-container">
      <!-- Greeting Header -->
      <div class="dash-greeting-header">
        <h1 class="dash-greeting-title">${greeting}, ${escapeHTML(userName)} 👋</h1>
        <p class="dash-greeting-subtitle">Here’s your financial overview</p>
      </div>

      <!-- Segmented Timeframe Control Bar -->
      <div class="dash-timeframe-bar">
        <div class="timeframe-group" id="timeframe-selector">
          <button class="timeframe-btn" data-timeframe="today">Today</button>
          <button class="timeframe-btn" data-timeframe="week">This Week</button>
          <button class="timeframe-btn active" data-timeframe="month">This Month</button>
          <button class="timeframe-btn" data-timeframe="year">This Year</button>
          <button class="timeframe-btn" data-timeframe="all">All</button>
        </div>
      </div>

      <!-- Full-Width Available Balance Card -->
      <div class="dash-balance-card">
        <div class="dash-balance-header">
          <span class="dash-card-label">AVAILABLE BALANCE</span>
          <div class="dash-wallet-icon" title="Available Balance">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
              <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
            </svg>
          </div>
        </div>
        <div class="dash-balance-amount" id="stat-balance">${formatCurrency(0, currencyCode)}</div>
      </div>

      <!-- Side-by-Side Income & Expenses Grid (360px–480px) -->
      <div class="dash-summary-grid">
        <!-- INCOME Card -->
        <div class="dash-summary-card income">
          <div class="dash-summary-header">
            <span class="dash-card-label">INCOME</span>
            <span class="dash-arrow income">↗</span>
          </div>
          <div class="dash-summary-amount income" id="stat-income">${formatCurrency(0, currencyCode)}</div>
        </div>

        <!-- EXPENSES Card -->
        <div class="dash-summary-card expense">
          <div class="dash-summary-header">
            <span class="dash-card-label">EXPENSES</span>
            <span class="dash-arrow expense">↘</span>
          </div>
          <div class="dash-summary-amount expense" id="stat-expense">${formatCurrency(0, currencyCode)}</div>
        </div>
      </div>

      <!-- Action Card: Add Transaction -->
      <div class="dash-action-card" id="btn-quick-add" role="button" tabindex="0" aria-label="Add Transaction">
        <div class="action-card-left">
          <div class="action-icon-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <div class="action-card-text">
            <div class="action-card-title">Add Transaction</div>
            <div class="action-card-subtitle">Record your income or expense</div>
          </div>
        </div>
        <div class="action-card-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      <!-- Spending Overview Chart Card -->
      <div class="card dash-card-compact">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.65rem;">
          <span style="font-size:0.95rem; font-weight:700;">Spending Overview</span>
          <span style="font-size:0.75rem; font-weight:500; color:var(--text-muted);">Last 6 Months</span>
        </div>
        <div id="trend-chart-container" style="min-height:130px; display:flex; flex-direction:column; justify-content:flex-end;">
          <div class="empty-state" style="padding:1rem;">Loading trend chart...</div>
        </div>
      </div>

      <!-- Expense Breakdown Card -->
      <div class="card dash-card-compact">
        <div class="card-title" style="font-size:0.95rem; font-weight:700; margin-bottom:0.65rem;">Expense Breakdown</div>
        <div id="category-breakdown-container" class="category-breakdown-list">
          <div class="empty-state" style="padding:1rem;">Loading category breakdown...</div>
        </div>
      </div>

      <!-- Recent Transactions Card -->
      <div class="card dash-card-compact">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <span style="font-size:0.95rem; font-weight:700; color:var(--text-main);">Recent Transactions</span>
          <a href="#transactions" class="view-all-link" style="color: #818cf8; font-size:0.82rem; font-weight:600; text-decoration:none;">
            View All
          </a>
        </div>
        <div id="recent-transactions-container">
          <div class="empty-state" style="padding:1.25rem;">Loading recent transactions...</div>
        </div>
      </div>
    </div>
  `;

  // Quick Add click handler
  const addBtn = document.getElementById('btn-quick-add');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      window.location.hash = '#transactions?action=new';
    });
    addBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.hash = '#transactions?action=new';
      }
    });
  }

  // Timeframe selector click handlers
  let currentTimeframe = 'month';
  const timeframeBtns = container.querySelectorAll('#timeframe-selector .timeframe-btn');
  timeframeBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      timeframeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTimeframe = btn.dataset.timeframe;
      await loadDashboardData(currentTimeframe, currencyCode);
    });
  });

  await loadDashboardData(currentTimeframe, currencyCode);
}

async function loadDashboardData(timeframe, currencyCode) {
  try {
    const data = await APIClient.getDashboardSummary(timeframe);

    // Update Stat Cards
    document.getElementById('stat-balance').textContent = formatCurrency(data.summary.current_balance, currencyCode);
    document.getElementById('stat-income').textContent = formatCurrency(data.summary.total_income, currencyCode);
    document.getElementById('stat-expense').textContent = formatCurrency(data.summary.total_expense, currencyCode);

    // Render Trend Chart
    renderTrendChart(data.monthly_trends, currencyCode);

    // Update Category Breakdown
    const catContainer = document.getElementById('category-breakdown-container');
    if (catContainer) {
      if (!data.category_breakdown || data.category_breakdown.length === 0) {
        catContainer.innerHTML = `
          <div class="dash-empty-breakdown">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.3rem;">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <div style="font-size:0.82rem; color:var(--text-muted); font-weight:500;">No expenses for this period.</div>
          </div>
        `;
      } else {
        catContainer.innerHTML = data.category_breakdown.map(cat => `
          <div class="category-item">
            <div class="category-info">
              <div class="category-name">
                <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:${cat.color}"></span>
                <span>${escapeHTML(cat.category_name)}</span>
              </div>
              <div style="font-weight:700; font-size:0.85rem;">${formatCurrency(cat.total, currencyCode)} (${cat.percentage}%)</div>
            </div>
            <div class="category-bar-bg">
              <div class="category-bar-fill" style="width:${cat.percentage}%; background:${cat.color}"></div>
            </div>
          </div>
        `).join('');
      }
    }

    // Update Recent Activity (Limit to 3 items on Mobile Dashboard)
    const recentContainer = document.getElementById('recent-transactions-container');
    if (recentContainer) {
      if (!data.recent_transactions || data.recent_transactions.length === 0) {
        recentContainer.innerHTML = `
          <div class="dash-empty-breakdown">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.3rem;">
              <rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/>
            </svg>
            <div style="font-size:0.82rem; color:var(--text-muted); font-weight:500;">No recent transactions for this period.</div>
          </div>
        `;
      } else {
        // Take up to 3 recent items
        const recentList = data.recent_transactions.slice(0, 3);

        recentContainer.innerHTML = `
          <div class="tx-cards-container" style="gap:0.6rem;">
            ${recentList.map(tx => {
              const iconConfig = getCategoryIconConfig(tx.category_name, tx.type, tx.category_color);
              const formattedDate = formatDateDisplay(tx.transaction_date);
              const paymentLabel = tx.payment_method === 'BANK_TRANSFER' ? 'Bank Transfer' : tx.payment_method;
              const isIncome = tx.type === 'INCOME';

              return `
                <div class="tx-card-item" style="padding:0.75rem 0.85rem;">
                  <div class="tx-card-left">
                    <div class="tx-category-icon" style="background: ${iconConfig.bg}; width:34px; height:34px;">
                      ${iconConfig.icon}
                    </div>
                    <div class="tx-details">
                      <span class="tx-cat-name" style="font-size:0.88rem;">${escapeHTML(tx.category_name || 'Uncategorized')}</span>
                      <span class="tx-sub-info" style="font-size:0.75rem;">${formattedDate} • ${paymentLabel}</span>
                      <span class="tx-type-pill ${isIncome ? 'income' : 'expense'}">${isIncome ? 'Income' : 'Expense'}</span>
                    </div>
                  </div>

                  <div class="tx-card-right">
                    <span class="tx-amount ${isIncome ? 'income' : 'expense'}" style="font-size:0.92rem;">
                      ${isIncome ? '+' : '-'}${formatCurrency(tx.amount, currencyCode)}
                    </span>
                    <button type="button" class="tx-more-btn btn-toggle-tx-menu" data-id="${tx.id}" title="Transaction options" aria-label="Transaction options">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="1.5"/>
                        <circle cx="12" cy="5" r="1.5"/>
                        <circle cx="12" cy="19" r="1.5"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Action Menu Dropdown -->
                  <div class="tx-action-dropdown" id="dash-tx-menu-${tx.id}">
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

        // Toggle Action Dropdown Menus
        recentContainer.querySelectorAll('.btn-toggle-tx-menu').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const txId = btn.dataset.id;
            const menu = document.getElementById(`dash-tx-menu-${txId}`);
            document.querySelectorAll('.tx-action-dropdown').forEach(m => {
              if (m !== menu) m.classList.remove('active');
            });
            if (menu) menu.classList.toggle('active');
          });
        });

        // Close action dropdowns on outside click
        document.addEventListener('click', () => {
          document.querySelectorAll('.tx-action-dropdown').forEach(m => m.classList.remove('active'));
        });

        // Edit button redirects to transactions page
        recentContainer.querySelectorAll('.btn-edit-tx').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.hash = '#transactions';
          });
        });

        // Delete action handler
        recentContainer.querySelectorAll('.btn-delete-tx').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            document.querySelectorAll('.tx-action-dropdown').forEach(m => m.classList.remove('active'));
            if (confirm('Are you sure you want to delete this transaction record?')) {
              try {
                await APIClient.deleteTransaction(btn.dataset.id);
                await loadDashboardData(timeframe, currencyCode);
              } catch (err) {
                alert(err.message || 'Failed to delete transaction.');
              }
            }
          });
        });
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
}

function renderTrendChart(trends, currencyCode) {
  const chartContainer = document.getElementById('trend-chart-container');
  if (!chartContainer) return;

  if (!trends || trends.length === 0) {
    chartContainer.innerHTML = `
      <div class="dash-empty-breakdown">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.3rem;">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <div style="font-size:0.82rem; color:var(--text-muted); font-weight:500;">No monthly data available yet.</div>
      </div>
    `;
    return;
  }

  let maxVal = 10;
  trends.forEach(t => {
    if (parseFloat(t.income) > maxVal) maxVal = parseFloat(t.income);
    if (parseFloat(t.expense) > maxVal) maxVal = parseFloat(t.expense);
  });

  chartContainer.innerHTML = `
    <div style="display:flex; justify-content:flex-end; gap:0.8rem; margin-bottom:0.5rem; font-size:0.75rem;">
      <span style="display:inline-flex; align-items:center; gap:0.3rem;"><span style="width:8px; height:8px; border-radius:2px; background:var(--income);"></span> Income</span>
      <span style="display:inline-flex; align-items:center; gap:0.3rem;"><span style="width:8px; height:8px; border-radius:2px; background:var(--expense);"></span> Expenses</span>
    </div>
    
    <div style="display:flex; align-items:flex-end; justify-content:space-around; height:120px; padding-top:0.5rem; border-bottom:1px solid var(--glass-border); gap:0.35rem;">
      ${trends.map(t => {
        const incPct = Math.max(5, Math.round((parseFloat(t.income) / maxVal) * 100));
        const expPct = Math.max(5, Math.round((parseFloat(t.expense) / maxVal) * 100));
        const monthLabel = t.month;

        return `
          <div style="display:flex; flex-direction:column; align-items:center; gap:0.3rem; flex:1; height:100%; justify-content:flex-end;">
            <div style="display:flex; align-items:flex-end; gap:3px; height:100%;">
              <div title="Income: ${formatCurrency(t.income, currencyCode)}" style="width:10px; height:${incPct}%; background:var(--income); border-radius:3px 3px 0 0; transition:height 0.4s ease;"></div>
              <div title="Expense: ${formatCurrency(t.expense, currencyCode)}" style="width:10px; height:${expPct}%; background:var(--expense); border-radius:3px 3px 0 0; transition:height 0.4s ease;"></div>
            </div>
            <span style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">${monthLabel}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
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

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
