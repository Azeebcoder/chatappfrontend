import { useState,useEffect } from 'react';
import axios from '../utils/AxiosConfig.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const [formData, setFormData] = useState({ username : '', password: '' });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", formData);
      const { success, message, user } = res.data;
      if (success) {
        toast.success(message || "Login successful");
        navigate("/");
      } else {
        console.error("Login failed:", message);
        toast.error(message || "Login failed");
      }
    }  catch (error) {
  const message = error?.response?.data?.message || 'Login failed. Please try again.';
  toast.error(message); // <-- Show actual error from server
}

    
  };

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await axios.get("/auth/is-authenticated", {
        withCredentials: true,
      });

      const { success, message } = res.data;

      if (message && message.toLowerCase().includes("not verified")) {
        navigate("/verify-email");
      } else if (success) {
        navigate("/");
      }
    } catch (err) {
      const message = err.response?.data?.message || "";
      if (message.toLowerCase().includes("not verified")) {
        navigate("/verify-email");  // <-- Redirect here when 403 and "User is not verified"
      } else {
        console.log("Not authenticated:", message || "Unauthenticated");
      }
    }
  };

  checkAuth();
}, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-center">Login to Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input
              type="username"
              name="username"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 py-3 font-semibold hover:bg-purple-700 transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Don’t have an account? <a href="/register" className="text-purple-400 hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
