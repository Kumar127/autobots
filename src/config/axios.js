/* global localStorage */

import axios from 'axios';
import eventBus from '../eventBus';

const API_URL = `${process.env.VUE_APP_API_URL}/v1`;

const axiosInst = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.token}`,
  },
});

eventBus.on('login', (token) => {
  // console.log('adding token to axios', token);
  axiosInst.defaults.headers.Authorization = `Bearer ${token}`;
  localStorage.setItem('token', token);
});

// Add a request interceptor
axiosInst.interceptors.request.use((config) => {
  // Do something before request is sent
  if (!config.headers.Authorization || !localStorage.token) {
    const err = new Error('No authentication token found. Should redirect to /login');
    err.code = 'NO_AUTH';
    throw err;
  }
  return config;
}, error => Promise.reject(error));

export default axiosInst;
