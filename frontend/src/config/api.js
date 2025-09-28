// API configuration for different environments
const API_CONFIG = {
  development: "http://localhost:8889", // Netlify dev server
  production: "https://astromahri.space",
};

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? API_CONFIG.production
    : API_CONFIG.development;

export const API_ENDPOINTS = {
  products: `${BASE_URL}/api/products`,
  game: `${BASE_URL}/api/game`,
  users: `${BASE_URL}/api/users`,
  orders: `${BASE_URL}/api/orders`,
};

// Axios instance with base configuration
import axios from "axios";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
