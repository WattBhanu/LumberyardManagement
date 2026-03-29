import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // TEMPORARILY DISABLED - Only for debugging
    // if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    //   localStorage.removeItem('token');
    //   localStorage.removeItem('user');
    //   localStorage.removeItem('role');
    //   window.location.href = '/';
    // }
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default API;
