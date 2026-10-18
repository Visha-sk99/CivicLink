import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('civiclink_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const token = parsed.token || parsed.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore bad localStorage
  }
  return config;
});

// Optional: force logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // localStorage.removeItem('civiclink_user');
      // window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;