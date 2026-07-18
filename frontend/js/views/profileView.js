import APIClient from '../api.js';
import { authManager } from '../auth.js';

export async function renderProfileView(container) {
  const user = authManager.currentUser;

  container.innerHTML = `
    <div class="section-toolbar">
      <div>
        <h1 style="font-size:1.6rem; font-weight:800;">Profile Settings</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">Manage your account information and default currency preference</p>
      </div>
    </div>

    <div class="card" style="max-width:600px; margin:0 auto;">
      <div id="profile-message" style="display:none; padding:0.75rem; border-radius:8px; margin-bottom:1rem; font-size:0.9rem;"></div>

      <form id="profile-form">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="profile-name" class="form-control" value="${escapeHTML(user.name)}" required />
        </div>

        <div class="form-group">
          <label>Email Address (Account ID)</label>
          <input type="email" class="form-control" value="${escapeHTML(user.email)}" disabled style="opacity:0.7; cursor:not-allowed;" />
        </div>

        <div class="form-group">
          <label>Default Currency Preference</label>
          <select id="profile-currency" class="form-control">
            <option value="INR" ${user.currency_code === 'INR' ? 'selected' : ''}>₹ INR — Indian Rupee</option>
            <option value="USD" ${user.currency_code === 'USD' ? 'selected' : ''}>$ USD — US Dollar</option>
            <option value="EUR" ${user.currency_code === 'EUR' ? 'selected' : ''}>€ EUR — Euro</option>
            <option value="GBP" ${user.currency_code === 'GBP' ? 'selected' : ''}>£ GBP — British Pound</option>
          </select>
        </div>

        <div style="display:flex; justify-content:flex-end; margin-top:1.5rem;">
          <button type="submit" class="btn btn-primary">Save Profile Changes</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgDiv = document.getElementById('profile-message');
    msgDiv.style.display = 'none';

    const updatedName = document.getElementById('profile-name').value.trim();
    const updatedCurrency = document.getElementById('profile-currency').value;

    try {
      const updatedUser = await APIClient.updateProfile({
        name: updatedName,
        currency_code: updatedCurrency
      });
      authManager.currentUser = updatedUser;
      
      msgDiv.style.background = 'rgba(16, 185, 129, 0.15)';
      msgDiv.style.border = '1px solid rgba(16, 185, 129, 0.3)';
      msgDiv.style.color = '#10b981';
      msgDiv.textContent = 'Profile updated successfully!';
      msgDiv.style.display = 'block';

      // Refresh header UI after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      msgDiv.style.background = 'rgba(239, 68, 68, 0.15)';
      msgDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
      msgDiv.style.color = '#ef4444';
      msgDiv.textContent = err.message || 'Failed to update profile.';
      msgDiv.style.display = 'block';
    }
  });
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
