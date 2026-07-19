import APIClient from './api.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
  }

  async init() {
    const token = APIClient.getAuthToken();
    if (token) {
      try {
        this.currentUser = await APIClient.getMe();
        return this.currentUser;
      } catch (err) {
        APIClient.setAuthToken(null);
        this.currentUser = null;
      }
    }
    return null;
  }

  async login(email, password) {
    try {
      const res = await APIClient.login(email, password);
      APIClient.setAuthToken(res.access_token);
      this.currentUser = res.user;
      return this.currentUser;
    } catch (err) {
      APIClient.setAuthToken(null);
      this.currentUser = null;
      throw err;
    }
  }

  async register(name, email, password, currencyCode = 'INR') {
    try {
      const res = await APIClient.register(name, email, password, currencyCode);
      APIClient.setAuthToken(res.access_token);
      this.currentUser = res.user;
      return this.currentUser;
    } catch (err) {
      APIClient.setAuthToken(null);
      this.currentUser = null;
      throw err;
    }
  }

  logout() {
    APIClient.setAuthToken(null);
    this.currentUser = null;
    window.location.hash = '#landing';
  }


  isAuthenticated() {
    return !!this.currentUser;
  }

  getUserCurrency() {
    return this.currentUser ? this.currentUser.currency_code : 'INR';
  }
}

export const authManager = new AuthManager();
