import api from './api';

const TOKEN_KEY = 'rasika_token';
const USER_KEY = 'rasika_user';

const authService = {
  async register(userData) {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/users/login', { email, password });
    const { token, ...user } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return !!this.getToken();
  }
};

export default authService;
