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
    <!-- Greeting Header & Action Toolbar -->
    <div class="section-toolbar">
      <div>
        <h1 style="font-size:1.75rem; font-weight:800;">${greeting}, ${escapeHTML(userName)} 👋</h1>
        <p style="color:var(--text-muted); font-size:0.95rem;">Here's your financial overview</p>
      </div>
      
      <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
        <div class="timeframe-group" id="timeframe-selector">
          <button class="timeframe-btn" data-timeframe="today">Today</button>
          <button class="timeframe-btn" data-timeframe="week">This Week</button>
          <button class="timeframe-btn active" data-timeframe="month">This Month</button>
          <button class="timeframe-btn" data-timeframe="year">This Year</button>
          <button class="timeframe-btn" data-timeframe="all">All Time</button>
        </div>
        
        <button class="btn btn-primary" id="btn-quick-add">
          + Add Transaction
        </button>
      </div>
    </div>

    <!-- Stat Cards Grid -->
    <div class="stats-grid">
      <div class="stat-card balance">
        <div class="stat-title">AVAILABLE BALANCE</div>
        <div class="stat-value balance" id="stat-balance">${formatCurrency(0, currencyCode)}</div>
      </div>
      <div class="stat-card income">
        <div class="stat-title">INCOME</div>
        <div class="stat-value income" id="stat-income">${formatCurrency(0, currencyCode)}</div>
      </div>
      <div class="stat-card expense">
        <div class="stat-title">EXPENSES</div>
        <div class="stat-value expense" id="stat-expense">${formatCurrency(0, currencyCode)}</div>
      </div>
    </div>

    <!-- Visual Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Spending Overview / Trend Chart -->
      <div class="card">
        <div class="card-title">
          <span>Spending Overview / Trend Chart</span>
          <span style="font-size:0.8rem; font-weight:500; color:var(--text-muted);">Last 6 Months</span>
        </div>
        <div id="trend-chart-container" style="min-height:220px; display:flex; flex-direction:column; justify-content:flex-end;">
          <div class="empty-state">Loading trend chart...</div>
        </div>
      </div>

      <!-- Expense Breakdown -->
      <div class="card">
        <div class="card-title">Expense Breakdown</div>
        <div id="category-breakdown-container" class="category-breakdown-list">
          <div class="empty-state">Loading category breakdown...</div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions Card -->
    <div class="card" style="margin-top:1.5rem;">
      <div class="card-title">
        <span>Recent Transactions</span>
        <a href="#transactions" style="font-size:0.9rem; color:var(--primary); text-decoration:none; font-weight:600; display:inline-flex; align-items:center; gap:0.3rem;">
          View All <span style="font-size:1.1rem;">→</span>
        </a>
      </div>
      <div id="recent-transactions-container">
        <div class="empty-state">Loading recent transactions...</div>
      </div>
    </div>
  `;

  // Quick Add click handler
  document.getElementById('btn-quick-add').addEventListener('click', () => {
    window.location.hash = '#transactions?action=new';
  });

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
    if (!data.category_breakdown || data.category_breakdown.length === 0) {
      catContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📊</div>No expense transactions in this period.</div>`;
    } else {
      catContainer.innerHTML = data.category_breakdown.map(cat => `
        <div class="category-item">
          <div class="category-info">
            <div class="category-name">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${cat.color}"></span>
              <span>${escapeHTML(cat.category_name)}</span>
            </div>
            <div style="font-weight:700;">${formatCurrency(cat.total, currencyCode)} (${cat.percentage}%)</div>
          </div>
          <div class="category-bar-bg">
            <div class="category-bar-fill" style="width:${cat.percentage}%; background:${cat.color}"></div>
          </div>
        </div>
      `).join('');
    }

    // Update Recent Activity
    const recentContainer = document.getElementById('recent-transactions-container');
    if (!data.recent_transactions || data.recent_transactions.length === 0) {
      recentContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📝</div>No recent transactions. Click <strong>+ Add Transaction</strong> to record income or expenses.</div>`;
    } else {
      recentContainer.innerHTML = `
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Method</th>
                <th>Type</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.recent_transactions.map(tx => `
                <tr>
                  <td>${tx.transaction_date}</td>
                  <td>
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${tx.category_color || '#64748b'}; margin-right:6px;"></span>
                    ${escapeHTML(tx.category_name || 'Uncategorized')}
                  </td>
                  <td><span class="badge badge-${tx.payment_method.toLowerCase()}">${tx.payment_method}</span></td>
                  <td><span class="badge badge-${tx.type.toLowerCase()}">${tx.type}</span></td>
                  <td style="text-align:right; font-weight:700; color:${tx.type === 'INCOME' ? 'var(--income)' : 'var(--text-main)'}">
                    ${tx.type === 'INCOME' ? '+' : '-'}${formatCurrency(tx.amount, currencyCode)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
}

function renderTrendChart(trends, currencyCode) {
  const chartContainer = document.getElementById('trend-chart-container');
  if (!trends || trends.length === 0) {
    chartContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📈</div>No monthly data available yet.</div>`;
    return;
  }

  let maxVal = 10;
  trends.forEach(t => {
    if (parseFloat(t.income) > maxVal) maxVal = parseFloat(t.income);
    if (parseFloat(t.expense) > maxVal) maxVal = parseFloat(t.expense);
  });

  chartContainer.innerHTML = `
    <div style="display:flex; justify-content:flex-end; gap:1rem; margin-bottom:0.75rem; font-size:0.8rem;">
      <span style="display:inline-flex; align-items:center; gap:0.3rem;"><span style="width:10px; height:10px; border-radius:2px; background:var(--income);"></span> Income</span>
      <span style="display:inline-flex; align-items:center; gap:0.3rem;"><span style="width:10px; height:10px; border-radius:2px; background:var(--expense);"></span> Expenses</span>
    </div>
    
    <div style="display:flex; align-items:flex-end; justify-content:space-around; height:160px; padding-top:1rem; border-bottom:1px solid var(--glass-border); gap:0.5rem;">
      ${trends.map(t => {
        const incPct = Math.max(5, Math.round((parseFloat(t.income) / maxVal) * 100));
        const expPct = Math.max(5, Math.round((parseFloat(t.expense) / maxVal) * 100));
        const monthLabel = t.month;

        return `
          <div style="display:flex; flex-direction:column; align-items:center; gap:0.4rem; flex:1; height:100%; justify-content:flex-end;">
            <div style="display:flex; items-align:flex-end; gap:4px; height:100%; align-items:flex-end;">
              <div title="Income: ${formatCurrency(t.income, currencyCode)}" style="width:14px; height:${incPct}%; background:var(--income); border-radius:4px 4px 0 0; transition:height 0.5s ease;"></div>
              <div title="Expense: ${formatCurrency(t.expense, currencyCode)}" style="width:14px; height:${expPct}%; background:var(--expense); border-radius:4px 4px 0 0; transition:height 0.5s ease;"></div>
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${monthLabel}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
