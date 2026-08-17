import APIClient from '../api.js';
import { formatCurrency } from '../currency.js';
import { authManager } from '../auth.js';

let currentTimeframe = 'month';

export async function renderReportsView(container) {
  const currencyCode = authManager.getUserCurrency();

  container.innerHTML = `
    <div class="reports-page-container">
      <!-- Header Section -->
      <div class="reports-header-row">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <h1 class="reports-title">Financial Reports</h1>
            <span class="reports-badge">API POWERED</span>
          </div>
          <p class="reports-subtitle">In-depth financial analysis, monthly trends, and downloadable transaction statements</p>
        </div>

        <div class="reports-actions">
          <select id="report-timeframe-select" class="form-control" style="padding:0.5rem 0.85rem; border-radius:10px; font-weight:600; background:var(--bg-card); color:var(--text-main); border:1px solid var(--glass-border);">
            <option value="month" selected>This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <button id="btn-export-csv-report" class="btn btn-emerald" style="display:inline-flex; align-items:center; gap:0.45rem; padding:0.55rem 1rem; border-radius:10px; font-weight:700;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <!-- Main Report Content -->
      <div id="reports-content-container">
        <div style="padding:3.5rem; text-align:center; color:var(--text-muted); background:var(--bg-card); border:1px solid var(--glass-border); border-radius:20px;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="animation: spin 1s linear infinite; margin-bottom:0.75rem;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          <div style="font-weight:600; font-size:0.95rem;">Generating financial report...</div>
        </div>
      </div>
    </div>
  `;

  // Attach CSV Export Handler
  document.getElementById('btn-export-csv-report')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-export-csv-report');
    try {
      btn.disabled = true;
      btn.innerHTML = `<span>Exporting...</span>`;
      await APIClient.exportTransactionsCsv({ range_type: currentTimeframe });
      if (window.showToast) window.showToast('CSV report exported successfully!', 'success');
    } catch (err) {
      if (window.showToast) window.showToast(err.message || 'Failed to export CSV report', 'error');
      else alert(err.message || 'Failed to export CSV report');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Export CSV</span>
      `;
    }
  });

  // Timeframe selector listener
  const timeframeSelect = document.getElementById('report-timeframe-select');
  timeframeSelect?.addEventListener('change', (e) => {
    currentTimeframe = e.target.value;
    loadReportsData(currentTimeframe, currencyCode);
  });

  await loadReportsData(currentTimeframe, currencyCode);
}

async function loadReportsData(timeframe, currencyCode) {
  const container = document.getElementById('reports-content-container');

  try {
    const [summary, budgetSummary] = await Promise.all([
      APIClient.getDashboardSummary(timeframe).catch(() => null),
      APIClient.getBudgetSummary().catch(() => null)
    ]);

    const metrics = summary ? summary.metrics : null;
    const catBreakdown = (summary && summary.category_breakdown) ? summary.category_breakdown.filter(c => c.type === 'EXPENSE') : [];
    const monthlyTrend = (summary && summary.monthly_trend) ? summary.monthly_trend : [];

    const totalIncome = metrics ? parseFloat(metrics.total_income || 0) : 0;
    const totalExpenses = metrics ? parseFloat(metrics.total_expenses || 0) : 0;
    const netSavings = metrics ? parseFloat(metrics.net_savings || 0) : 0;
    const savingsRate = metrics ? parseFloat(metrics.savings_rate || 0) : 0;

    if (totalIncome === 0 && totalExpenses === 0 && catBreakdown.length === 0 && monthlyTrend.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:3.5rem 1.5rem; text-align:center; background:var(--bg-card); border:1px solid var(--glass-border); border-radius:22px;">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.75rem;">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.35rem;">No transaction data for selected timeframe</h3>
          <p style="font-size:0.88rem; color:var(--text-muted); max-width:400px; margin:0 auto 1.25rem auto;">Record transactions or change the timeframe selector above to generate detailed financial reports.</p>
          <a href="#transactions?action=new" class="btn btn-primary" style="padding:0.55rem 1.25rem; font-weight:700; border-radius:12px; text-decoration:none; display:inline-block;">+ Add Transaction</a>
        </div>
      `;
      return;
    }

    // Calculate Month-over-Month changes if at least 2 trend periods exist
    let momHtml = '';
    if (monthlyTrend.length >= 2) {
      const currentMonth = monthlyTrend[monthlyTrend.length - 1];
      const previousMonth = monthlyTrend[monthlyTrend.length - 2];

      const incDiff = parseFloat(currentMonth.income) - parseFloat(previousMonth.income);
      const incPct = parseFloat(previousMonth.income) > 0 ? (incDiff / parseFloat(previousMonth.income)) * 100 : 0;

      const expDiff = parseFloat(currentMonth.expenses) - parseFloat(previousMonth.expenses);
      const expPct = parseFloat(previousMonth.expenses) > 0 ? (expDiff / parseFloat(previousMonth.expenses)) * 100 : 0;

      const savDiff = parseFloat(currentMonth.savings) - parseFloat(previousMonth.savings);
      const savPct = parseFloat(previousMonth.savings) !== 0 ? (savDiff / Math.abs(parseFloat(previousMonth.savings))) * 100 : 0;

      momHtml = `
        <div class="reports-section-card" style="margin-bottom:1.5rem;">
          <div class="reports-section-header">
            <h3>Month-over-Month Comparison</h3>
            <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">${escapeHTML(previousMonth.month)} vs ${escapeHTML(currentMonth.month)}</span>
          </div>

          <div class="reports-summary-grid" style="margin-bottom:0;">
            <div class="reports-card">
              <span class="reports-card-label">Income Growth</span>
              <span class="reports-card-value ${incDiff >= 0 ? 'income' : 'expense'}">${incPct >= 0 ? '+' : ''}${incPct.toFixed(1)}%</span>
              <span class="reports-card-sub">${formatCurrency(incDiff, currencyCode)} vs prev month</span>
            </div>

            <div class="reports-card">
              <span class="reports-card-label">Expense Change</span>
              <span class="reports-card-value ${expDiff <= 0 ? 'income' : 'expense'}">${expPct >= 0 ? '+' : ''}${expPct.toFixed(1)}%</span>
              <span class="reports-card-sub">${formatCurrency(expDiff, currencyCode)} vs prev month</span>
            </div>

            <div class="reports-card">
              <span class="reports-card-label">Net Savings Change</span>
              <span class="reports-card-value ${savDiff >= 0 ? 'income' : 'expense'}">${savPct >= 0 ? '+' : ''}${savPct.toFixed(1)}%</span>
              <span class="reports-card-sub">${formatCurrency(savDiff, currencyCode)} vs prev month</span>
            </div>
          </div>
        </div>
      `;
    }

    // Determine max value for trend chart scaling
    const maxVal = Math.max(1, ...monthlyTrend.flatMap(m => [parseFloat(m.income), parseFloat(m.expenses)]));

    container.innerHTML = `
      <!-- Financial Overview Summary Cards -->
      <div class="reports-summary-grid">
        <div class="reports-card">
          <span class="reports-card-label">Total Income</span>
          <span class="reports-card-value income">${formatCurrency(totalIncome, currencyCode)}</span>
          <span class="reports-card-sub">${timeframe.toUpperCase()} timeframe</span>
        </div>

        <div class="reports-card">
          <span class="reports-card-label">Total Expenses</span>
          <span class="reports-card-value expense">${formatCurrency(totalExpenses, currencyCode)}</span>
          <span class="reports-card-sub">${timeframe.toUpperCase()} timeframe</span>
        </div>

        <div class="reports-card">
          <span class="reports-card-label">Net Savings</span>
          <span class="reports-card-value ${netSavings >= 0 ? 'income' : 'expense'}">${formatCurrency(netSavings, currencyCode)}</span>
          <span class="reports-card-sub">Income minus expenses</span>
        </div>

        <div class="reports-card">
          <span class="reports-card-label">Savings Rate</span>
          <span class="reports-card-value" style="color:#6366F1;">${savingsRate.toFixed(1)}%</span>
          <span class="reports-card-sub">${savingsRate >= 20 ? 'Optimal target reached' : 'Below 20% target'}</span>
        </div>
      </div>

      <!-- Month-over-Month Comparison -->
      ${momHtml}

      <!-- Income vs Expenses Visual Trend Chart -->
      <div class="reports-section-card" style="margin-bottom:1.5rem;">
        <div class="reports-section-header">
          <h3>Income vs Expenses Trend</h3>
          <div style="display:flex; gap:1rem; font-size:0.78rem; font-weight:700;">
            <span style="color:#10B981; display:inline-flex; align-items:center; gap:0.3rem;"><span style="width:10px; height:10px; border-radius:3px; background:#10B981;"></span> Income</span>
            <span style="color:#F43F5E; display:inline-flex; align-items:center; gap:0.3rem;"><span style="width:10px; height:10px; border-radius:3px; background:#F43F5E;"></span> Expenses</span>
          </div>
        </div>

        ${monthlyTrend.length > 0 ? `
          <div class="report-trend-chart">
            ${monthlyTrend.map(m => {
              const inc = parseFloat(m.income);
              const exp = parseFloat(m.expenses);
              const incPct = Math.min(100, Math.max(4, (inc / maxVal) * 100));
              const expPct = Math.min(100, Math.max(4, (exp / maxVal) * 100));

              return `
                <div class="report-trend-col">
                  <div class="report-trend-bars">
                    <div class="report-bar income" style="height:${incPct}%;" title="Income: ${formatCurrency(inc, currencyCode)}"></div>
                    <div class="report-bar expense" style="height:${expPct}%;" title="Expenses: ${formatCurrency(exp, currencyCode)}"></div>
                  </div>
                  <span class="report-trend-label">${escapeHTML(m.month)}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : '<p style="color:var(--text-muted); font-size:0.85rem;">No trend data available for this timeframe.</p>'}
      </div>

      <div class="reports-two-col-grid">
        <!-- Expense Category Breakdown -->
        <div class="reports-section-card">
          <div class="reports-section-header">
            <h3>Category Breakdown</h3>
            <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Spending Distribution</span>
          </div>

          ${catBreakdown.length > 0 ? `
            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              ${catBreakdown.map(cat => `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">
                    <span style="color:var(--text-main); display:inline-flex; align-items:center; gap:0.4rem;">
                      <span style="font-size:1rem;">${cat.category_icon || '💳'}</span>
                      ${escapeHTML(cat.category_name)}
                    </span>
                    <span style="color:var(--text-muted);">${formatCurrency(parseFloat(cat.amount), currencyCode)} (${cat.percentage.toFixed(1)}%)</span>
                  </div>
                  <div class="report-bar-track">
                    <div class="report-bar-fill" style="width:${Math.min(100, Math.max(0, cat.percentage))}%; background:${cat.category_color || '#6366F1'};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color:var(--text-muted); font-size:0.85rem;">No expense categories for this period.</p>'}
        </div>

        <!-- Budget Performance Overview -->
        <div class="reports-section-card">
          <div class="reports-section-header">
            <h3>Budget Performance Report</h3>
            <a href="#budgets" style="font-size:0.8rem; color:#10B981; font-weight:700; text-decoration:none;">Manage Budgets &rarr;</a>
          </div>

          ${budgetSummary && parseFloat(budgetSummary.total_budget_limit || 0) > 0 ? `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:14px; padding:1.1rem; margin-bottom:1rem;">
              <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.4rem;">
                <span style="font-size:0.82rem; font-weight:600; color:var(--text-muted);">Total Budget Allocation</span>
                <span style="font-size:1.05rem; font-weight:800; color:${budgetSummary.overall_percentage_used >= 100 ? '#F43F5E' : '#10B981'};">
                  ${budgetSummary.overall_percentage_used.toFixed(1)}% Used
                </span>
              </div>
              <div class="report-bar-track" style="height:10px; margin-bottom:0.5rem;">
                <div class="report-bar-fill" style="width:${Math.min(100, Math.max(0, budgetSummary.overall_percentage_used))}%; background:${budgetSummary.overall_percentage_used >= 100 ? '#F43F5E' : '#10B981'};"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
                <span>Spent: ${formatCurrency(parseFloat(budgetSummary.total_budget_spend), currencyCode)}</span>
                <span>Limit: ${formatCurrency(parseFloat(budgetSummary.total_budget_limit), currencyCode)}</span>
              </div>
            </div>
          ` : `
            <div style="padding:1.25rem; text-align:center; background:rgba(255,255,255,0.02); border:1px dashed var(--glass-border); border-radius:14px;">
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">No active budget limits configured for budget reporting.</p>
              <a href="#budgets" class="btn btn-secondary" style="padding:0.4rem 0.85rem; font-size:0.8rem; font-weight:700; text-decoration:none; display:inline-block;">+ Set Budget Limits</a>
            </div>
          `}
        </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="empty-state" style="padding:2.5rem; text-align:center; background:var(--bg-card); border:1px solid rgba(244,63,94,0.3); border-radius:20px;">
        <h3 style="color:#F43F5E; font-size:1.05rem; font-weight:700; margin-bottom:0.4rem;">Failed to load financial report</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">${escapeHTML(err.message || 'An error occurred while compiling report data.')}</p>
        <button id="retry-reports-btn" class="btn btn-primary" style="padding:0.45rem 1rem; border-radius:10px; background:#6366F1; border:none; color:#FFF; font-weight:700;">Retry Report</button>
      </div>
    `;
    container.querySelector('#retry-reports-btn')?.addEventListener('click', () => loadReportsData(timeframe, currencyCode));
  }
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
