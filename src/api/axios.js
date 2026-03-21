import axios from "axios";

const fallbackBase = (() => {
  if (typeof window === "undefined") {
    return "https://micro-wala.onrender.com/api";
  }

  return "https://micro-wala.onrender.com/api";
})();

const API_BASE = import.meta.env.VITE_API_URL || fallbackBase;

const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
