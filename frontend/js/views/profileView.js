import APIClient from '../api.js';
import { authManager } from '../auth.js';

export async function renderProfileView(container) {
  const user = authManager.currentUser;
  if (!user) return;

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  container.innerHTML = `
    <div class="profile-container" style="max-width:720px; margin:0 auto; padding-bottom:4rem;">
      <!-- Profile Page Header -->
      <div class="profile-page-header">
        <h1 class="profile-title">My Profile</h1>
        <p class="profile-subtitle">Manage your account, privacy, and data preferences</p>
      </div>

      <div id="profile-message" class="profile-alert" style="display:none; margin-bottom:1.5rem;"></div>

      <form id="profile-form">
        <!-- 1. PROFILE SECTION -->
        <div class="profile-section" style="margin-top:0;">
          <div class="profile-section-title" style="margin-bottom:0.5rem; font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Profile</div>
          <div class="profile-group-card" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:12px; overflow:hidden;">
            <!-- Name Row -->
            <div style="padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem;">
              <div class="profile-avatar-large" style="width:48px; height:48px; font-size:1.5rem; flex-shrink:0;">${userInitial}</div>
              <div style="flex:1;">
                <label for="profile-name" style="display:block; font-size:0.75rem; color:var(--text-muted); font-weight:600; margin-bottom:0.2rem;">Full Name</label>
                <input type="text" id="profile-name" value="${escapeHTML(user.name)}" required style="width:100%; background:transparent; border:none; color:var(--text-main); font-size:1rem; font-weight:600; outline:none; padding:0;" />
              </div>
            </div>
            <div style="height:1px; background:var(--glass-border); margin:0 1.25rem;"></div>
            <!-- Email Row -->
            <div style="padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem;">
              <div style="width:48px; flex-shrink:0; display:flex; justify-content:center; color:var(--text-muted);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div style="flex:1;">
                <span style="display:block; font-size:0.75rem; color:var(--text-muted); font-weight:600; margin-bottom:0.2rem;">Email Address</span>
                <span style="display:block; font-size:1rem; color:var(--text-muted); font-weight:500;">${escapeHTML(user.email)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. PREFERENCES SECTION -->
        <div class="profile-section" style="margin-top:2rem;">
          <div class="profile-section-title" style="margin-bottom:0.5rem; font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Preferences</div>
          <div class="profile-group-card" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:12px; overflow:hidden; padding:0.5rem 1.25rem;">
            <div style="display:flex; align-items:center; gap:1rem; padding:0.5rem 0;">
              <div style="width:24px; flex-shrink:0; display:flex; justify-content:center; color:var(--text-muted);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </div>
              <div style="flex:1; display:flex; justify-content:space-between; align-items:center;">
                <label for="profile-currency" style="font-size:0.95rem; font-weight:500; color:var(--text-main);">Currency</label>
                <select id="profile-currency" style="background:transparent; color:var(--text-main); border:none; outline:none; font-size:0.95rem; font-weight:600; text-align:right; cursor:pointer; direction:rtl;">
                  <option value="INR" ${user.currency_code === 'INR' ? 'selected' : ''}>INR (₹)</option>
                  <option value="USD" ${user.currency_code === 'USD' ? 'selected' : ''}>USD ($)</option>
                  <option value="EUR" ${user.currency_code === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                  <option value="GBP" ${user.currency_code === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top:0.75rem;">
            <button type="submit" id="btn-save-profile" class="btn btn-primary" style="padding:0.6rem 1.25rem; font-size:0.9rem; border-radius:8px;">
              Save Changes
            </button>
          </div>
        </div>
      </form>

      <!-- 3. SECURITY SECTION -->
      <div class="profile-section" style="margin-top:2rem;">
        <div class="profile-section-title" style="margin-bottom:0.5rem; font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Security</div>
        <div class="profile-group-card" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:12px; overflow:hidden;">
          <form id="change-password-form" style="padding:1.25rem;">
            <div id="change-pwd-alert" style="display:none; padding:0.65rem; border-radius:8px; margin-bottom:1rem; font-size:0.85rem;"></div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;" for="pwd-current">Current Password</label>
              <div style="position:relative;">
                <input type="password" id="pwd-current" class="form-control" placeholder="••••••••" required style="padding-right:2.5rem; background:rgba(15,23,42,0.4);" />
                <button type="button" class="btn-toggle-pwd" data-target="pwd-current" style="position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer;">👁️</button>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;" for="pwd-new">New Password (min 8 chars)</label>
              <div style="position:relative;">
                <input type="password" id="pwd-new" class="form-control" placeholder="••••••••" minlength="8" required style="padding-right:2.5rem; background:rgba(15,23,42,0.4);" />
                <button type="button" class="btn-toggle-pwd" data-target="pwd-new" style="position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer;">👁️</button>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:1.25rem;">
              <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;" for="pwd-confirm">Confirm New Password</label>
              <div style="position:relative;">
                <input type="password" id="pwd-confirm" class="form-control" placeholder="••••••••" minlength="8" required style="padding-right:2.5rem; background:rgba(15,23,42,0.4);" />
                <button type="button" class="btn-toggle-pwd" data-target="pwd-confirm" style="position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer;">👁️</button>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end;">
              <button type="submit" id="btn-submit-change-pwd" class="btn btn-primary" style="padding:0.6rem 1.25rem; font-size:0.9rem; border-radius:8px;">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 4. YOUR DATA SECTION -->
      <div class="profile-section" style="margin-top:2rem;">
        <div class="profile-section-title" style="margin-bottom:0.5rem; font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Your Data</div>
        <div class="profile-group-card" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:12px; overflow:hidden;">
          
          <div style="padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="color:var(--text-muted);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <span style="font-size:0.95rem; font-weight:500;">Export Financial History</span>
            </div>
            <button type="button" id="btn-export-csv" class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.85rem; border-radius:6px; min-height:0;">
              Export CSV
            </button>
          </div>

          <div style="height:1px; background:var(--glass-border); margin:0 1.25rem;"></div>

          <a href="#privacy" style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; text-decoration:none; color:var(--text-main);">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="color:var(--text-muted);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
              <span style="font-size:0.95rem; font-weight:500;">Privacy Policy</span>
            </div>
            <div style="color:var(--text-muted);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </a>

          <div style="height:1px; background:var(--glass-border); margin:0 1.25rem;"></div>

          <a href="#terms" style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; text-decoration:none; color:var(--text-main);">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="color:var(--text-muted);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
              <span style="font-size:0.95rem; font-weight:500;">Terms of Service</span>
            </div>
            <div style="color:var(--text-muted);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </a>
        </div>
      </div>

      <!-- 5. SUPPORT & SESSION SECTION -->
      <div class="profile-section" style="margin-top:2rem;">
        <div class="profile-section-title" style="margin-bottom:0.5rem; font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Support &amp; Session</div>
        <div class="profile-group-card" style="background:var(--bg-card); border:1px solid var(--glass-border); border-radius:12px; overflow:hidden;">
          
          <div id="btn-profile-feedback" role="button" tabindex="0" style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; cursor:pointer;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="color:var(--text-muted);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></div>
              <span style="font-size:0.95rem; font-weight:500;">Give Feedback</span>
            </div>
            <div style="color:var(--text-muted);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>

          <div style="height:1px; background:var(--glass-border); margin:0 1.25rem;"></div>

          <div id="btn-profile-about" role="button" tabindex="0" style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; cursor:pointer;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="color:var(--text-muted);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
              <span style="font-size:0.95rem; font-weight:500;">About Finora</span>
            </div>
            <div style="color:var(--text-muted);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div>
          </div>

          <div style="height:1px; background:var(--glass-border); margin:0 1.25rem;"></div>

          <div id="btn-profile-logout" role="button" tabindex="0" style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; cursor:pointer; color:var(--text-main);">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="color:var(--text-muted);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
              <span style="font-size:0.95rem; font-weight:500;">Logout</span>
            </div>
          </div>

          <div id="btn-profile-install-pwa" role="button" tabindex="0" style="display:none; justify-content:space-between; align-items:center; padding:1rem 1.25rem; cursor:pointer; border-top:1px solid var(--glass-border);">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="color:var(--primary);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div>
              <span style="font-size:0.95rem; font-weight:600; color:var(--primary);">Install Finora App</span>
            </div>
            <div style="color:var(--primary);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>
          </div>
        </div>
      </div>

      <!-- 6. DANGER ZONE -->
      <div class="profile-section" style="margin-top:2.5rem; margin-bottom: 2rem;">
        <div class="profile-section-title" style="margin-bottom:0.5rem; font-size:0.8rem; font-weight:700; color:#ef4444; text-transform:uppercase; letter-spacing:0.5px;">Danger Zone</div>
        <div class="profile-group-card" style="background:rgba(239,68,68,0.03); border:1px solid rgba(239,68,68,0.3); border-radius:12px; overflow:hidden; padding:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div style="flex:1; min-width:200px;">
            <h4 style="font-size:0.95rem; font-weight:700; color:#ef4444; margin:0 0 0.25rem 0;">Delete Account</h4>
            <p style="font-size:0.82rem; color:var(--text-muted); margin:0; line-height:1.4;">Permanently erase your account and all data.</p>
          </div>
          <button type="button" id="btn-open-delete-account-modal" class="btn btn-danger" style="padding:0.6rem 1rem; font-size:0.85rem; border-radius:8px;">
            Delete Account
          </button>
        </div>
      </div>

      <!-- Delete Account Confirmation Modal (v1.4.0) -->
      <div class="modal-overlay" id="delete-account-modal">
        <div class="modal" style="max-width:440px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="font-size:1.2rem; font-weight:800; color:#ef4444; margin:0;">Permanently Delete Account?</h3>
            <button type="button" class="btn" id="btn-close-delete-account-modal" style="padding:0.2rem 0.5rem; font-size:1.3rem; border:none; background:transparent; color:var(--text-muted); cursor:pointer;">&times;</button>
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; margin-bottom:1.2rem;">
            This action <strong>cannot be undone</strong>. All your transaction history, budgets, custom categories, and personal preferences will be permanently wiped.
          </p>
          <form id="delete-account-form">
            <div id="delete-account-alert" style="display:none; padding:0.65rem; border-radius:8px; margin-bottom:1rem; font-size:0.85rem; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3);"></div>
            <div class="form-group" style="margin-bottom:1.2rem;">
              <label class="form-label" style="display:block; font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-bottom:0.4rem;">Type your password to confirm:</label>
              <input type="password" id="delete-account-password" class="form-control" style="width:100%;" required placeholder="••••••••" />
            </div>
            <div style="display:flex; gap:0.75rem;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-delete-account" style="flex:1;">Cancel</button>
              <button type="submit" id="btn-confirm-delete-account" class="btn btn-danger" style="flex:1; font-weight:700;">Delete Account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Attach Password Eye Toggle Listener
  container.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🙈';
        } else {
          input.type = 'password';
          btn.textContent = '👁️';
        }
      }
    });
  });

  // Attach Change Password Form Listener
  document.getElementById('change-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertDiv = document.getElementById('change-pwd-alert');
    const submitBtn = document.getElementById('btn-submit-change-pwd');
    const currentPwd = document.getElementById('pwd-current').value;
    const newPwd = document.getElementById('pwd-new').value;
    const confirmPwd = document.getElementById('pwd-confirm').value;

    alertDiv.style.display = 'none';

    if (newPwd !== confirmPwd) {
      alertDiv.style.background = 'rgba(239, 68, 68, 0.15)';
      alertDiv.style.color = '#ef4444';
      alertDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
      alertDiv.textContent = 'New password and confirmation do not match.';
      alertDiv.style.display = 'block';
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Updating...';

      await APIClient.changePassword({
        current_password: currentPwd,
        new_password: newPwd
      });

      if (window.showToast) window.showToast('Password updated successfully!', 'success');
      alertDiv.style.background = 'rgba(16, 185, 129, 0.15)';
      alertDiv.style.color = '#10b981';
      alertDiv.style.border = '1px solid rgba(16, 185, 129, 0.3)';
      alertDiv.textContent = 'Password updated successfully!';
      alertDiv.style.display = 'block';
      document.getElementById('change-password-form').reset();
    } catch (err) {
      alertDiv.style.background = 'rgba(239, 68, 68, 0.15)';
      alertDiv.style.color = '#ef4444';
      alertDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
      alertDiv.textContent = err.message || 'Failed to update password.';
      alertDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Password';
    }
  });

  // Attach CSV Export Handler
  document.getElementById('btn-export-csv')?.addEventListener('click', async () => {
    try {
      if (window.showToast) window.showToast('Preparing CSV download...', 'info');
      await APIClient.exportTransactionsCSV('all');
      if (window.showToast) window.showToast('CSV export downloaded successfully!', 'success');
    } catch (err) {
      if (window.showToast) window.showToast(err.message || 'Export failed', 'error');
    }
  });

  // Attach Delete Account Modal Handlers
  const deleteModal = document.getElementById('delete-account-modal');
  const openDeleteBtn = document.getElementById('btn-open-delete-account-modal');
  const closeDeleteBtn = document.getElementById('btn-close-delete-account-modal');
  const cancelDeleteBtn = document.getElementById('btn-cancel-delete-account');

  openDeleteBtn?.addEventListener('click', () => deleteModal?.classList.add('active'));
  closeDeleteBtn?.addEventListener('click', () => deleteModal?.classList.remove('active'));
  cancelDeleteBtn?.addEventListener('click', () => deleteModal?.classList.remove('active'));

  document.getElementById('delete-account-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('delete-account-password').value;
    const alertDiv = document.getElementById('delete-account-alert');
    const submitBtn = document.getElementById('btn-confirm-delete-account');

    alertDiv.style.display = 'none';

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Deleting...';

      await APIClient.deleteAccount({ password });
      deleteModal?.classList.remove('active');
      if (window.showToast) window.showToast('Account permanently deleted', 'info');
      authManager.logout();
    } catch (err) {
      alertDiv.textContent = err.message || 'Incorrect password.';
      alertDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Delete Account';
    }
  });

  // Attach Existing Handlers
  const installBtn = document.getElementById('btn-profile-install-pwa');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (!isStandalone && window.deferredPWAInstallPrompt) {
    if (installBtn) installBtn.style.display = 'block';
  }

  installBtn?.addEventListener('click', async () => {
    if (window.deferredPWAInstallPrompt) {
      window.deferredPWAInstallPrompt.prompt();
      const { outcome } = await window.deferredPWAInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.style.display = 'none';
      }
      window.deferredPWAInstallPrompt = null;
    }
  });

  document.getElementById('btn-profile-about')?.addEventListener('click', () => {
    document.getElementById('about-modal')?.classList.add('active');
  });

  document.getElementById('btn-profile-feedback')?.addEventListener('click', () => {
    document.getElementById('feedback-modal')?.classList.add('active');
  });

  document.getElementById('btn-profile-logout')?.addEventListener('click', () => {
    authManager.logout();
  });

  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgDiv = document.getElementById('profile-message');
    const saveBtn = document.getElementById('btn-save-profile');
    msgDiv.style.display = 'none';

    const updatedName = document.getElementById('profile-name').value.trim();
    const updatedCurrency = document.getElementById('profile-currency').value;

    try {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      const updatedUser = await APIClient.updateProfile({
        name: updatedName,
        currency_code: updatedCurrency
      });
      authManager.currentUser = updatedUser;

      if (window.showToast) window.showToast('Profile updated successfully!', 'success');
      msgDiv.className = 'profile-alert success';
      msgDiv.textContent = 'Profile updated successfully!';
      msgDiv.style.display = 'block';
    } catch (err) {
      if (window.showToast) window.showToast(err.message || 'Failed to update profile.', 'error');
      msgDiv.className = 'profile-alert error';
      msgDiv.textContent = err.message || 'Failed to update profile.';
      msgDiv.style.display = 'block';
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Account Preferences';
    }
  });
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
