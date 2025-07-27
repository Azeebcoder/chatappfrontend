import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/AxiosConfig.jsx";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FiUserPlus, FiCheck, FiX, FiMessageCircle } from "react-icons/fi";

const ViewProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [requested, setRequested] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [chatId, setChatId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/chat/profile/${userId}`);
        const { data } = res.data;
        setUser(data);
        setChatId(data.chatId || "");
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

  const handleMessage = async () => {
    try {
      if (chatId) {
        return navigate(`/message/${chatId}`);
      }
      // If no chat exists, create one
      const res = await axios.post("/message/createchat", {
        userIds: [userId],
        isGroupChat: false,
      });
      const newChatId = res.data._id;
      setChatId(newChatId);
      navigate(`/message/${newChatId}`);
    } catch (err) {
      toast.error("Failed to start chat.");
    }
  };

  if (!user) {
    return <p className="text-center text-gray-600 mt-10">Loading profile...</p>;
  }

  const renderButton = () => {
    if (isFriend) {
      return (
        <div className="flex gap-3 justify-center mt-4">
          <motion.button
            disabled
            className="px-5 py-2 rounded-full bg-green-600 text-white shadow-md flex items-center justify-center gap-2"
          >
            <FiCheck /> Friends
          </motion.button>
          <motion.button
            onClick={handleMessage}
            className="px-5 py-2 rounded-full bg-purple-600 text-white shadow-md hover:bg-purple-700 flex items-center gap-2"
            whileTap={{ scale: 0.95 }}
          >
            <FiMessageCircle /> Message
          </motion.button>
        </div>
      );
    }
    return (
      <div className="flex gap-3 justify-center mt-4">
        <motion.button
          onClick={sendFriendRequest}
          disabled={requested}
          whileTap={{ scale: 0.95 }}
          className={`px-5 py-2 rounded-full flex items-center justify-center gap-2 text-white shadow-md ${
            requested ? "bg-yellow-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <FiUserPlus />
          {requested ? "Requested" : "Add Friend"}
        </motion.button>
        <motion.button
          onClick={handleMessage}
          className="px-5 py-2 rounded-full bg-purple-600 text-white shadow-md hover:bg-purple-700 flex items-center gap-2"
          whileTap={{ scale: 0.95 }}
        >
          <FiMessageCircle /> Message
        </motion.button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex justify-center items-start">
      <div className="w-full max-w-lg bg-gray-900/60 rounded-2xl shadow-xl overflow-hidden relative mt-12">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 relative">
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 w-28 h-28 rounded-full border-4 border-white shadow-md cursor-pointer overflow-hidden"
            onClick={() => setShowImage(true)}
          >
            <img
              src={
                user.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={user.username}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </motion.div>
        </div>

        {/* User Info */}
        <div className="pt-16 pb-6 px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-blue-400"
          >
            {user.name}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 text-sm mt-1"
          >
            @{user.username}
          </motion.p>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-8 mt-4"
          >
            <div className="text-center">
              <p className="text-lg font-bold">23</p>
              <span className="text-sm text-gray-400">Posts</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">134</p>
              <span className="text-sm text-gray-400">Friends</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">89</p>
              <span className="text-sm text-gray-400">Following</span>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 mt-3 text-sm leading-relaxed"
          >
            {user.bio || "This user hasn't added a bio yet."}
          </motion.p>

          {/* Action Buttons */}
          {renderButton()}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {showImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowImage(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-2xl w-full p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 shadow"
                onClick={() => setShowImage(false)}
              >
                <FiX size={20} />
              </button>
              <img
                src={
                  user.profilePic ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt={user.username}
                className="w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewProfile;
