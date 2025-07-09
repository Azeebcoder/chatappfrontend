import { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resizeImage = (file, maxWidth = 300, maxHeight = 300) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob], file.name, { type: file.type });
            resolve(resizedFile);
          },
          file.type,
          0.8
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Please select an image smaller than 2MB.");
        return;
      }

      const resized = await resizeImage(file);
      setProfilePic(resized);
      setPreviewImage(URL.createObjectURL(resized));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        formDataToSend.append(key, value)
      );
      if (profilePic) {
        formDataToSend.append("profilePic", profilePic);
      }

      const res = await axios.post("/auth/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (!res.data.success) {
        return toast.error(res.data.message || "Registration failed");
      }

      toast.success(res.data.message || "Registration successful");
      setTimeout(() => navigate("/verify-email"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
    <div className="relative min-h-screen bg-gray-900 overflow-hidden flex items-center justify-center px-4">
      {/* Animated Background */}
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

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 bg-white/10 backdrop-blur-lg p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md text-white"
      >
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

        {/* Profile Pic */}
        <div className="flex justify-center mb-6 relative">
          <div className="relative w-28 h-28">
            <img
              src={
                previewImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Preview"
              className="w-28 h-28 rounded-full object-cover border-2 border-purple-400 shadow-lg"
            />
            <label
              htmlFor="profileInput"
              className="absolute bottom-0 right-0 bg-white text-purple-600 p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100"
            >
              <Camera size={18} />
            </label>
            <input
              id="profileInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Password with Toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-800 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition font-semibold"
          >
            {loading ? "Creating..." : "Register"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-300 mt-4">
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
