import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const ChatHeader = ({ chatId,chatUser,setChatUser, isChatUserOnline }) => {
  const getInitial = (name) => name?.[0]?.toUpperCase() || "U";

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatUser = async () => {
      try {
        const { data } = await axios.get(`/message/user/${chatId}`);
        setChatUser(data);
      } catch (err) {
        console.error("Error fetching chat user:", err);
      }
    };
    if (chatId) fetchChatUser();
  }, [chatId]);

  const formatLastSeen = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-lg border-b border-white/10 z-50 shadow-lg"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative"
      >
        {chatUser?.profilePic ? (
          <img
            src={chatUser.profilePic}
            alt="profile"
            className="w-11 h-11 rounded-full border border-white/20 object-cover shadow-md"
            onClick={() => {navigate(`/view-profile/${chatUser._id}`)}}
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold border border-white/20 shadow-md">
            {getInitial(chatUser?.username)}
          </div>
        )}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
            isChatUserOnline ? "bg-green-400 shadow-green-400 shadow" : "bg-gray-500"
          }`}
        />
      </motion.div>

      <div className="flex flex-col">
        <h2 className="text-base font-semibold text-white tracking-wide">
          {chatUser?.name || "Unknown"}
        </h2>
        <p className="text-xs text-gray-400 flex items-center gap-2">
          @{chatUser?.username}
          {isChatUserOnline ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-green-400 flex items-center gap-1"
            >
              <FaCircle size={8} /> Online
            </motion.span>
          ) : (
            <span className="text-gray-500 flex items-center gap-1">
              <FaCircle size={8} /> Last seen{" "}
              {chatUser?.lastSeen ? formatLastSeen(chatUser.lastSeen) : "unknown"}
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
