import React, { useState, useEffect, useRef } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { toast } from "react-toastify";
import { FiCamera, FiUser, FiMail, FiLock, FiFileText } from "react-icons/fi";
import { motion } from "framer-motion";

const UpdateProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // read-only
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/chat/me");
        setName(data.data.name);
        setEmail(data.data.email);
        setBio(data.data.bio || "");
        setPreview(data.data.profilePic);
      } catch (error) {
        toast.error("Failed to load user info");
      }
    };
    fetchUser();
  }, []);


  useEffect(() => {
    if (!profilePic) return;
    const objectUrl = URL.createObjectURL(profilePic);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      if (password) formData.append("password", password);
      if (profilePic) formData.append("profilePic", profilePic);

      const { data } = await axios.put("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      console.log(data)

      toast.success("Profile updated successfully!");
      setPassword("");
      setPreview(data.user.profilePic);
      setIsEditing(false);
    } catch (error) {
      const msg = error?.response?.data?.message || "Update failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setProfilePic(file);
  };

  const triggerFileInput = () => fileInputRef.current.click();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex justify-center items-start">
      <div className="w-full max-w-2xl bg-gray-900/60 rounded-2xl shadow-xl p-8 mt-12">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-purple-400 mb-8"
        >
          Edit Profile
        </motion.h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="relative w-28 h-28">
              <img
                src={preview || "/default-avatar.png"}
                alt="Profile"
                onClick={triggerFileInput}
                className="w-full h-full rounded-full object-cover border-4 border-purple-500 cursor-pointer hover:scale-105 transition-transform duration-300"
              />
              <div
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition"
              >
                <FiCamera className="text-white text-lg" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </motion.div>

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <FiUser /> Name
            </label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <FiMail /> Email (Read-only)
            </label>
            <input
              type="email"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mt-1 text-gray-400"
              value={email}
              readOnly
            />
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <FiFileText /> Bio
            </label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder="Tell something about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <FiLock /> New Password
            </label>
            <input
              type="password"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 mt-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-6">
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg transition"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium px-6 py-2 rounded-lg transition"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
