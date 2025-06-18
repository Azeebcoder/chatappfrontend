import { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import InputField from "../components/InputField.jsx";
import SubmitButton from "../components/SubmitButton.jsx";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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

        // Maintain aspect ratio
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
      formDataToSend.append("name", formData.name);
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
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

      setTimeout(() => {
        navigate("/verify-email");
      }, 1000);
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
        const message = err.response?.data?.message || "";
        if (message.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
          Create Account
        </h2>

        {/* 👤 Profile Image Section */}
        <div className="flex justify-center mb-6 relative">
          <div className="relative w-28 h-28">
            <img
              src={
                previewImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Preview"
              className="w-28 h-28 rounded-full object-cover border-2 border-blue-300 shadow"
            />
            <label
              htmlFor="profileInput"
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-blue-50"
            >
              <Camera size={20} className="text-blue-600" />
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
            className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition"
          >
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}
