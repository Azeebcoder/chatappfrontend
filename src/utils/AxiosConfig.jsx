// src/api/axiosConfig.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true, // Needed for cookies
  // Don't set Content-Type globally
});

export default axiosInstance;
