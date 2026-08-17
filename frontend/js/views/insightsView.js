import APIClient from '../api.js';
import { formatCurrency } from '../currency.js';
import { authManager } from '../auth.js';

export async function renderInsightsView(container) {
  const currencyCode = authManager.getUserCurrency();

  container.innerHTML = `
    <div class="insights-page-container">
      <!-- Header Section -->
      <div class="insights-header-row">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <h1 class="insights-title">Financial Insights</h1>
            <span class="insights-badge">REAL-TIME</span>
          </div>
          <p class="insights-subtitle">Data-driven analytics and smart recommendations derived from your account activity</p>
        </div>
      </div>

      <!-- Main Insights View Grid -->
      <div id="insights-content-container">
        <div style="padding:3rem; text-align:center; color:var(--text-muted); background:var(--bg-card); border:1px solid var(--glass-border); border-radius:20px;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="animation: spin 1s linear infinite; margin-bottom:0.75rem;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          <div style="font-weight:600; font-size:0.95rem;">Analyzing your financial metrics...</div>
        </div>
      </div>
    </div>
  `;

  await loadInsightsData(currencyCode);
}

async function loadInsightsData(currencyCode) {
  const contentContainer = document.getElementById('insights-content-container');

  try {
    const [dashboardSummary, pulseData, budgetSummary] = await Promise.all([
      APIClient.getDashboardSummary('month').catch(() => null),
      APIClient.getPulse().catch(() => null),
      APIClient.getBudgetSummary().catch(() => null)
    ]);

    const metrics = dashboardSummary ? dashboardSummary.metrics : null;
    const catBreakdown = (dashboardSummary && dashboardSummary.category_breakdown) ? dashboardSummary.category_breakdown.filter(c => c.type === 'EXPENSE') : [];

    const totalIncome = metrics ? parseFloat(metrics.total_income || 0) : 0;
    const totalExpenses = metrics ? parseFloat(metrics.total_expenses || 0) : 0;
    const netSavings = metrics ? parseFloat(metrics.net_savings || 0) : 0;
    const savingsRate = metrics ? parseFloat(metrics.savings_rate || 0) : 0;

    const pulseScore = pulseData ? (pulseData.score || 0) : null;
    const pulseGrade = pulseData ? (pulseData.grade || 'Fair') : 'Fair';
    const primaryInsight = pulseData ? pulseData.primary_insight : null;
    const factors = (pulseData && pulseData.factor_breakdown) ? pulseData.factor_breakdown : [];

    const totalBudgetLimit = budgetSummary ? parseFloat(budgetSummary.total_budget_limit || 0) : 0;
    const totalBudgetSpend = budgetSummary ? parseFloat(budgetSummary.total_budget_spend || 0) : 0;
    const budgetPct = budgetSummary ? parseFloat(budgetSummary.overall_percentage_used || 0) : 0;
    const catBudgets = budgetSummary ? (budgetSummary.category_budgets || []) : [];

    if (totalIncome === 0 && totalExpenses === 0 && (!pulseScore || pulseScore === 0) && catBreakdown.length === 0) {
      contentContainer.innerHTML = `
        <div class="empty-state" style="padding:3.5rem 1.5rem; text-align:center; background:var(--bg-card); border:1px solid var(--glass-border); border-radius:22px;">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.75rem;">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.35rem;">Not enough financial data yet</h3>
          <p style="font-size:0.88rem; color:var(--text-muted); max-width:380px; margin:0 auto 1.25rem auto;">Record transactions and set up accounts to unlock data-driven financial insights and personalized health analytics.</p>
          <a href="#transactions?action=new" class="btn btn-primary" style="padding:0.55rem 1.25rem; font-weight:700; border-radius:12px; text-decoration:none; display:inline-block;">+ Add First Transaction</a>
        </div>
      `;
      return;
    }

    // Top Category Spending Insight calculation
    let topExpenseCat = null;
    if (catBreakdown.length > 0) {
      topExpenseCat = catBreakdown.reduce((max, c) => (parseFloat(c.amount) > parseFloat(max.amount) ? c : max), catBreakdown[0]);
    }

    // Find weakest Pulse Factor if available
    let weakestFactor = null;
    if (factors.length > 0) {
      weakestFactor = factors.reduce((min, f) => (f.score < min.score ? f : min), factors[0]);
    }

    contentContainer.innerHTML = `
      <!-- Financial Overview Snapshot -->
      <div class="insights-summary-grid">
        <div class="insights-card">
          <span class="insights-card-label">Monthly Income</span>
          <span class="insights-card-value income">${formatCurrency(totalIncome, currencyCode)}</span>
          <span class="insights-card-sub">Current UTC month</span>
        </div>

        <div class="insights-card">
          <span class="insights-card-label">Monthly Expenses</span>
          <span class="insights-card-value expense">${formatCurrency(totalExpenses, currencyCode)}</span>
          <span class="insights-card-sub">Current UTC month</span>
        </div>

        <div class="insights-card">
          <span class="insights-card-label">Net Savings</span>
          <span class="insights-card-value ${netSavings >= 0 ? 'income' : 'expense'}">${formatCurrency(netSavings, currencyCode)}</span>
          <span class="insights-card-sub">${savingsRate.toFixed(1)}% savings rate</span>
        </div>

        <div class="insights-card">
          <span class="insights-card-label">Finora Pulse Score</span>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.25rem;">
            <span class="insights-card-value" style="color:#10B981;">${pulseScore !== null ? pulseScore : '--'}/100</span>
            <span class="pulse-grade-pill">${escapeHTML(pulseGrade)}</span>
          </div>
          <span class="insights-card-sub">Based on 4 health factors</span>
        </div>
      </div>

      <!-- Primary Key Insight Banner -->
      ${primaryInsight ? `
        <div class="primary-insight-banner">
          <div class="primary-insight-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">
              <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:#10B981; letter-spacing:0.05em;">Smart Financial Recommendation</span>
            </div>
            <h3 style="font-size:1.1rem; font-weight:800; color:var(--text-main); margin-bottom:0.35rem;">${escapeHTML(primaryInsight.title)}</h3>
            <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.5; margin:0;">${escapeHTML(primaryInsight.description)}</p>
          </div>
          ${primaryInsight.action_label ? `
            <a href="#pulse" class="btn btn-emerald" style="padding:0.55rem 1rem; font-size:0.85rem; font-weight:700; border-radius:10px; text-decoration:none; align-self:center; flex-shrink:0;">
              ${escapeHTML(primaryInsight.action_label)} &rarr;
            </a>
          ` : ''}
        </div>
      ` : ''}

      <div class="insights-two-col-grid">
        <!-- Spending Breakdown & Category Share -->
        <div class="insights-section-card">
          <div class="insights-section-header">
            <h3>Top Expense Categories</h3>
            <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Monthly Breakdown</span>
          </div>

          ${topExpenseCat ? `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:14px; padding:1rem; margin-bottom:1.2rem; display:flex; align-items:center; gap:0.85rem;">
              <div style="width:40px; height:40px; border-radius:10px; background:${topExpenseCat.category_color || '#6366F1'}20; color:${topExpenseCat.category_color || '#6366F1'}; display:flex; align-items:center; justify-content:center; font-size:1.2rem; font-weight:800;">
                ${topExpenseCat.category_icon || '💳'}
              </div>
              <div style="flex:1;">
                <div style="font-size:0.78rem; font-weight:600; color:var(--text-muted);">Highest Single Expense Focus</div>
                <div style="font-size:1rem; font-weight:800; color:var(--text-main);">${escapeHTML(topExpenseCat.category_name)}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:1.05rem; font-weight:800; color:#F43F5E;">${formatCurrency(parseFloat(topExpenseCat.amount), currencyCode)}</div>
                <div style="font-size:0.78rem; font-weight:700; color:var(--text-muted);">${topExpenseCat.percentage.toFixed(1)}% of total</div>
              </div>
            </div>
          ` : ''}

          ${catBreakdown.length > 0 ? `
            <div style="display:flex; flex-direction:column; gap:0.85rem;">
              ${catBreakdown.slice(0, 5).map(cat => `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; margin-bottom:0.3rem;">
                    <span style="color:var(--text-main); display:inline-flex; align-items:center; gap:0.4rem;">
                      <span style="width:8px; height:8px; border-radius:50%; background:${cat.category_color || '#64748b'};"></span>
                      ${escapeHTML(cat.category_name)}
                    </span>
                    <span style="color:var(--text-muted);">${formatCurrency(parseFloat(cat.amount), currencyCode)} (${cat.percentage.toFixed(1)}%)</span>
                  </div>
                  <div class="insight-bar-track">
                    <div class="insight-bar-fill" style="width:${Math.min(100, Math.max(0, cat.percentage))}%; background:${cat.category_color || '#6366F1'};"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color:var(--text-muted); font-size:0.85rem;">No expense categories recorded for this month.</p>'}
        </div>

        <!-- Budget & Spending Discipline -->
        <div class="insights-section-card">
          <div class="insights-section-header">
            <h3>Budget Adherence & Limits</h3>
            <a href="#budgets" style="font-size:0.8rem; color:#10B981; font-weight:700; text-decoration:none;">View Budgets &rarr;</a>
          </div>

          ${totalBudgetLimit > 0 ? `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--glass-border); border-radius:14px; padding:1.1rem; margin-bottom:1.2rem;">
              <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.4rem;">
                <span style="font-size:0.82rem; font-weight:600; color:var(--text-muted);">Overall Monthly Budget Spend</span>
                <span style="font-size:1.05rem; font-weight:800; color:${budgetPct >= 100 ? '#F43F5E' : (budgetPct >= 80 ? '#F59E0B' : '#10B981')};">${budgetPct.toFixed(1)}%</span>
              </div>
              <div class="insight-bar-track" style="height:10px; margin-bottom:0.5rem;">
                <div class="insight-bar-fill" style="width:${Math.min(100, Math.max(0, budgetPct))}%; background:${budgetPct >= 100 ? 'linear-gradient(90deg, #F43F5E, #E11D48)' : (budgetPct >= 80 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #10B981, #059669)')};"></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted);">
                <span>Spent: ${formatCurrency(totalBudgetSpend, currencyCode)}</span>
                <span>Limit: ${formatCurrency(totalBudgetLimit, currencyCode)}</span>
              </div>
            </div>
          ` : `
            <div style="padding:1.25rem; text-align:center; background:rgba(255,255,255,0.02); border:1px dashed var(--glass-border); border-radius:14px; margin-bottom:1.2rem;">
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">No overall budget configured. Setting limits helps control monthly expenses.</p>
              <a href="#budgets" class="btn btn-secondary" style="padding:0.4rem 0.85rem; font-size:0.8rem; font-weight:700; text-decoration:none; display:inline-block;">+ Configure Budget</a>
            </div>
          `}

          <!-- Category Budget Warnings -->
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <h4 style="font-size:0.88rem; font-weight:700; color:var(--text-main); margin:0;">Category Budget Alerts</h4>
            ${catBudgets.length > 0 ? catBudgets.map(b => {
              const pct = b.percentage_used || 0;
              const isExceeded = b.is_exceeded;
              const isWarning = b.is_warning;
              return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0.8rem; background:rgba(255,255,255,0.02); border-radius:10px; border:1px solid var(--glass-border);">
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span class="budget-status-pill ${isExceeded ? 'exceeded' : (isWarning ? 'warning' : 'healthy')}">
                      ${isExceeded ? 'Exceeded' : (isWarning ? 'Near Limit' : 'Healthy')}
                    </span>
                    <span style="font-size:0.85rem; font-weight:600; color:var(--text-main);">
                      ${b.category_id ? 'Category Budget' : 'Overall'}
                    </span>
                  </div>
                  <span style="font-size:0.85rem; font-weight:700; color:${isExceeded ? '#F43F5E' : 'var(--text-main)'};">
                    ${pct.toFixed(1)}% used
                  </span>
                </div>
              `;
            }).join('') : '<p style="color:var(--text-muted); font-size:0.82rem; margin:0;">No category budget limits set.</p>'}
          </div>
        </div>
      </div>

      <!-- Actionable Health Recommendations derived from factors -->
      ${factors.length > 0 ? `
        <div class="insights-section-card" style="margin-top:1.5rem;">
          <div class="insights-section-header">
            <h3>Finora Pulse Factor Recommendations</h3>
            <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Weighted Financial Health Drivers</span>
          </div>

          <div class="factors-recommendations-grid">
            ${factors.map(f => `
              <div class="factor-recommendation-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                  <h4 style="font-size:0.92rem; font-weight:700; color:var(--text-main); margin:0;">${escapeHTML(f.factor_name)}</h4>
                  <span style="font-size:0.85rem; font-weight:800; color:${f.score >= 80 ? '#10B981' : (f.score >= 60 ? '#F59E0B' : '#F43F5E')}">${f.score}/100</span>
                </div>
                <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.45; margin-bottom:0.6rem;">${escapeHTML(f.explanation)}</p>
                <div style="font-size:0.8rem; font-weight:600; color:#10B981; background:rgba(16,185,129,0.08); padding:0.45rem 0.65rem; border-radius:8px; border:1px solid rgba(16,185,129,0.2);">
                  💡 ${escapeHTML(f.recommendation)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

  } catch (err) {
    console.error(err);
    contentContainer.innerHTML = `
      <div class="empty-state" style="padding:2.5rem; text-align:center; background:var(--bg-card); border:1px solid rgba(244,63,94,0.3); border-radius:20px;">
        <h3 style="color:#F43F5E; font-size:1.05rem; font-weight:700; margin-bottom:0.4rem;">Failed to load financial insights</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">${escapeHTML(err.message || 'An error occurred while analyzing financial metrics.')}</p>
        <button id="retry-insights-btn" class="btn btn-primary" style="padding:0.45rem 1rem; border-radius:10px; background:#6366F1; border:none; color:#FFF; font-weight:700;">Retry Analysis</button>
      </div>
    `;
    contentContainer.querySelector('#retry-insights-btn')?.addEventListener('click', () => loadInsightsData(currencyCode));
  }
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
