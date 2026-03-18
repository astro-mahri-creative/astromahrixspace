// API configuration
// Uses relative paths so each deploy (production, preview, dev) calls its own
// serverless functions automatically — no hardcoded origins needed.
import axios from "axios";

export const API_ENDPOINTS = {
  products: "/api/products",
  game: "/api/game",
  users: "/api/users",
  orders: "/api/orders",
};

// Axios instance with base configuration
export const apiClient = axios.create({
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
