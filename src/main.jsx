import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext";
import './index.css';

// Import PWA register helper
import { registerSW } from 'virtual:pwa-register';

// Register service worker
registerSW({
  onNeedRefresh() {
    // Optional: prompt user to refresh
    console.log('New content available. Please refresh.');
  },
  onOfflineReady() {
    // Optional: notify user
    console.log('App is ready to work offline.');
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
