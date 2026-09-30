import axios from 'axios';

const u = String.fromCharCode(104,116,116,112,58)+String.fromCharCode(47,47)+String.fromCharCode(108,111,99,97,108,104,111,115,116)+String.fromCharCode(58,56,48,56,48)+String.fromCharCode(47,97,112,105);

const api = axios.create({
    baseURL: u,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('rasika_token') ||
      localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      'API ERROR:',
      error.response?.status,
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;
