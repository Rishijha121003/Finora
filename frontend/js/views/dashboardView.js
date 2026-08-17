import APIClient from '../api.js';
import { formatCurrency } from '../currency.js';
import { authManager } from '../auth.js';
import { openTransactionModal } from '../components/transactionModal.js';
import { openManageFavoritesModal } from '../components/manageFavoritesModal.js';


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

  // Get current date range display (e.g., "May 1 - May 31, 2025")
  const now = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthName = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();
  const lastDay = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const dateRangeStr = `${currentMonthName} 1 - ${currentMonthName} ${lastDay}, ${currentYear}`;
  const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : 'U';

  container.innerHTML = `
    <div class="dash-v2-container">
      <!-- 1. Top Header Banner -->
      <div class="dash-v2-header">
        <div class="dash-v2-header-left">
          <h1 class="dash-v2-title">${greeting}, ${escapeHTML(userName)} 👋</h1>
          <p class="dash-v2-subtitle">Here’s your financial overview for ${currentMonthName} ${currentYear}</p>
        </div>

        <div class="dash-v2-header-right">
          <!-- Month/Timeframe Selector Pill -->
          <div class="dash-v2-timeframe-dropdown" id="timeframe-selector">
            <button class="dash-v2-timeframe-btn active" data-timeframe="month">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>${dateRangeStr}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>

          <!-- Notification Icon Button -->
          <button class="dash-v2-icon-btn" title="Notifications" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="notification-dot"></span>
          </button>

          <!-- User Profile & Premium Badge Pill -->
          <div class="dash-v2-user-badge">
            <div class="user-avatar-circle">${userInitial}</div>
            <div class="user-profile-meta">
              <span class="user-name-text">${escapeHTML(userName)}</span>
              <span class="premium-badge">Premium</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Top Tier: Pulse Health Score Gauge & Smart Insights Grid (2 Columns Desktop) -->
      <div class="dash-v2-insights-grid">
        <!-- Finora Pulse Score Card -->
        <div id="pulse-card-container">
          <div class="card pulse-v2-card">
            <div class="pulse-v2-header">
              <div class="pulse-v2-brand">
                <div class="pulse-icon-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <span class="pulse-v2-title">Finora Pulse</span>
                <span class="pulse-v2-beta">BETA</span>
              </div>
              <span class="pulse-v2-sub">Financial Health Score</span>
            </div>

            <div class="pulse-v2-body">
              <!-- Score Ring Gauge Graphic -->
              <div class="pulse-v2-gauge-wrapper">
                <svg width="130" height="130" viewBox="0 0 120 120" class="pulse-gauge-svg">
                  <circle cx="60" cy="60" r="50" class="gauge-bg-ring" />
                  <circle cx="60" cy="60" r="50" class="gauge-score-ring" id="pulse-gauge-circle" style="stroke-dasharray: 314; stroke-dashoffset: 60; stroke: #10B981;" />
                </svg>
                <div class="pulse-v2-gauge-center">
                  <div class="pulse-gauge-score" id="pulse-score-val">82</div>
                  <div class="pulse-gauge-max">/ 100</div>
                </div>
              </div>

              <!-- Score Status Details -->
              <div class="pulse-v2-details">
                <div class="pulse-v2-greeting">Great job! 🎉</div>
                <div class="pulse-v2-health-text">Your financial health is</div>
                <div class="pulse-v2-status-grade" id="pulse-grade-val">Good</div>

                <div class="pulse-v2-delta-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  <span style="font-size:0.8rem; color:var(--text-muted);">Better than last month</span>
                  <span class="pulse-delta-badge">↑ 12%</span>
                </div>

                <a href="#pulse" class="btn btn-secondary pulse-v2-cta">
                  <span>View Full Insights</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Smart Insight Card -->
        <div class="card smart-insight-v2-card">
          <div class="smart-insight-header">
            <div class="smart-insight-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              <span>Smart Insight</span>
            </div>
            <button class="dash-v2-more-btn" title="More options" aria-label="More options">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          </div>

          <div class="smart-insight-body">
            <p class="smart-insight-text" id="smart-insight-text">
              Loading smart insight...
            </p>
          </div>

          <div class="smart-insight-footer">
            <a href="#pulse" class="btn btn-secondary smart-insight-cta">
              <span>See All Insights</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <div class="smart-insight-graphic">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.35;">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Second Tier: 4 Financial Metric Cards Grid -->
      <div class="dash-v2-metrics-grid">
        <!-- Card 1: Total Balance -->
        <div class="card metric-v2-card">
          <div class="metric-v2-header">
            <div class="metric-v2-label-group">
              <span class="metric-v2-label">Total Balance</span>
              <button class="metric-v2-eye-btn" id="btn-toggle-balance-visibility" title="Toggle balance visibility">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div class="metric-v2-icon-box bank">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
          </div>
          <div class="metric-v2-amount" id="stat-balance">${formatCurrency(0, currencyCode)}</div>
          <div class="metric-v2-subtext" id="stat-balance-sub">Loading accounts...</div>
        </div>

        <!-- Card 2: Income -->
        <div class="card metric-v2-card">
          <div class="metric-v2-header">
            <span class="metric-v2-label">Income</span>
            <div class="metric-v2-arrow income">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </div>
          </div>
          <div class="metric-v2-amount income" id="stat-income">${formatCurrency(0, currencyCode)}</div>
          <div class="metric-v2-footer">
            <span class="metric-v2-subtext">This Month</span>
            <span class="metric-v2-badge neutral" id="stat-income-badge">--</span>
          </div>
        </div>

        <!-- Card 3: Expenses -->
        <div class="card metric-v2-card">
          <div class="metric-v2-header">
            <span class="metric-v2-label">Expenses</span>
            <div class="metric-v2-arrow expense">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2.5"><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></svg>
            </div>
          </div>
          <div class="metric-v2-amount expense" id="stat-expense">${formatCurrency(0, currencyCode)}</div>
          <div class="metric-v2-footer">
            <span class="metric-v2-subtext">This Month</span>
            <span class="metric-v2-badge neutral" id="stat-expense-badge">--</span>
          </div>
        </div>

        <!-- Card 4: Safe to Spend -->
        <div class="card metric-v2-card">
          <div class="metric-v2-header">
            <span class="metric-v2-label">Safe to Spend</span>
            <div class="metric-v2-arrow safe">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </div>
          </div>
          <div class="metric-v2-amount" id="stat-daily-safe-spend">-- <span style="font-size:0.8rem; font-weight:500; color:var(--text-muted);">/ day</span></div>
          <div class="metric-v2-footer">
            <span class="metric-v2-subtext" id="stat-safe-spend-subtext">Loading safe spend...</span>
          </div>
          <div class="metric-v2-progress-bg" style="margin-top:0.5rem;">
            <div class="metric-v2-progress-fill" id="stat-safe-spend-fill" style="width: 0%; background: #F59E0B;"></div>
          </div>
        </div>
      </div>

      <!-- 4. Third Tier: Analytics Grid (Income vs Expenses Bar Chart + Expense Breakdown Donut) -->
      <div class="dash-v2-analytics-grid">
        <!-- Income vs Expenses Chart Card -->
        <div class="card analytics-v2-card">
          <div class="analytics-v2-header">
            <h3 class="analytics-v2-title">Income vs Expenses</h3>
            <select class="analytics-v2-select" id="chart-period-select">
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div id="trend-chart-container" class="analytics-chart-box">
            <div class="dash-empty-breakdown" style="padding:2rem 1rem; text-align:center;">
              <div style="font-size:0.85rem; color:var(--text-muted); font-weight:500;">Loading trend chart...</div>
            </div>
          </div>
        </div>

        <!-- Expense Breakdown Donut Chart Card -->
        <div class="card analytics-v2-card">
          <div class="analytics-v2-header">
            <h3 class="analytics-v2-title">Expense Breakdown</h3>
            <select class="analytics-v2-select">
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div class="donut-analytics-body">
            <!-- Left Donut Chart Graphic -->
            <div class="donut-graphic-wrapper">
              <svg width="150" height="150" viewBox="0 0 120 120" class="donut-svg" id="donut-svg-graphic">
                <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="16" />
              </svg>
              <div class="donut-center-info">
                <div class="donut-center-val" id="donut-total-val">${formatCurrency(0, currencyCode)}</div>
                <div class="donut-center-lbl">Total</div>
              </div>
            </div>

            <!-- Right Legend List -->
            <div class="donut-legend-list" id="category-breakdown-container">
              <div class="dash-empty-breakdown" style="padding:1.5rem 0.5rem; text-align:center;">
                <div style="font-size:0.82rem; color:var(--text-muted); font-weight:500;">Loading breakdown...</div>
              </div>
            </div>
          </div>

          <div class="analytics-v2-footer">
            <a href="#categories" class="analytics-view-report-link">View Full Report &rarr;</a>
          </div>
        </div>
      </div>

      <!-- 5. Fourth Tier: Recent Transactions & Account Overview (2 Columns Desktop) -->
      <div class="dash-v2-bottom-grid">
        <!-- Recent Transactions Card -->
        <div class="card list-v2-card">
          <div class="list-v2-header">
            <h3 class="list-v2-title">Recent Transactions</h3>
            <a href="#transactions" class="list-v2-link">View All</a>
          </div>

          <div id="recent-transactions-container" class="list-v2-container">
            <div class="empty-state" style="padding:1.25rem;">Loading recent transactions...</div>
          </div>
        </div>

        <!-- Accounts Overview Card -->
        <div class="card list-v2-card">
          <div class="list-v2-header">
            <h3 class="list-v2-title">Accounts Overview</h3>
            <a href="#accounts" class="list-v2-link">View All</a>
          </div>

          <div id="account-summary-container" class="list-v2-container">
            <div class="empty-state" style="padding:1.25rem;">Loading accounts...</div>
          </div>

          <div class="list-v2-footer">
            <a href="#accounts" class="btn btn-secondary list-v2-btn-block">Manage Accounts &rarr;</a>
          </div>
        </div>
      </div>

      <!-- 6. Fifth Tier: Quick Actions Row -->
      <div class="dash-v2-quick-actions-section">
        <h4 class="quick-actions-label">Quick Actions</h4>
        <div class="quick-actions-grid">
          <button class="quick-action-tile" id="btn-quick-add-tx">
            <div class="quick-tile-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div class="quick-tile-text">
              <span class="quick-tile-title">Add Transaction</span>
              <span class="quick-tile-sub">Record income or expense</span>
            </div>
          </button>

          <button class="quick-action-tile" onclick="window.location.hash='#accounts'">
            <div class="quick-tile-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="17 1 21 5 17 9"/><line x1="3" y1="5" x2="21" y2="5"/><polyline points="7 23 3 19 7 15"/><line x1="21" y1="19" x2="3" y2="19"/></svg>
            </div>
            <div class="quick-tile-text">
              <span class="quick-tile-title">Transfer Money</span>
              <span class="quick-tile-sub">Between accounts</span>
            </div>
          </button>

          <button class="quick-action-tile" onclick="window.location.hash='#accounts'">
            <div class="quick-tile-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <div class="quick-tile-text">
              <span class="quick-tile-title">Add Account</span>
              <span class="quick-tile-sub">Connect new account</span>
            </div>
          </button>

          <button class="quick-action-tile" onclick="window.location.hash='#dashboard'">
            <div class="quick-tile-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div class="quick-tile-text">
              <span class="quick-tile-title">Create Budget</span>
              <span class="quick-tile-sub">Set monthly budget</span>
            </div>
          </button>

          <button class="quick-action-tile" onclick="window.location.hash='#pulse'">
            <div class="quick-tile-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <div class="quick-tile-text">
              <span class="quick-tile-title">Generate Report</span>
              <span class="quick-tile-sub">Download insights</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach Quick Add click handler
  document.getElementById('btn-quick-add-tx')?.addEventListener('click', () => {
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
  const [
    data,
    budgetSummary,
    safeSpendData,
    favorites,
    accountSummary,
    pulseData
  ] = await Promise.all([
    APIClient.getDashboardSummary(timeframe),
    APIClient.getBudgetSummary().catch(() => null),
    APIClient.getDailySafeSpend().catch(() => null),
    APIClient.getFavorites().catch(() => []),
    APIClient.getAccountSummary().catch(() => []),
    APIClient.getPulse().catch(() => null)
  ]);

    // Update Account Count Subtext
    const subEl = document.getElementById('stat-balance-sub');
    if (subEl) {
      const count = (accountSummary && Array.isArray(accountSummary)) ? accountSummary.length : 0;
      subEl.textContent = `Across ${count} account${count === 1 ? '' : 's'}`;
    }

    // Update Stat Cards
    document.getElementById('stat-balance').textContent = formatCurrency(data.summary.current_balance, currencyCode);
    document.getElementById('stat-income').textContent = formatCurrency(data.summary.total_income, currencyCode);
    document.getElementById('stat-expense').textContent = formatCurrency(data.summary.total_expense, currencyCode);

    // Calculate Month-over-Month deltas from monthly_trends
    const trends = (data && data.monthly_trends && Array.isArray(data.monthly_trends)) ? data.monthly_trends : [];
    let incMoMText = 'No previous data';
    let incMoMClass = 'metric-v2-badge neutral';
    let expMoMText = 'No previous data';
    let expMoMClass = 'metric-v2-badge neutral';

    if (trends.length >= 2) {
      const currentMonthData = trends[trends.length - 1];
      const prevMonthData = trends[trends.length - 2];

      const curInc = Number(currentMonthData.income) || 0;
      const prevInc = Number(prevMonthData.income) || 0;
      const curExp = Number(currentMonthData.expense) || 0;
      const prevExp = Number(prevMonthData.expense) || 0;

      // Income MoM
      if (prevInc === 0) {
        if (curInc > 0) {
          incMoMText = '↑ 100% from last month';
          incMoMClass = 'metric-v2-badge income';
        } else {
          incMoMText = '0% from last month';
          incMoMClass = 'metric-v2-badge neutral';
        }
      } else {
        const incPct = ((curInc - prevInc) / prevInc) * 100;
        const absIncPct = Math.abs(Math.round(incPct));
        if (incPct > 0) {
          incMoMText = `↑ ${absIncPct}% from last month`;
          incMoMClass = 'metric-v2-badge income';
        } else if (incPct < 0) {
          incMoMText = `↓ ${absIncPct}% from last month`;
          incMoMClass = 'metric-v2-badge expense';
        } else {
          incMoMText = '0% from last month';
          incMoMClass = 'metric-v2-badge neutral';
        }
      }

      // Expense MoM
      if (prevExp === 0) {
        if (curExp > 0) {
          expMoMText = '↑ 100% from last month';
          expMoMClass = 'metric-v2-badge expense';
        } else {
          expMoMText = '0% from last month';
          expMoMClass = 'metric-v2-badge neutral';
        }
      } else {
        const expPct = ((curExp - prevExp) / prevExp) * 100;
        const absExpPct = Math.abs(Math.round(expPct));
        if (expPct > 0) {
          expMoMText = `↑ ${absExpPct}% from last month`;
          expMoMClass = 'metric-v2-badge expense';
        } else if (expPct < 0) {
          expMoMText = `↓ ${absExpPct}% from last month`;
          expMoMClass = 'metric-v2-badge income';
        } else {
          expMoMText = '0% from last month';
          expMoMClass = 'metric-v2-badge neutral';
        }
      }
    }

    const incBadge = document.getElementById('stat-income-badge');
    if (incBadge) {
      incBadge.textContent = incMoMText;
      incBadge.className = incMoMClass;
    }

    const expBadge = document.getElementById('stat-expense-badge');
    if (expBadge) {
      expBadge.textContent = expMoMText;
      expBadge.className = expMoMClass;
    }

    // Render Daily Safe Spend Widget (v1.4.0)
    renderDailySafeSpendWidget(safeSpendData, currencyCode);

    // Render Quick Add Favorites (v1.4.0)
    renderFavoritesWidget(favorites, currencyCode, timeframe);

    // Render Finora Pulse Card (v1.4.0)
    renderPulseCard(pulseData, currencyCode);

    // Render Smart Insight Card
    renderSmartInsight(data.summary, data.category_breakdown, currencyCode);

    // Render Budget Overview Widget (v1.3.0)
    renderBudgetOverviewWidget(budgetSummary, currencyCode);

    // Render Account Summary Widget (v2.0.0)
    const accountContainer = document.getElementById('account-summary-container');

    if (accountContainer) {
      if (!accountSummary || accountSummary.length === 0) {
        accountContainer.innerHTML = `
          <div class="dash-empty-breakdown">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.3rem;">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            <div style="font-size:0.82rem; color:var(--text-muted); font-weight:500;">No accounts found.</div>
          </div>
        `;
      } else {
        accountContainer.innerHTML = accountSummary.map(account => {
          const accNameLower = (account.account_name || '').toLowerCase();
          const isCash = accNameLower.includes('cash') || accNameLower.includes('wallet') || accNameLower.includes('hand') || accNameLower.includes('petty');

          const iconSvg = isCash ? `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
              <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
            </svg>
          ` : `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="21" x2="21" y2="21"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <polyline points="5 10 12 3 19 10"/>
              <line x1="6" y1="18" x2="6" y2="10"/>
              <line x1="10" y1="18" x2="10" y2="10"/>
              <line x1="14" y1="18" x2="14" y2="10"/>
              <line x1="18" y1="18" x2="18" y2="10"/>
            </svg>
          `;

          const iconTypeClass = isCash ? 'cash' : 'bank';

          return `
            <div class="account-summary-item">
              <div class="account-summary-main">
                <div class="account-icon-box ${iconTypeClass}">
                  ${iconSvg}
                </div>
                <div class="account-info">
                  <span class="account-summary-name">${escapeHTML(account.account_name)}</span>
                  <span class="account-type-tag">${isCash ? 'Cash Account' : 'Bank Account'}</span>
                </div>
                <div class="account-summary-balance">
                  ${formatCurrency(account.current_balance, currencyCode)}
                </div>
              </div>

              <div class="account-summary-stats">
                <span class="stat-badge income">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  ${formatCurrency(account.income, currencyCode)}
                </span>
                <span class="stat-badge expense">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></svg>
                  ${formatCurrency(account.expense, currencyCode)}
                </span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Trend Chart
    renderTrendChart(data.monthly_trends, currencyCode);

    // Render Expense Breakdown Donut & Legend
    renderExpenseBreakdown(data.category_breakdown, data.summary ? data.summary.total_expense : 0, currencyCode);

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

        // Edit button directly opens Edit Transaction modal / bottom-sheet
        recentContainer.querySelectorAll('.btn-edit-tx').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.tx-action-dropdown').forEach(m => m.classList.remove('active'));
            const txId = btn.dataset.id;
            const targetTx = data.recent_transactions.find(t => t.id === txId);
            openTransactionModal({
              transaction: targetTx,
              onSuccess: async () => {
                await loadDashboardData(timeframe, currencyCode);
              }
            });
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
                if (window.showToast) window.showToast('Transaction deleted', 'info');
                await loadDashboardData(timeframe, currencyCode);
              } catch (err) {
                if (window.showToast) window.showToast(err.message || 'Failed to delete transaction.', 'error');
                else alert(err.message || 'Failed to delete transaction.');
              }
            }
          });
        });
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    const accountList = document.getElementById('account-summary-list');
    if (accountList && accountList.innerHTML.includes('Loading accounts')) {
      accountList.innerHTML = '<div style="font-size:0.82rem; color:var(--text-muted); padding:0.5rem 0;">Unable to load account summary.</div>';
    }
    const recentContainer = document.getElementById('recent-transactions-container');
    if (recentContainer && recentContainer.innerHTML.includes('Loading recent transactions')) {
      recentContainer.innerHTML = '<div style="font-size:0.82rem; color:var(--text-muted); padding:0.5rem 0;">Unable to load recent activity.</div>';
    }
  }
}

