import { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Camera, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 2 * 1024 * 1024) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    } else {
      toast.error("Image must be under 2MB");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        formDataToSend.append(key, value)
      );
      if (profilePic) formDataToSend.append("profilePic", profilePic);

      const res = await axios.post("/auth/register", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("Registered successfully");
        navigate("/verify-email");
      } else {
        toast.error(res.data.message || "Failed to register");
      }
    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg?.toLowerCase().includes("user already exists")) {
        setErrors({ username: "Username already exists" });
      } else if (msg?.toLowerCase().includes("invalid email")) {
        setErrors({ email: "Invalid email format" });
      } else {
        toast.error(msg || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 text-white px-4 overflow-hidden font-sans">
      {/* Background Blobs */}
      <motion.div
        className="absolute w-72 h-72 bg-purple-700 rounded-full opacity-20 blur-3xl"
        animate={{ x: [0, 200, 0], y: [0, -150, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-2xl top-20 left-20"
        animate={{ x: [-100, 100, -100], y: [100, -100, 100] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md z-10 bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl font-bold text-center mb-6 font-serif">
          Create an Account
        </h2>

        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <label htmlFor="profilePic" className="relative w-24 h-24">
            <img
              src={
                preview ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Preview"
              className="w-full h-full object-cover rounded-full border-2 border-purple-500"
            />
            <div className="absolute bottom-0 right-0 p-2 bg-white rounded-full cursor-pointer hover:bg-purple-200 transition">
              <Camera size={18} className="text-purple-700" />
            </div>
            <input
              id="profilePic"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className={`w-full bg-gray-700 border px-4 py-3 rounded-md focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:ring-purple-500"
              }`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`w-full bg-gray-700 border px-4 py-3 rounded-md focus:outline-none focus:ring-2 ${
                errors.username
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:ring-purple-500"
              }`}
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`w-full bg-gray-700 border px-4 py-3 rounded-md focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:ring-purple-500"
              }`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className={`w-full bg-gray-700 border px-4 py-3 pr-12 rounded-md focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-purple-500"
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 transition rounded-md font-semibold"
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-400 hover:underline hover:text-purple-300"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
