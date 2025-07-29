import { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus } from "react-icons/fi";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Chats = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chattedFriends, setChattedFriends] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [friendsRes, chattedRes] = await Promise.all([
          axios.get("/friends/getfriends"),
          axios.get("/chat/getchatteduser"),
        ]);
        setUsers(friendsRes.data.data || []);
        setChattedFriends(chattedRes.data.data || []);
      } catch {
        toast.error("Failed to load users.");
      }
    };

    fetchAll();
  }, []);

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length < 1) {
      toast.warning("Select at least one user.");
      return;
    }

    try {
      await axios.post("/message/createchat", {
        userIds: selectedUsers,
        isGroupChat,
        name: isGroupChat ? groupName : undefined,
      });
      toast.success(isGroupChat ? "Group created!" : "Chat started!");
      setSelectedUsers([]);
      setGroupName("");
      setShowForm(false);
    } catch {
      toast.error("Failed to create chat.");
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-br from-gray-900 to-black text-white p-6">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto space-y-10 z-10 relative">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-blue-400 tracking-wide"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your Chats
        </motion.h2>

        {chattedFriends.length === 0 ? (
          <motion.p
            className="text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            No recent chats yet.
          </motion.p>
        ) : (
          <motion.ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.1,
                },
              },
            }}
          >
            {chattedFriends.map((user) => (
              <motion.li
                key={user._id}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-800/90 rounded-xl shadow-lg p-4 transition-all border border-gray-700 hover:shadow-blue-700/40"
              >
                <Link to={`/message/${user.chatId}`} className="flex items-center gap-4">
                  <img
                    src={
                      user.profilePic?.trim()
                        ? user.profilePic
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-600"
                  />
                  <div>
                    <p className="text-white font-medium text-base">{user.name}</p>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      {/* Floating Create Button */}
      <motion.button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Create New Chat"
      >
        <FiPlus className="w-6 h-6" />
      </motion.button>

      {/* Create Chat Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-center items-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-700 text-white"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold text-blue-400">Start a Chat</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-2xl text-gray-400 hover:text-red-500"
                >
                  &times;
                </button>
              </div>

              <label className="flex items-center gap-2 mb-3 text-gray-300">
                <input
                  type="checkbox"
                  checked={isGroupChat}
                  onChange={() => setIsGroupChat(!isGroupChat)}
                />
                Group Chat
              </label>

              {isGroupChat && (
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full mb-4 p-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
              )}

              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {users.map((user) => (
                  <motion.button
                    key={user._id}
                    onClick={() => handleUserSelect(user._id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-200 ${
                      selectedUsers.includes(user._id)
                        ? "bg-blue-600 border-blue-400 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <img
                      src={
                        user.profilePic?.trim()
                          ? user.profilePic
                          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-500"
                    />
                    {user.name}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={handleCreateChat}
                className="mt-5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                whileTap={{ scale: 0.98 }}
              >
                Create Chat
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chats;