function renderPulseCard(pulseData, currencyCode) {
  const container = document.getElementById('pulse-card-container');
  if (!container) return;

  if (!pulseData || !pulseData.overall_score) {
    const scoreVal = document.getElementById('pulse-score-val');
    if (scoreVal) scoreVal.textContent = '--';
    return;
  }

  // Color mapping for score
  const colorMap = {
    'green': { hex: '#10B981', rgb: '16, 185, 129' },
    'blue': { hex: '#3B82F6', rgb: '59, 130, 246' },
    'orange': { hex: '#F59E0B', rgb: '245, 158, 11' },
    'red': { hex: '#F43F5E', rgb: '244, 63, 94' }
  };
  const color = colorMap[pulseData.score_color] || { hex: '#10B981', rgb: '16, 185, 129' };
  const score = Math.round(pulseData.overall_score || 0);

  // Gauge circumference for r=50 is ~314
  const circumference = 314;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreVal = document.getElementById('pulse-score-val');
  const gradeVal = document.getElementById('pulse-grade-val');
  const gaugeCircle = document.getElementById('pulse-gauge-circle');

  if (scoreVal) scoreVal.textContent = score;
  if (gradeVal) {
    gradeVal.textContent = pulseData.score_label || pulseData.status || (score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Needs Attention');
    gradeVal.style.color = color.hex;
  }
  if (gaugeCircle) {
    gaugeCircle.style.strokeDashoffset = strokeDashoffset;
    gaugeCircle.style.stroke = color.hex;
  }
}


function renderBudgetOverviewWidget(summary, currencyCode) {
  const container = document.getElementById('budget-overview-container');
  const manageBtn = document.getElementById('btn-manage-budget');
  if (!container) return;

  if (!summary || !summary.overall_budget) {
    container.innerHTML = `
      <div class="dash-empty-breakdown" style="padding:0.75rem 0.5rem;">
        <div style="font-size:0.85rem; color:var(--text-muted); font-weight:500; margin-bottom:0.4rem;">
          No overall monthly budget set yet.
        </div>
        <button type="button" id="btn-create-first-budget" class="btn btn-primary btn-sm" style="font-size:0.75rem; border-radius:10px;">
          Set Monthly Budget
        </button>
      </div>
    `;
    const firstBtn = document.getElementById('btn-create-first-budget');
    if (firstBtn) firstBtn.onclick = () => openBudgetModal(null, currencyCode);
    if (manageBtn) manageBtn.onclick = () => openBudgetModal(null, currencyCode);
    return;
  }

  const ob = summary.overall_budget;
  const spentAmount = Number(ob.current_spend) || 0;
  const remainingAmount = Math.max(0, Number(ob.remaining_budget) || 0);
  const percentageUsed = ob.percentage_used || 0;
  const pctBar = Math.min(100, percentageUsed);

  let statusBadge = `<span style="font-size:0.7rem; font-weight:700; color:#10b981; background:rgba(16, 185, 129, 0.15); padding:0.15rem 0.5rem; border-radius:12px;">ON TRACK</span>`;
  let barColor = 'var(--primary)';

  if (ob.is_exceeded) {
    statusBadge = `<span style="font-size:0.7rem; font-weight:700; color:#F43F5E; background:rgba(244, 63, 94, 0.15); padding:0.15rem 0.5rem; border-radius:12px;">EXCEEDED</span>`;
    barColor = '#F43F5E';
  } else if (ob.is_warning) {
    statusBadge = `<span style="font-size:0.7rem; font-weight:700; color:#f59e0b; background:rgba(245, 158, 11, 0.15); padding:0.15rem 0.5rem; border-radius:12px;">80%+ USED</span>`;
    barColor = '#f59e0b';
  }

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:0.78rem; color:var(--text-muted); font-weight:500;">Monthly Limit: </span>
          <span style="font-size:0.9rem; font-weight:700;">${formatCurrency(ob.amount, currencyCode)}</span>
        </div>
        ${statusBadge}
      </div>

      <div style="width:100%; height:8px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden;">
        <div style="width:${pctBar}%; height:100%; background:${barColor}; transition:width 0.4s ease; border-radius:4px;"></div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted); flex-wrap:wrap; gap:0.25rem;">
        <span><strong style="color:var(--text-main);">${formatCurrency(spentAmount, currencyCode)}</strong> of ${formatCurrency(ob.amount, currencyCode)} used (${percentageUsed}%)</span>
        <span>Remaining: <strong style="color:${ob.is_exceeded ? '#F43F5E' : '#10b981'};">${formatCurrency(remainingAmount, currencyCode)}</strong></span>
      </div>
    </div>
  `;

  if (manageBtn) {
    manageBtn.textContent = 'Edit Budget';
    manageBtn.onclick = () => openBudgetModal(ob, currencyCode);
  }
}

function openBudgetModal(existingBudget, currencyCode) {
  let modalEl = document.getElementById('budget-modal');
  if (modalEl) modalEl.remove();

  const currentAmt = existingBudget ? existingBudget.amount : '';

  const isMobile = window.innerWidth <= 640;

  modalEl = document.createElement('div');
  modalEl.id = 'budget-modal';
  modalEl.className = 'modal-overlay active';
  modalEl.innerHTML = `
    <div class="modal ${isMobile ? 'modal-dialog-bottom-sheet' : ''}" style="${isMobile ? '' : 'max-width:420px; width:100%;'}">
      ${isMobile ? '<div class="bottom-sheet-handle"></div>' : ''}
      <div class="modal-header">
        <h3 class="modal-title">${existingBudget ? 'Edit Monthly Budget' : 'Set Monthly Budget'}</h3>
        <button type="button" class="btn-close-modal" id="close-budget-modal" style="background:none; border:none; color:var(--text-muted); font-size:1.5rem; cursor:pointer;">&times;</button>
      </div>
      <form id="budget-form" style="padding:0.5rem 0 0 0;">
        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label" style="font-size:0.82rem; font-weight:600;">Monthly Spending Limit (${currencyCode})</label>
          <input type="number" step="0.01" min="1" class="form-control" id="budget-amount-input" value="${currentAmt}" placeholder="e.g. 50000" required autofocus />
        </div>
        <div style="display:flex; gap:0.5rem; justify-content:flex-end; align-items:center; margin-top:1.2rem; flex-wrap:wrap;">
          ${existingBudget ? `
            <button type="button" id="btn-delete-budget" class="btn" style="background:transparent; color:#F43F5E; border:1px solid rgba(244,63,94,0.4); padding:0.5rem 0.85rem; font-size:0.82rem; border-radius:10px; min-height:42px; margin-right:auto;">
              Delete
            </button>
          ` : ''}
          <button type="button" class="btn btn-secondary" id="cancel-budget-btn" style="padding:0.5rem 0.85rem; font-size:0.82rem; border-radius:10px; min-height:42px;">Cancel</button>
          <button type="submit" class="btn btn-primary" id="save-budget-btn" style="padding:0.5rem 1rem; font-size:0.82rem; border-radius:10px; font-weight:700; min-height:42px;">Save Budget</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalEl);

  const closeFn = () => modalEl.remove();
  modalEl.onclick = (e) => { if (e.target === modalEl) closeFn(); };
  document.getElementById('close-budget-modal').onclick = closeFn;
  document.getElementById('cancel-budget-btn').onclick = closeFn;

  const form = document.getElementById('budget-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(document.getElementById('budget-amount-input').value);
    if (!amountVal || amountVal <= 0) {
      if (window.showToast) window.showToast('Please enter a valid positive budget amount.', 'warning');
      return;
    }

    try {
      await APIClient.createOrUpdateBudget({
        amount: amountVal,
        period: 'MONTHLY'
      });
      if (window.showToast) window.showToast('Monthly budget saved successfully!', 'success');
      closeFn();
      window.location.reload();
    } catch (err) {
      if (window.showToast) window.showToast(err.message || 'Failed to save budget.', 'error');
    }
  };

  const deleteBtn = document.getElementById('btn-delete-budget');
  if (deleteBtn && existingBudget) {
    deleteBtn.onclick = async () => {
      if (confirm('Are you sure you want to delete your monthly budget limit?')) {
        try {
          await APIClient.deleteBudget(existingBudget.id);
          if (window.showToast) window.showToast('Monthly budget deleted.', 'info');
          closeFn();
          window.location.reload();
        } catch (err) {
          if (window.showToast) window.showToast(err.message || 'Failed to delete budget.', 'error');
        }
      }
    };
  }
}

