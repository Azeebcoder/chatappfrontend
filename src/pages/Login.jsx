// src/pages/Login.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../utils/AxiosConfig.jsx";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", formData);
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/");
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/auth/is-authenticated", {
          withCredentials: true,
        });
        if (res.data.success) navigate("/");
        else if (res.data.message?.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
        }
      } catch (err) {
        if (err.response?.data?.message?.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
        }
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden px-4">
      {/* 🔮 Background animations */}
      <motion.div className="absolute w-96 h-96 bg-purple-500 opacity-30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      />
      <motion.div className="absolute w-72 h-72 bg-blue-500 opacity-20 rounded-full blur-3xl top-0 right-0"
        animate={{ scale: [1, 1.1, 1], rotate: [360, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="z-10 w-full max-w-md bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-white"
      >
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm mb-1 block">Username</label>
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-gray-700 px-4 py-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
              placeholder="Enter username"
            />
          </div>

          {/* 👁️‍🗨️ Password field with centered icon */}
          <div>
            <label className="text-sm mb-1 block">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-700 px-4 py-3 pr-12 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-300" />
                ) : (
                  <Eye size={20} className="text-gray-300" />
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 transition rounded-lg py-3 font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-400">
          Don’t have an account?{" "}
          <Link to={'/register'} className="text-purple-400 hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
