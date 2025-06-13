// src/api/axiosConfig.js
import axios from "axios";


const axiosInstance = axios.create({
  baseURL: "https://chatappbackend-c2bq.onrender.com", // Replace with your backend base URL
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
