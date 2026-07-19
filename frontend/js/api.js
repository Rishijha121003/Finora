// Finora REST API Client

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000/api/v1'
  : 'https://finora-9nid.onrender.com/api/v1';

class APIClient {
  static getAuthToken() {
    return localStorage.getItem('finora_token');
  }

  static setAuthToken(token) {
    if (token) {
      localStorage.setItem('finora_token', token);
    } else {
      localStorage.removeItem('finora_token');
    }
  }

  static async request(endpoint, options = {}) {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        this.setAuthToken(null);
        window.dispatchEvent(new Event('auth:unauthorized'));
      }

      const data = await response.json();
      if (!response.ok) {
        let errorMessage = 'An API error occurred';
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(d => d.msg ? `${d.loc ? d.loc[d.loc.length - 1] + ': ' : ''}${d.msg}` : JSON.stringify(d)).join(' | ');
        } else if (data.error) {
          errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        }
        throw new Error(errorMessage);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  // Auth Endpoints
  static async register(name, email, password, currencyCode = 'INR') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, currency_code: currencyCode })
    });
  }

  static async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  static async getMe() {
    return this.request('/auth/me');
  }

  static async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Categories Endpoints
  static async getCategories() {
    return this.request('/categories');
  }

  static async createCategory(categoryData) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  static async deleteCategory(categoryId) {
    return this.request(`/categories/${categoryId}`, {
      method: 'DELETE'
    });
  }

  // Transactions Endpoints
  static async getTransactions(params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    return this.request(`/transactions?${query.toString()}`);
  }

  static async createTransaction(txData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(txData)
    });
  }

  static async updateTransaction(id, txData) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(txData)
    });
  }

  static async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE'
    });
  }

  // Dashboard Summary Endpoint
  static async getDashboardSummary(timeframe = 'month', startDate = null, endDate = null) {
    const params = new URLSearchParams({ timeframe });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.request(`/dashboard/summary?${params.toString()}`);
  }

  // Feedback Endpoint
  static async submitFeedback(feedbackData) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
  }

  // Budget Endpoints (v1.3.0)
  static async getBudgets() {
    return this.request('/budgets');
  }

  static async getBudgetSummary() {
    return this.request('/budgets/summary');
  }

  static async createOrUpdateBudget(budgetData) {
    return this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData)
    });
  }

  static async deleteBudget(id) {
    return this.request(`/budgets/${id}`, {
      method: 'DELETE'
    });
  }
}

export default APIClient;
