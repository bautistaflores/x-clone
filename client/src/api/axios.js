import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // JWT guardado al loguear
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
