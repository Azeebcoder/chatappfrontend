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
    <div className="relative min-h-screen p-6 overflow-hidden bg-gradient-to-br from-[#fdfbfb] via-[#f3f4f6] to-[#e5e7eb]">
      {/* Static Abstract Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-16 left-12 w-72 h-72 bg-purple-300 rounded-full blur-2xl opacity-20" />
        <div className="absolute bottom-16 right-12 w-96 h-96 bg-indigo-300 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <motion.h2
          className="text-4xl font-extrabold text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Your Chats
        </motion.h2>

        {chattedFriends.length === 0 ? (
          <p className="text-gray-600 text-lg">No recent chats yet.</p>
        ) : (
          <motion.ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
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
                  className="flex items-center gap-4 bg-white shadow-md hover:shadow-xl hover:scale-[1.01] transition rounded-xl p-4"
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
                    <p className="text-gray-800 font-semibold">{user.name}</p>
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
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl transition-all"
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Start a Chat</h3>
                <button onClick={() => setShowForm(false)} className="text-2xl text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>

              <label className="flex items-center gap-2 mb-3 text-gray-700">
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
                  className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
                />
              )}

              <div className="max-h-56 overflow-y-auto space-y-2">
                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleUserSelect(user._id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition border ${
                      selectedUsers.includes(user._id)
                        ? "bg-indigo-100 border-indigo-400 text-indigo-700"
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
                className="mt-5 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
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
