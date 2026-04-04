import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized - try refresh token flow
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const resp = await axios.post('/api/v1/auth/refresh', { refreshToken }, {
          baseURL: api.defaults.baseURL
        });

        const data = resp.data.data || resp.data;
        if (data?.accessToken) {
          const user = { id: data.userId || data.user?.userId, name: data.name || data.user?.name, email: data.email || data.user?.email, roles: data.roles || data.user?.roles || [] };
          useAuthStore.getState().setAuth(user, data.accessToken, data.refreshToken || refreshToken);
          // update header and retry original
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    // Default behavior: propagate error
    return Promise.reject(error);
  }
);

export default api;
