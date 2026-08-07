import axios from 'axios';

// ✅ Hardcode the API URL for production
const API_URL = 'https://college-management-system-8omk.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;