function renderTrendChart(trends, currencyCode) {
  const chartContainer = document.getElementById('trend-chart-container');
  if (!chartContainer) return;

  if (!trends || !Array.isArray(trends) || trends.length === 0) {
    chartContainer.innerHTML = `
      <div class="dash-empty-breakdown" style="padding: 2rem 1rem; text-align: center;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.5rem;">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <div style="font-size:0.85rem; color:var(--text-muted); font-weight:500;">No monthly trend data available yet.</div>
      </div>
    `;
    return;
  }

  let maxVal = 0;
  trends.forEach(t => {
    const inc = Number(t.income) || 0;
    const exp = Number(t.expense) || 0;
    if (inc > maxVal) maxVal = inc;
    if (exp > maxVal) maxVal = exp;
  });
  if (maxVal === 0) maxVal = 100;

  const formatCompact = (val) => {
    if (val >= 1000000) return `₹ ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₹ ${(val / 1000).toFixed(0)}k`;
    return `₹ ${val.toFixed(0)}`;
  };

  const yMax = formatCompact(maxVal);
  const yMid = formatCompact(maxVal * 0.5);
  const yZero = `₹ 0`;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  chartContainer.innerHTML = `
    <div class="bar-chart-graphic">
      <div class="bar-chart-y-axis">
        <span>${yMax}</span>
        <span>${yMid}</span>
        <span>${yZero}</span>
      </div>
      <div class="bar-chart-bars-group">
        ${trends.map(t => {
          const inc = Number(t.income) || 0;
          const exp = Number(t.expense) || 0;
          const incPct = Math.min(100, Math.max(inc > 0 ? 4 : 0, Math.round((inc / maxVal) * 100)));
          const expPct = Math.min(100, Math.max(exp > 0 ? 4 : 0, Math.round((exp / maxVal) * 100)));

          const monthParts = (t.month || '').split('-');
          let mLabel = t.month;
          if (monthParts.length === 2) {
            const mIdx = parseInt(monthParts[1], 10) - 1;
            mLabel = monthNames[mIdx] || t.month;
          }

          const titleText = `${mLabel}: Income ${formatCurrency(inc, currencyCode)}, Expense ${formatCurrency(exp, currencyCode)}`;

          return `
            <div class="bar-pair" title="${titleText}">
              <div class="bar income" style="height:${incPct}%;"></div>
              <div class="bar expense" style="height:${expPct}%;"></div>
              <span class="bar-label">${mLabel}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <div class="bar-chart-legend">
      <span class="legend-item"><span class="legend-dot income"></span> Income</span>
      <span class="legend-item"><span class="legend-dot expense"></span> Expenses</span>
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
      bg: 'linear-gradient(135deg, #F43F5E, #E11D48)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
    };
  }
  if (name.includes('utilit') || name.includes('bill')) {
    return {
      bg: 'linear-gradient(135deg, #F59E0B, #D97706)',
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

  const color = customColor || (type === 'EXPENSE' ? '#F43F5E' : '#10b981');
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

function renderDailySafeSpendWidget(data, currencyCode) {
  const amountEl = document.getElementById('stat-daily-safe-spend');
  const subtextEl = document.getElementById('stat-safe-spend-subtext');
  const fillEl = document.getElementById('stat-safe-spend-fill');

  if (!amountEl || !subtextEl) return;

  if (!data || !data.has_budget) {
    amountEl.innerHTML = `-- <span style="font-size:0.8rem; font-weight:500; color:var(--text-muted);">/ day</span>`;
    subtextEl.textContent = `Set a monthly budget to enable`;
    subtextEl.style.color = 'var(--text-muted)';
    if (fillEl) {
      fillEl.style.width = `0%`;
      fillEl.style.background = '#F59E0B';
    }
    return;
  }

  const dailyAmt = formatCurrency(data.daily_safe_spend, currencyCode);
  const remainingAmt = formatCurrency(data.remaining_budget, currencyCode);
  const monthTotal = Number(data.month_total_budget) || 0;
  const spentTotal = Number(data.current_month_spent) || 0;

  if (data.is_budget_exceeded) {
    amountEl.innerHTML = `<span style="color:#F43F5E;">${formatCurrency(0, currencyCode)}</span> <span style="font-size:0.8rem; font-weight:500; color:var(--text-muted);">/ day</span>`;
    subtextEl.textContent = `Budget exceeded! Spent ${formatCurrency(spentTotal, currencyCode)} of ${formatCurrency(monthTotal, currencyCode)}`;
    subtextEl.style.color = '#F43F5E';
    if (fillEl) {
      fillEl.style.width = `100%`;
      fillEl.style.background = '#F43F5E';
    }
  } else {
    amountEl.innerHTML = `${dailyAmt} <span style="font-size:0.8rem; font-weight:500; color:var(--text-muted);">/ day</span>`;
    subtextEl.textContent = `${remainingAmt} left (${data.remaining_days} ${data.remaining_days === 1 ? 'day' : 'days'} left)`;
    subtextEl.style.color = 'var(--text-muted)';

    let pctSpent = monthTotal > 0 ? Math.min(100, Math.max(0, Math.round((spentTotal / monthTotal) * 100))) : 0;
    if (fillEl) {
      fillEl.style.width = `${pctSpent}%`;
      fillEl.style.background = pctSpent > 80 ? '#F59E0B' : '#10B981';
    }
  }
}

function renderExpenseBreakdown(breakdown, totalExpense, currencyCode) {
  const totalValEl = document.getElementById('donut-total-val');
  if (totalValEl) {
    totalValEl.textContent = formatCurrency(totalExpense || 0, currencyCode);
  }

  const donutSvg = document.getElementById('donut-svg-graphic');
  const catContainer = document.getElementById('category-breakdown-container');
  const fallbackColors = ['#EC4899', '#F97316', '#06B6D4', '#A855F7', '#3B82F6', '#64748B', '#10B981', '#F59E0B'];

  if (!breakdown || !Array.isArray(breakdown) || breakdown.length === 0 || Number(totalExpense) <= 0) {
    if (donutSvg) {
      donutSvg.innerHTML = `<circle cx="60" cy="60" r="42" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="16" />`;
    }
    if (catContainer) {
      catContainer.innerHTML = `
        <div class="dash-empty-breakdown" style="padding: 1.5rem 0.5rem; text-align: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.3rem;">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <div style="font-size:0.82rem; color:var(--text-muted); font-weight:500;">No expenses logged for this period.</div>
        </div>
      `;
    }
    return;
  }

  const circumference = 263.893; // 2 * PI * 42
  let currentOffset = 0;
  let circlesHTML = `<circle cx="60" cy="60" r="42" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="16" />`;

  breakdown.forEach((cat, idx) => {
    const color = cat.color || fallbackColors[idx % fallbackColors.length];
    const pct = Number(cat.percentage) || 0;
    const dashLen = (pct / 100) * circumference;
    const dashArray = `${dashLen.toFixed(1)} ${circumference.toFixed(1)}`;
    const dashOffset = (-currentOffset).toFixed(1);
    currentOffset += dashLen;

    circlesHTML += `
      <circle cx="60" cy="60" r="42" fill="none"
              stroke="${color}" stroke-width="16"
              stroke-dasharray="${dashArray}"
              stroke-dashoffset="${dashOffset}"
              style="transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;" />
    `;
  });

  if (donutSvg) donutSvg.innerHTML = circlesHTML;

  if (catContainer) {
    catContainer.innerHTML = breakdown.map((cat, idx) => {
      const color = cat.color || fallbackColors[idx % fallbackColors.length];
      return `
        <div class="legend-row">
          <span class="legend-dot" style="background:${color};"></span>
          <span class="legend-name">${escapeHTML(cat.category_name)}</span>
          <span class="legend-pct">${cat.percentage}%</span>
          <span class="legend-val">${formatCurrency(cat.total, currencyCode)}</span>
        </div>
      `;
    }).join('');
  }
}

function renderSmartInsight(summary, categoryBreakdown, currencyCode) {
  const insightTextEl = document.getElementById('smart-insight-text');
  if (!insightTextEl) return;

  const totalExpense = summary ? Number(summary.total_expense) || 0 : 0;
  const totalIncome = summary ? Number(summary.total_income) || 0 : 0;

  if (categoryBreakdown && Array.isArray(categoryBreakdown) && categoryBreakdown.length > 0 && totalExpense > 0) {
    const topCat = categoryBreakdown[0];
    insightTextEl.innerHTML = `
      Your highest spending category this period is <strong style="color:var(--text-main);">${escapeHTML(topCat.category_name)}</strong>, accounting for <strong style="color:#F43F5E;">${topCat.percentage}%</strong> (${formatCurrency(topCat.total, currencyCode)}) of your total expenses.
    `;
  } else if (totalIncome > 0 && totalExpense === 0) {
    insightTextEl.innerHTML = `
      Great job! You recorded <strong style="color:#10B981;">${formatCurrency(totalIncome, currencyCode)}</strong> in total income with zero expenses logged this period.
    `;
  } else {
    insightTextEl.innerHTML = `
      Not enough spending data to generate an insight yet. Start logging your transactions to see smart personalized insights.
    `;
  }
}


function renderFavoritesWidget(favs, currencyCode, timeframe) {
  const container = document.getElementById('favorites-chips-container');
  if (!container) return;

  if (!favs || favs.length === 0) {
    container.innerHTML = `
      <button type="button" id="btn-empty-create-shortcut" style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.45rem 0.85rem; background:transparent; border:1px dashed var(--glass-border); border-radius:20px; color:var(--text-muted); font-size:0.82rem; font-weight:600; cursor:pointer; white-space:nowrap; transition:all 0.2s ease;">
        + Create Shortcut
      </button>
    `;
    setTimeout(() => {
      const btn = document.getElementById('btn-empty-create-shortcut');
      if (btn) btn.addEventListener('click', () => {
        const manageBtn = document.getElementById('btn-manage-favorites');
        if (manageBtn) manageBtn.click();
      });
    }, 0);
    return;
  }

  container.innerHTML = favs.map(f => `
    <button type="button" class="fav-chip-btn" data-fav='${JSON.stringify(f).replace(/'/g, "&apos;").replace(/"/g, "&quot;")}' style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.45rem 0.85rem; background:rgba(255,255,255,0.06); border:1px solid var(--glass-border); border-radius:20px; color:var(--text-main); font-size:0.82rem; font-weight:600; cursor:pointer; white-space:nowrap; transition:all 0.2s ease;">
      <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:${f.category_color || '#3b82f6'};"></span>
      <span>${escapeHTML(f.name)}</span>
      <span style="color:${f.type === 'INCOME' ? '#10b981' : 'var(--text-muted)'}; font-size:0.75rem;">(${f.type === 'INCOME' ? '+' : ''}${formatCurrency(f.amount, currencyCode)})</span>
    </button>
  `).join('');

  container.querySelectorAll('.fav-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = JSON.parse(btn.dataset.fav);
      openTransactionModal({
        initialData: {
          type: f.type,
          amount: f.amount,
          category_id: f.category_id,
          payment_method: f.payment_method,
          note: f.note || f.name
        },
        onSuccess: async () => {
          await loadDashboardData(timeframe, currencyCode);
        }
      });
    });
  });
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

