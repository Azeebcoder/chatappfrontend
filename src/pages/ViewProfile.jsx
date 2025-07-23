import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/AxiosConfig.jsx";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FiUserPlus, FiCheck } from "react-icons/fi";

const ViewProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [requested, setRequested] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/chat/profile/${userId}`);
        const { data } = res.data;
        setUser(data);
        setRequested(data.isRequested);
        setIsFriend(data.isFriend);
      } catch (err) {
        toast.error("Failed to fetch user profile.");
      }
    };
    fetchUser();
  }, [userId]);

  const sendFriendRequest = async () => {
    try {
      await axios.post("/friends/send-request", { toUserId: userId });
      setRequested(true);
      toast.success("Friend request sent.");
    } catch (err) {
      toast.error("Failed to send request.");
    }
  };

  if (!user) {
    return <p className="text-center text-gray-600 mt-10">Loading profile...</p>;
  }

  const renderButton = () => {
    if (isFriend) {
      return (
        <motion.button
          disabled
          className="mt-6 inline-flex items-center justify-center px-5 py-2 rounded-full bg-green-600 text-white cursor-not-allowed shadow"
        >
          <FiCheck className="mr-2" />
          Friends
        </motion.button>
      );
    }

    return (
      <motion.button
        onClick={sendFriendRequest}
        disabled={requested}
        whileTap={{ scale: 0.95 }}
        className={`mt-6 inline-flex items-center justify-center px-5 py-2 rounded-full transition text-white shadow ${
          requested
            ? "bg-yellow-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        <FiUserPlus className="mr-2" />
        {requested ? "Requested" : "Add Friend"}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-pink-100 via-purple-100 to-yellow-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/30 text-center"
      >
        <img
          src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          alt={user.username}
          className="w-24 h-24 rounded-full mx-auto object-cover border mb-4"
        />
        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-sm text-gray-500">@{user.username}</p>
        <p className="text-gray-600 mt-2">{user.bio || "No bio available."}</p>

        {renderButton()}
      </motion.div>
    </div>
  );
};

export default ViewProfile;
