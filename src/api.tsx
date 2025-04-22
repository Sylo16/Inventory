// src/api.tsx
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api', // change this to your actual base URL
  
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default API;

