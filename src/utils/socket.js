import {io } from 'socket.io-client'; // Import the io instance from utils/socket.js


const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  transports: ['websocket'], // Optional but helps
});

export default socket;