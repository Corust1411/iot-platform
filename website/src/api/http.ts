import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('🔒 Token expired or unauthorized. Logging out...');
      
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      window.location.href = '/login'; 
    }
    
    return Promise.reject(error);
  }
);