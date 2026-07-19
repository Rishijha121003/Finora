import APIClient from '../api.js';
import { authManager } from '../auth.js';

export async function renderProfileView(container) {
  const user = authManager.currentUser;
  if (!user) return;

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  container.innerHTML = `
    <div class="profile-container">
      <!-- Profile Page Title -->
      <div class="profile-page-header">
        <h1 class="profile-title">My Profile</h1>
        <p class="profile-subtitle">Manage your account and preferences</p>
      </div>

      <div id="profile-message" class="profile-alert" style="display:none;"></div>

      <form id="profile-form">
        <!-- 1. Profile Summary Card -->
        <div class="profile-summary-card">
          <div class="profile-avatar-wrapper">
            <div class="profile-avatar-large">${userInitial}</div>
          </div>
          <div class="profile-user-info">
            <h2 class="profile-user-name">${escapeHTML(user.name)}</h2>
            <p class="profile-user-email">${escapeHTML(user.email)}</p>
          </div>
        </div>

        <!-- 2. Account Information Section -->
        <div class="profile-section">
          <div class="profile-section-title">Account Information</div>
          <div class="profile-group-card">
            <!-- Full Name Row -->
            <div class="profile-item-row">
              <div class="profile-item-left">
                <div class="profile-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div class="profile-item-details">
                  <label for="profile-name" class="profile-item-label">Full Name</label>
                  <input type="text" id="profile-name" class="profile-item-input" value="${escapeHTML(user.name)}" required />
                </div>
              </div>
              <div class="profile-row-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>

            <div class="profile-row-divider"></div>

            <!-- Email Address Row (Read Only) -->
            <div class="profile-item-row">
              <div class="profile-item-left">
                <div class="profile-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div class="profile-item-details">
                  <span class="profile-item-label">Email Address</span>
                  <span class="profile-item-readonly-value">${escapeHTML(user.email)}</span>
                </div>
              </div>
              <div class="profile-row-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>

            <div class="profile-row-divider"></div>

            <!-- Default Currency Preference Row -->
            <div class="profile-item-row">
              <div class="profile-item-left">
                <div class="profile-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div class="profile-item-details" style="width:100%;">
                  <label for="profile-currency" class="profile-item-label">Default Currency</label>
                  <select id="profile-currency" class="profile-item-select">
                    <option value="INR" ${user.currency_code === 'INR' ? 'selected' : ''}>INR - Indian Rupee</option>
                    <option value="USD" ${user.currency_code === 'USD' ? 'selected' : ''}>USD - US Dollar</option>
                    <option value="EUR" ${user.currency_code === 'EUR' ? 'selected' : ''}>EUR - Euro</option>
                    <option value="GBP" ${user.currency_code === 'GBP' ? 'selected' : ''}>GBP - British Pound</option>
                  </select>
                </div>
              </div>
              <div class="profile-row-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. About Section -->
        <div class="profile-section">
          <div class="profile-section-title">About</div>
          <div class="profile-group-card">
            <div class="profile-item-row" id="btn-profile-about" role="button" tabindex="0" style="cursor:pointer;">
              <div class="profile-item-left">
                <div class="profile-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                </div>
                <div class="profile-item-details">
                  <span class="profile-item-label">About Finora</span>
                </div>
              </div>
              <div class="profile-row-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Side-by-Side Action Buttons Grid (Feedback & Save Changes) -->
        <div class="profile-actions-grid">
          <button type="button" id="btn-profile-feedback" class="btn-profile-feedback-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Give Feedback</span>
          </button>

          <button type="submit" id="btn-save-profile" class="btn-profile-save-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span>Save Changes</span>
          </button>
        </div>

        <!-- 5. Standalone Logout Action Button -->
        <button type="button" id="btn-profile-logout" class="btn-profile-logout-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Logout</span>
        </button>
      </form>
    </div>
  `;

  // Attach Event Handlers
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

    if (!updatedName) {
      msgDiv.className = 'profile-alert error';
      msgDiv.textContent = 'Please enter your full name.';
      msgDiv.style.display = 'block';
      return;
    }

    try {
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span>Saving...</span>`;
      }

      const updatedUser = await APIClient.updateProfile({
        name: updatedName,
        currency_code: updatedCurrency
      });
      authManager.currentUser = updatedUser;

      msgDiv.className = 'profile-alert success';
      msgDiv.textContent = 'Profile updated successfully!';
      msgDiv.style.display = 'block';

      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>Save Changes</span>`;
      }
      msgDiv.className = 'profile-alert error';
      msgDiv.textContent = err.message || 'Failed to update profile.';
      msgDiv.style.display = 'block';
    }
  });
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
