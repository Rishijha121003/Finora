import APIClient from '../api.js';

export async function renderPulseView(container) {
  const currencyCode = (window.authManager && window.authManager.getUserCurrency)
    ? window.authManager.getUserCurrency()
    : 'INR';

  function formatCurr(amount) {
    if (window.formatCurrency) return window.formatCurrency(amount, currencyCode);
    return `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  // Render initial Skeleton Loading State
  container.innerHTML = `
    <div class="pulse-v2-page">
      <!-- Top Header Bar -->
      <div class="pulse-v2-header-bar">
        <div>
          <h1 class="pulse-v2-page-title">Finora Pulse</h1>
          <p class="pulse-v2-page-sub">Your financial health score and personalized insights</p>
        </div>
        <a href="#dashboard" class="btn btn-secondary pulse-v2-back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>Back to Dashboard</span>
        </a>
      </div>

      <!-- Loading Placeholder -->
      <div class="card pulse-v2-hero-card" style="padding: 2.5rem; text-align: center;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.8rem; color: var(--text-muted);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          <div style="font-size: 0.9rem; font-weight: 600;">Calculating your Finora Pulse score...</div>
        </div>
      </div>
    </div>
  `;

  try {
    const [pulseData, monthSummary] = await Promise.all([
      APIClient.getPulse().catch(err => {
        console.error('Pulse API fetch failed:', err);
        return null;
      }),
      APIClient.getDashboardSummary('month').catch(err => {
        console.error('Month Summary fetch failed:', err);
        return null;
      })
    ]);

    if (!pulseData) {
      container.innerHTML = `
        <div class="pulse-v2-page">
          <div class="pulse-v2-header-bar">
            <div>
              <h1 class="pulse-v2-page-title">Finora Pulse</h1>
              <p class="pulse-v2-page-sub">Your financial health score and personalized insights</p>
            </div>
            <a href="#dashboard" class="btn btn-secondary pulse-v2-back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              <span>Back to Dashboard</span>
            </a>
          </div>
          <div class="card pulse-v2-hero-card" style="padding: 2.5rem; text-align: center;">
            <div style="color: #F43F5E; font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;">Unable to load Pulse Score</div>
            <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.2rem;">An error occurred while fetching your financial health metrics.</p>
            <button type="button" class="btn btn-primary" onclick="window.location.reload()">Retry</button>
          </div>
        </div>
      `;
      return;
    }

    // Process overall score and status
    const score = Math.round(pulseData.overall_score || 0);
    const scoreLabel = pulseData.score_label || 'Good';
    const hasSufficientData = pulseData.has_sufficient_data !== false;
    const dataWindowStr = pulseData.data_window || '3 months';

    // Color theme mapping
    const colorMap = {
      'green': { hex: '#10B981', label: 'EXCELLENT', bg: 'rgba(16, 185, 129, 0.15)' },
      'blue': { hex: '#3B82F6', label: 'GOOD', bg: 'rgba(59, 130, 246, 0.15)' },
      'orange': { hex: '#F59E0B', label: 'FAIR', bg: 'rgba(245, 158, 11, 0.15)' },
      'red': { hex: '#F43F5E', label: 'NEEDS ATTENTION', bg: 'rgba(244, 63, 94, 0.15)' },
      'gray': { hex: '#94A3B8', label: 'INSUFFICIENT DATA', bg: 'rgba(148, 163, 184, 0.15)' }
    };
    const theme = colorMap[pulseData.score_color] || colorMap['green'];

    // Circumference for r=65 is 2 * PI * 65 = ~408.4
    const circumference = 408.4;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    // Define fixed backend factors configuration
    const factorConfigs = [
      {
        key: 'Saving Behavior',
        weight: 35,
        iconCls: 'green',
        iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>`
      },
      {
        key: 'Expense Control',
        weight: 30,
        iconCls: 'blue',
        iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
      },
      {
        key: 'Budget Discipline',
        weight: 20,
        iconCls: 'purple',
        iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`
      },
      {
        key: 'Balance Stability',
        weight: 15,
        iconCls: 'orange',
        iconSvg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 12l-4-4-4 4M12 8v8"/></svg>`
      }
    ];

    // Map factors from backend response
    const factorDataMap = {};
    if (pulseData.factors && Array.isArray(pulseData.factors)) {
      pulseData.factors.forEach(f => {
        factorDataMap[f.name] = f;
      });
    }

    // Process Snapshot figures
    const inc = monthSummary && monthSummary.summary ? Number(monthSummary.summary.total_income) || 0 : 0;
    const exp = monthSummary && monthSummary.summary ? Number(monthSummary.summary.total_expense) || 0 : 0;
    const saved = inc - exp;
    const savingsRate = inc > 0 ? ((saved / inc) * 100).toFixed(1) : '0.0';

    // Render Full Page Markup
    container.innerHTML = `
      <div class="pulse-v2-page">
        <!-- Top Header Bar -->
        <div class="pulse-v2-header-bar">
          <div>
            <h1 class="pulse-v2-page-title">Finora Pulse</h1>
            <p class="pulse-v2-page-sub">Your financial health score and personalized insights</p>
          </div>
          <a href="#dashboard" class="btn btn-secondary pulse-v2-back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            <span>Back to Dashboard</span>
          </a>
        </div>

        ${!hasSufficientData ? `
          <div class="card" style="padding: 1.2rem 1.5rem; margin-bottom: 1.25rem; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; display: flex; align-items: center; gap: 1rem;">
            <div style="font-size: 1.5rem;">⚠️</div>
            <div style="font-size: 0.88rem; color: var(--text-main);">
              <strong>Insufficient Data:</strong> Log at least 3 transactions to generate an accurate personalized Pulse score. Defaulting to baseline data.
            </div>
          </div>
        ` : ''}

        <!-- Hero Section Card -->
        <div class="card pulse-v2-hero-card" id="pulse-hero-card">
          <div class="pulse-hero-left">
            <!-- Score Circular Gauge Graphic -->
            <div class="pulse-hero-gauge">
              <svg viewBox="0 0 160 160" class="pulse-hero-gauge-svg">
                <circle cx="80" cy="80" r="65" class="pulse-hero-bg-ring" />
                <circle cx="80" cy="80" r="65" class="pulse-hero-score-ring" id="pulse-hero-score-ring"
                        style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset}; stroke: ${theme.hex};" />
              </svg>
              <div class="pulse-hero-gauge-content">
                <div class="pulse-hero-score-num" id="pulse-hero-score-num" style="color: ${theme.hex};">${score}</div>
                <div class="pulse-hero-score-max">/100</div>
              </div>
            </div>

            <!-- Hero Score Info Column -->
            <div class="pulse-hero-info">
              <span class="pulse-hero-grade-tag" id="pulse-hero-grade-tag" style="color: ${theme.hex}; background: ${theme.bg};">${escapeHTML(scoreLabel.toUpperCase())}</span>
              <div class="pulse-hero-headline">
                <span class="pulse-hero-score-inline" id="pulse-hero-score-inline">${score}</span>
                <span class="pulse-hero-score-denom">/100</span>
              </div>
              <h2 class="pulse-hero-title" id="pulse-hero-title">Your financial health is ${escapeHTML(scoreLabel.toLowerCase())}! 🎉</h2>
              <p class="pulse-hero-desc" id="pulse-hero-desc">${escapeHTML(pulseData.summary || 'Finora evaluates your saving, expense control, budget discipline, and balance stability.')}</p>

              <div class="pulse-hero-delta-pill" id="pulse-hero-delta-pill">
                <span class="delta-badge neutral">3-Month Window</span>
                <span class="delta-text">Calculated over rolling ${escapeHTML(dataWindowStr)} history</span>
              </div>
            </div>
          </div>

          <!-- Hero Right Accent Graphic -->
          <div class="pulse-hero-right-accent">
            <div class="pulse-shield-box">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="${theme.hex}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="pulse-shield-svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="7 12 10 15 17 9"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Main Pulse 2-Column Section Grid -->
        <div class="pulse-v2-main-grid">
          <!-- Left Column: Scoring Factors & Trend -->
          <div class="pulse-grid-left">
            <!-- Section 1: Scoring Factors Grid (4 Cards) -->
            <div class="pulse-section">
              <h3 class="pulse-section-title">Scoring Factors</h3>
              <div class="pulse-factors-grid" id="pulse-factors-grid">
                ${factorConfigs.map(cfg => {
                  const factor = factorDataMap[cfg.key];
                  const factorScore = factor ? Math.round(factor.score) : 0;
                  const fGrade = factorScore >= 80 ? 'Excellent' : factorScore >= 60 ? 'Good' : factorScore >= 40 ? 'Fair' : 'Needs Work';
                  const fColor = factorScore >= 80 ? '#10B981' : factorScore >= 60 ? '#3B82F6' : factorScore >= 40 ? '#F59E0B' : '#F43F5E';
                  const explanation = factor ? (factor.explanation || '') : 'Data pending';
                  const metricVal = factor && factor.metric_value ? factor.metric_value : null;

                  return `
                    <div class="card pulse-factor-v2-card">
                      <div class="factor-v2-header">
                        <div class="factor-v2-left">
                          <div class="factor-v2-icon-box ${cfg.iconCls}">
                            ${cfg.iconSvg}
                          </div>
                          <div>
                            <span class="factor-v2-name">${escapeHTML(cfg.key)}</span>
                            <span style="display:inline-block; margin-left:0.35rem; font-size:0.68rem; font-weight:700; color:var(--text-muted); background:rgba(255,255,255,0.06); padding:0.1rem 0.35rem; border-radius:4px;">${cfg.weight}% Weight</span>
                          </div>
                        </div>
                        <span class="factor-v2-score" style="color:${fColor};">${factorScore}<span class="factor-v2-denom">/100</span></span>
                      </div>
                      <div class="factor-v2-bar-bg">
                        <div class="factor-v2-bar-fill" style="width:${factorScore}%; background:${fColor};"></div>
                      </div>
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                        <span class="factor-v2-grade" style="color:${fColor};">${fGrade}</span>
                        ${metricVal ? `<span style="font-size:0.75rem; font-weight:600; color:var(--text-muted);">${escapeHTML(metricVal)}</span>` : ''}
                      </div>
                      <div class="factor-v2-explanation">${escapeHTML(explanation)}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Section 2: Pulse Trend -->
            <div class="card pulse-section-card">
              <div class="pulse-section-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="pulse-section-title" style="margin:0;">Pulse Trend</h3>
                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Rolling 90-Day Analysis</span>
              </div>

              <div class="pulse-trend-chart-box" style="padding: 2.5rem 1rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.6;">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-main);">Historical Trend Unavailable</div>
                <p style="font-size: 0.8rem; color: var(--text-muted); max-width: 320px; line-height: 1.4; margin: 0;">
                  Finora evaluates your health using a rolling ${escapeHTML(dataWindowStr)} data window. Monthly historical score tracking will appear as more score cycles accumulate.
                </p>
              </div>
            </div>
          </div>

          <!-- Right Column: Snapshot, Insight & Next Steps -->
          <div class="pulse-grid-right">
            <!-- 1. This Month Snapshot Card -->
            <div class="card pulse-section-card">
              <h3 class="pulse-section-title">This Month Snapshot</h3>
              <div class="pulse-snapshot-list" id="pulse-snapshot-list">
                <div class="pulse-snapshot-item">
                  <div class="snapshot-left"><span class="snapshot-icon income">↗</span><span>Total Income</span></div>
                  <strong class="snapshot-val" id="snap-income">${formatCurr(inc)}</strong>
                </div>
                <div class="pulse-snapshot-item">
                  <div class="snapshot-left"><span class="snapshot-icon expense">↘</span><span>Total Expense</span></div>
                  <strong class="snapshot-val" id="snap-expense">${formatCurr(exp)}</strong>
                </div>
                <div class="pulse-snapshot-item">
                  <div class="snapshot-left"><span class="snapshot-icon saved">◯</span><span>Total Saved</span></div>
                  <strong class="snapshot-val" id="snap-saved" style="color: ${saved >= 0 ? '#10B981' : '#F43F5E'};">${formatCurr(saved)}</strong>
                </div>
                <div class="pulse-snapshot-item highlight">
                  <div class="snapshot-left"><span class="snapshot-icon pct">%</span><span>Savings Rate</span></div>
                  <strong class="snapshot-val income" id="snap-rate" style="color: ${Number(savingsRate) >= 0 ? '#10B981' : '#F43F5E'};">${savingsRate}%</strong>
                </div>
              </div>
              <div class="pulse-snapshot-footer" id="pulse-snapshot-footer">
                <span>Current Monthly Summary</span>
                <span class="snapshot-delta-badge" style="color:var(--text-muted); font-size:0.75rem;">Calculated Real-Time</span>
              </div>
            </div>

            <!-- 2. Finora Insight Card -->
            <div class="card pulse-insight-highlight-card">
              <div class="pulse-insight-brand">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span>Finora Insight</span>
              </div>
              <p class="pulse-insight-body-text" id="pulse-insight-body-text">
                ${escapeHTML(pulseData.primary_insight || 'Maintain consistent savings and track your monthly budget to keep your score in the Excellent range.')}
              </p>
              <div class="pulse-insight-target-icon">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.6;">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
            </div>

            <!-- 3. Recommended Next Steps Section -->
            <div class="card pulse-section-card">
              <h3 class="pulse-section-title">Recommended Action Items</h3>
              <div class="pulse-next-steps-list">
                <a href="#dashboard" class="pulse-step-card">
                  <div class="step-icon-box green">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  </div>
                  <div class="step-text">
                    <div class="step-title">Manage Monthly Budget</div>
                    <div class="step-desc">Set spending limits to boost Budget Discipline.</div>
                  </div>
                  <span class="step-arrow">&rsaquo;</span>
                </a>

                <a href="#accounts" class="pulse-step-card">
                  <div class="step-icon-box blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="21" x2="21" y2="21"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="5 10 12 3 19 10"/></svg>
                  </div>
                  <div class="step-text">
                    <div class="step-title">Review Accounts & Stability</div>
                    <div class="step-desc">Keep your balances steady to increase Stability score.</div>
                  </div>
                  <span class="step-arrow">&rsaquo;</span>
                </a>

                <a href="#categories" class="pulse-step-card">
                  <div class="step-icon-box orange">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  </div>
                  <div class="step-text">
                    <div class="step-title">Optimize High-Expense Categories</div>
                    <div class="step-desc">Control discretionary spend to raise Expense Control score.</div>
                  </div>
                  <span class="step-arrow">&rsaquo;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error('Failed to render Pulse view:', err);
    container.innerHTML = `
      <div class="pulse-v2-page">
        <div class="card pulse-v2-hero-card" style="padding: 2.5rem; text-align: center;">
          <div style="color: #F43F5E; font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;">Unexpected Error</div>
          <p style="color: var(--text-muted); font-size: 0.88rem;">${escapeHTML(err.message || 'Failed to load Finora Pulse.')}</p>
        </div>
      </div>
    `;
  }
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
