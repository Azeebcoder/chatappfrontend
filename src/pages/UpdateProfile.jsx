import React, { useState, useEffect, useRef } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { toast } from "react-toastify";
import { FiCamera } from "react-icons/fi";

const UpdateProfile = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/chat/me");
        setName(data.data.name);
        setPreview(data.data.profilePic);
      } catch (error) {
        toast.error("Failed to load user info");
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (password) formData.append("password", password);
      if (profilePic) formData.append("file", profilePic);

      const { data } = await axios.put("/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated");
      setPassword("");
      setPreview(data.user.profilePic);
    } catch (error) {
      const msg = error?.response?.data?.message || "Update failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Update Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image with Always-Visible Camera Icon */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <img
              src={preview || "/default-avatar.png"}
              alt="Profile"
              onClick={triggerFileInput}
              className="w-full h-full rounded-full object-cover border-4 border-purple-300 cursor-pointer"
            />
            <div
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-purple-600 p-1.5 rounded-full cursor-pointer hover:bg-purple-700 transition"
            >
              <FiCamera className="text-white text-sm" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="w-full border rounded-md px-4 py-2 mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            className="w-full border rounded-md px-4 py-2 mt-1"
            placeholder="Leave blank to keep current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition w-full"
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
