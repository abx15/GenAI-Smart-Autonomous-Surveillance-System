import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
  timeout: 30000,
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sass_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 (token refresh)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      // Try refresh
      const refresh = localStorage.getItem('sass_refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(
            process.env.NEXT_PUBLIC_API_URL + '/api/auth/refresh',
            { refreshToken: refresh }
          );
          localStorage.setItem('sass_access_token', data.accessToken);
          err.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(err.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
