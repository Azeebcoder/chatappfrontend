import { useState, useEffect } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";

function Login() {
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
      const { success, message } = res.data;

      if (success) {
        toast.success(message || "Login successful");
        navigate("/");
      } else {
        toast.error(message || "Login failed");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
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

        const { success, message } = res.data;

        if (message?.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
        } else if (success) {
          navigate("/");
        }
      } catch (err) {
        const msg = err.response?.data?.message || "";
        if (msg.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 font-sans overflow-hidden bg-gray-900">
      {/* 🎨 Animated Background Blobs */}
      <motion.div
        className="absolute w-72 h-72 bg-purple-600 rounded-full opacity-30 blur-3xl"
        animate={{ x: [0, 200, 0], y: [0, -200, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-pink-500 rounded-full opacity-20 blur-2xl top-20 left-20"
        animate={{ x: [-100, 100, -100], y: [100, -100, 100] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-blue-500 rounded-full opacity-25 blur-2xl bottom-10 right-10"
        animate={{ x: [100, -100, 100], y: [-50, 50, -50] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10 bg-gray-800/80 backdrop-blur-xl text-white rounded-2xl shadow-2xl p-8"
      >
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-extrabold text-center mb-6 font-serif"
        >
          Login to Your Account
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="relative">
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-300 hover:text-white focus:outline-none"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 transition rounded-lg font-semibold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-sm text-gray-400"
        >
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-purple-400 hover:underline hover:text-purple-300"
          >
            Register
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Login;
