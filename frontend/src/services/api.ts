
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medease_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('medease_token');
      localStorage.removeItem('medease_user');

      const base = import.meta.env.BASE_URL.replace(/\/$/, '');
      const loginPath = `${base}/login`;
      const rootPath = `${base}/`;

      if (
        window.location.pathname !== loginPath &&
        window.location.pathname !== rootPath
      ) {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
