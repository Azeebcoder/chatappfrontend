// src/api/axiosConfig.js
import axios from "axios";


const axiosInstance = axios.create({
  baseURL: process.env.VITE_BACKEND_URL, // Replace with your backend base URL
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
