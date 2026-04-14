import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '/api';

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000,
});

export default client;
