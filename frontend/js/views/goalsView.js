import APIClient from '../api.js';
import { formatCurrency } from '../currency.js';
import { authManager } from '../auth.js';

export async function renderGoalsView(container) {
  const currencyCode = authManager.getUserCurrency();

  container.innerHTML = `
    <div class="goals-page-container">
      <!-- Header Section -->
      <div class="goals-header-row">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <h1 class="goals-title">Savings Goals</h1>
            <span class="goals-badge">PERSISTENT DATA</span>
          </div>
          <p class="goals-subtitle">Set, track, and manage long-term financial targets and savings milestones</p>
        </div>

        <button id="btn-open-create-goal" class="btn btn-emerald" style="display:inline-flex; align-items:center; gap:0.45rem; padding:0.6rem 1.1rem; border-radius:12px; font-weight:700;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Create New Goal</span>
        </button>
      </div>

      <!-- Main Goals Content Area -->
      <div id="goals-main-content">
        <div style="padding:3.5rem; text-align:center; color:var(--text-muted); background:var(--bg-card); border:1px solid var(--glass-border); border-radius:20px;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" style="animation: spin 1s linear infinite; margin-bottom:0.75rem;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          <div style="font-weight:600; font-size:0.95rem;">Loading savings goals...</div>
        </div>
      </div>

      <!-- Create / Edit Goal Modal -->
      <div class="modal-overlay" id="goal-form-modal">
        <div class="modal" style="max-width:480px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
            <h3 id="goal-modal-title" style="font-size:1.2rem; font-weight:800; color:var(--text-main); margin:0;">Create Savings Goal</h3>
            <button type="button" class="btn" id="btn-close-goal-modal" style="padding:0.2rem 0.5rem; font-size:1.3rem; border:none; background:transparent; color:var(--text-muted); cursor:pointer;">&times;</button>
          </div>

          <form id="goal-form">
            <input type="hidden" id="goal-id-input" value="" />

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label" style="display:block; font-size:0.82rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;" for="goal-title">Goal Name</label>
              <input type="text" id="goal-title" class="form-control" placeholder="e.g. Emergency Fund, New Car" required style="width:100%;" />
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; margin-bottom:1rem;">
              <div class="form-group">
                <label class="form-label" style="display:block; font-size:0.82rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;" for="goal-target">Target Amount</label>
                <input type="number" id="goal-target" class="form-control" step="0.01" min="1" placeholder="50000" required style="width:100%;" />
              </div>
              <div class="form-group">
                <label class="form-label" style="display:block; font-size:0.82rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;" for="goal-current">Currently Saved</label>
                <input type="number" id="goal-current" class="form-control" step="0.01" min="0" placeholder="0" required style="width:100%;" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; margin-bottom:1.25rem;">
              <div class="form-group">
                <label class="form-label" style="display:block; font-size:0.82rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;" for="goal-category">Category</label>
                <select id="goal-category" class="form-control" style="width:100%;">
                  <option value="Emergency Fund">Emergency Fund</option>
                  <option value="Travel">Travel</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Home">Home</option>
                  <option value="Education">Education</option>
                  <option value="General" selected>General</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" style="display:block; font-size:0.82rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;" for="goal-date">Target Date (Optional)</label>
                <input type="date" id="goal-date" class="form-control" style="width:100%;" />
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-goal-modal">Cancel</button>
              <button type="submit" id="btn-save-goal" class="btn btn-emerald" style="font-weight:700;">Save Goal</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Modal Handlers
  const modal = document.getElementById('goal-form-modal');
  const openBtn = document.getElementById('btn-open-create-goal');
  const closeBtn = document.getElementById('btn-close-goal-modal');
  const cancelBtn = document.getElementById('btn-cancel-goal-modal');
  const form = document.getElementById('goal-form');

  const showModal = (isEdit = false, goalData = null) => {
    document.getElementById('goal-modal-title').textContent = isEdit ? 'Edit Savings Goal' : 'Create Savings Goal';
    document.getElementById('goal-id-input').value = isEdit && goalData ? goalData.id : '';
    document.getElementById('goal-title').value = isEdit && goalData ? goalData.title : '';
    document.getElementById('goal-target').value = isEdit && goalData ? goalData.target_amount : '';
    document.getElementById('goal-current').value = isEdit && goalData ? goalData.current_amount : '0';
    document.getElementById('goal-category').value = isEdit && goalData ? (goalData.category || 'General') : 'General';
    document.getElementById('goal-date').value = isEdit && goalData && goalData.target_date ? goalData.target_date : '';
    modal?.classList.add('active');
  };

  const hideModal = () => modal?.classList.remove('active');

  openBtn?.addEventListener('click', () => showModal(false));
  closeBtn?.addEventListener('click', hideModal);
  cancelBtn?.addEventListener('click', hideModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('btn-save-goal');
    const goalId = document.getElementById('goal-id-input').value;
    const title = document.getElementById('goal-title').value.trim();
    const targetAmount = parseFloat(document.getElementById('goal-target').value);
    const currentAmount = parseFloat(document.getElementById('goal-current').value || 0);
    const category = document.getElementById('goal-category').value;
    const targetDate = document.getElementById('goal-date').value || null;

    try {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      const payload = {
        title,
        target_amount: targetAmount,
        current_amount: currentAmount,
        category,
        target_date: targetDate
      };

      if (goalId) {
        await APIClient.updateGoal(goalId, payload);
        if (window.showToast) window.showToast('Goal updated successfully!', 'success');
      } else {
        await APIClient.createGoal(payload);
        if (window.showToast) window.showToast('Savings goal created!', 'success');
      }

      hideModal();
      await loadGoals(currencyCode, showModal);
    } catch (err) {
      if (window.showToast) window.showToast(err.message || 'Failed to save goal', 'error');
      else alert(err.message || 'Failed to save goal');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Goal';
    }
  });

  await loadGoals(currencyCode, showModal);
}

async function loadGoals(currencyCode, showModal) {
  const container = document.getElementById('goals-main-content');

  try {
    const summary = await APIClient.getGoalsSummary();
    const goals = summary ? summary.goals : [];
    const totalGoals = summary ? summary.total_goals : 0;
    const totalTarget = summary ? parseFloat(summary.total_target || 0) : 0;
    const totalSaved = summary ? parseFloat(summary.total_saved || 0) : 0;
    const overallProgress = summary ? summary.overall_progress : 0;

    if (goals.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:3.5rem 1.5rem; text-align:center; background:var(--bg-card); border:1px solid var(--glass-border); border-radius:22px;">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:0.75rem;">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:0.35rem;">No savings goals set yet</h3>
          <p style="font-size:0.88rem; color:var(--text-muted); max-width:420px; margin:0 auto 1.25rem auto;">
            Create your first savings goal (Emergency Fund, Travel, Housing, Vehicle) to start tracking long-term progress.
          </p>
          <button id="empty-create-goal-btn" class="btn btn-emerald" style="padding:0.6rem 1.25rem; font-weight:700; border-radius:12px;">+ Create First Goal</button>
        </div>
      `;
      container.querySelector('#empty-create-goal-btn')?.addEventListener('click', () => showModal(false));
      return;
    }

    const categoryIcons = {
      'Emergency Fund': '🛡️',
      'Travel': '✈️',
      'Vehicle': '🚗',
      'Home': '🏠',
      'Education': '🎓',
      'General': '🎯'
    };

    container.innerHTML = `
      <!-- Summary Metrics Grid -->
      <div class="goals-summary-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; margin-bottom:1.75rem;">
        <div class="goals-card" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:16px; padding:1.2rem; display:flex; flex-direction:column;">
          <span style="font-size:0.78rem; font-weight:600; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.35rem;">Active Goals</span>
          <span style="font-size:1.45rem; font-weight:800; color:var(--text-main);">${totalGoals}</span>
          <span style="font-size:0.78rem; color:var(--text-muted); margin-top:0.3rem;">Configured milestones</span>
        </div>

        <div class="goals-card" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:16px; padding:1.2rem; display:flex; flex-direction:column;">
          <span style="font-size:0.78rem; font-weight:600; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.35rem;">Total Saved</span>
          <span style="font-size:1.45rem; font-weight:800; color:#10B981;">${formatCurrency(totalSaved, currencyCode)}</span>
          <span style="font-size:0.78rem; color:var(--text-muted); margin-top:0.3rem;">Accumulated balance</span>
        </div>

        <div class="goals-card" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:16px; padding:1.2rem; display:flex; flex-direction:column;">
          <span style="font-size:0.78rem; font-weight:600; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.35rem;">Total Target</span>
          <span style="font-size:1.45rem; font-weight:800; color:var(--text-main);">${formatCurrency(totalTarget, currencyCode)}</span>
          <span style="font-size:0.78rem; color:var(--text-muted); margin-top:0.3rem;">Combined target value</span>
        </div>

        <div class="goals-card" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:16px; padding:1.2rem; display:flex; flex-direction:column;">
          <span style="font-size:0.78rem; font-weight:600; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.35rem;">Overall Progress</span>
          <span style="font-size:1.45rem; font-weight:800; color:#6366F1;">${overallProgress.toFixed(1)}%</span>
          <span style="font-size:0.78rem; color:var(--text-muted); margin-top:0.3rem;">Average completion</span>
        </div>
      </div>

      <!-- Goals Grid -->
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:1.25rem;">
        ${goals.map(g => {
          const icon = categoryIcons[g.category] || '🎯';
          const targetAmt = parseFloat(g.target_amount);
          const currentAmt = parseFloat(g.current_amount);
          const remainingAmt = parseFloat(g.remaining_amount);
          const pct = g.percentage_completed;

          return `
            <div class="goal-item-card" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:20px; padding:1.35rem; display:flex; flex-direction:column; justify-space-between; box-shadow:0 4px 20px rgba(0,0,0,0.15);">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.85rem;">
                  <div style="display:flex; align-items:center; gap:0.65rem;">
                    <div style="width:40px; height:40px; border-radius:12px; background:rgba(99,102,241,0.15); display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                      ${icon}
                    </div>
                    <div>
                      <h4 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin:0;">${escapeHTML(g.title)}</h4>
                      <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${escapeHTML(g.category || 'General')}</span>
                    </div>
                  </div>

                  ${g.is_completed ? `
                    <span style="font-size:0.65rem; font-weight:800; background:rgba(16,185,129,0.15); color:#10B981; border:1px solid rgba(16,185,129,0.3); padding:0.2rem 0.55rem; border-radius:20px;">
                      ✓ COMPLETED
                    </span>
                  ` : `
                    <span style="font-size:0.65rem; font-weight:800; background:rgba(99,102,241,0.15); color:#6366F1; border:1px solid rgba(99,102,241,0.3); padding:0.2rem 0.55rem; border-radius:20px;">
                      IN PROGRESS
                    </span>
                  `}
                </div>

                <!-- Progress Bar -->
                <div style="margin-bottom:1rem;">
                  <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.35rem;">
                    <span style="font-size:0.82rem; font-weight:700; color:var(--text-main);">${pct.toFixed(1)}% Saved</span>
                    <span style="font-size:0.78rem; color:var(--text-muted);">Target: ${formatCurrency(targetAmt, currencyCode)}</span>
                  </div>
                  <div style="width:100%; height:9px; background:rgba(255,255,255,0.08); border-radius:10px; overflow:hidden;">
                    <div style="height:100%; width:${Math.min(100, Math.max(0, pct))}%; background:${g.is_completed ? '#10B981' : 'linear-gradient(90deg, #6366F1, #10B981)'}; border-radius:10px; transition:width 0.4s ease;"></div>
                  </div>
                </div>

                <!-- Stats Breakdown -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); border-radius:12px; padding:0.75rem 0.85rem; margin-bottom:1rem; font-size:0.8rem;">
                  <div>
                    <div style="color:var(--text-muted); font-size:0.72rem; font-weight:600;">Saved</div>
                    <div style="font-weight:700; color:#10B981; margin-top:0.1rem;">${formatCurrency(currentAmt, currencyCode)}</div>
                  </div>
                  <div>
                    <div style="color:var(--text-muted); font-size:0.72rem; font-weight:600;">Remaining</div>
                    <div style="font-weight:700; color:var(--text-main); margin-top:0.1rem;">${formatCurrency(remainingAmt, currencyCode)}</div>
                  </div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; pt-0.5rem; border-top:1px solid var(--glass-border);">
                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">
                  ${g.target_date ? `Due: ${g.target_date}` : 'No date set'}
                </span>

                <div style="display:flex; gap:0.4rem;">
                  <button class="btn btn-secondary btn-edit-goal" data-goal='${JSON.stringify(g).replace(/'/g, "&apos;")}' style="padding:0.3rem 0.65rem; font-size:0.78rem; border-radius:8px;">Edit</button>
                  <button class="btn btn-danger btn-delete-goal" data-id="${g.id}" style="padding:0.3rem 0.65rem; font-size:0.78rem; border-radius:8px;">Delete</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Attach Edit & Delete Listeners
    container.querySelectorAll('.btn-edit-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        const goalData = JSON.parse(btn.getAttribute('data-goal').replace(/&apos;/g, "'"));
        showModal(true, goalData);
      });
    });

    container.querySelectorAll('.btn-delete-goal').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Are you sure you want to delete this savings goal?')) return;

        try {
          btn.disabled = true;
          await APIClient.deleteGoal(id);
          if (window.showToast) window.showToast('Goal deleted', 'info');
          await loadGoals(currencyCode, showModal);
        } catch (err) {
          if (window.showToast) window.showToast(err.message || 'Failed to delete goal', 'error');
          else alert(err.message || 'Failed to delete goal');
        }
      });
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="empty-state" style="padding:2.5rem; text-align:center; background:var(--bg-card); border:1px solid rgba(244,63,94,0.3); border-radius:20px;">
        <h3 style="color:#F43F5E; font-size:1.05rem; font-weight:700; margin-bottom:0.4rem;">Failed to load savings goals</h3>
        <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">${escapeHTML(err.message || 'Error communicating with Goals server.')}</p>
        <button id="retry-goals-btn" class="btn btn-emerald" style="padding:0.45rem 1rem; border-radius:10px; font-weight:700;">Retry</button>
      </div>
    `;
    container.querySelector('#retry-goals-btn')?.addEventListener('click', () => loadGoals(currencyCode, showModal));
  }
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
