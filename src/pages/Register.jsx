import { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import InputField from "../components/InputField.jsx";
import SubmitButton from "../components/SubmitButton.jsx";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🛠️ Handles form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Registration Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/auth/register", formData);

      if (!res.data.success) {
        return toast.error(res.data.message || "Registration failed");
      }

      toast.success(res.data.message || "Registration successful");
      
      // 🔁 Redirect to verify email
      setTimeout(() => {
        navigate("/verify-email");
      }, 1000);

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check if user is already authenticated or needs email verification
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />
          <InputField
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
          <InputField
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <SubmitButton loading={loading} text="Register" />
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline hover:text-blue-800 transition duration-200"
          >
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}
