// Frontend/src/api/axios.js

import axios from 'axios';
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: 'https://guru-rohan2.onrender.com/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor (token attach)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || 'Something went wrong';

    console.error('❌ API Error:', {
      status,
      message,
      url: error.config?.url,
    });

    // 🔴 401 → logout (except auth pages)
    if (
      status === 401 &&
      !window.location.pathname.includes('/auth')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please login again.');

      setTimeout(() => {
        window.location.replace('/auth/login');
      }, 100);
    }

    // 🟡 Other errors
    else if (status === 400) {
      toast.error(message);
    } else if (status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default instance;
