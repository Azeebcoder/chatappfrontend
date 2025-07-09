import { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus } from "react-icons/fi";

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
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-200 via-pink-100 to-amber-100 px-4 py-6">
      {/* Animated Background Bubble Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="w-[200%] h-[200%] bg-[radial-gradient(circle_at_30%_30%,#fcd34d_0%,transparent_40%),radial-gradient(circle_at_70%_70%,#c084fc_0%,transparent_40%)]"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <motion.h2
          className="text-3xl font-bold text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Chats
        </motion.h2>

        {chattedFriends.length === 0 ? (
          <p className="text-gray-600">No chats yet.</p>
        ) : (
          <motion.ul
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.07 } },
            }}
          >
            {chattedFriends.map((user) => (
              <motion.li
                key={user._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Link
                  to={`/message/${user.chats}`}
                  className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-md rounded-xl shadow hover:scale-[1.015] hover:shadow-xl transition-all duration-200"
                >
                  <img
                    src={
                      user.profilePic?.trim()
                        ? user.profilePic
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      {/* Floating Button */}
      <motion.button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Create New Chat"
      >
        <FiPlus className="w-6 h-6" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Start a New Chat</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={isGroupChat}
                  onChange={() => setIsGroupChat(!isGroupChat)}
                />
                <span className="text-gray-700">Group Chat</span>
              </label>

              {isGroupChat && (
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />
              )}

              <div className="max-h-48 overflow-y-auto space-y-2">
                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleUserSelect(user._id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded border transition ${
                      selectedUsers.includes(user._id)
                        ? "bg-green-100 border-green-400 text-green-700"
                        : "bg-gray-100 border-gray-300 text-gray-700"
                    }`}
                  >
                    <img
                      src={
                        user.profilePic?.trim()
                          ? user.profilePic
                          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {user.name}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCreateChat}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Create Chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chats;
