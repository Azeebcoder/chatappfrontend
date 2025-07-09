import React, { useState, useEffect } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { FaUserPlus, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import socket from "../utils/socket.js";
import { useNavigate } from "react-router-dom";

const SearchUser = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState({});

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() !== "") {
        fetchUsers();
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/chat/searchedusers?search=${query}`);
      const fetchedUsers = res.data.data;

      const requestsMap = {};
      fetchedUsers.forEach((user) => {
        requestsMap[user._id] = user.isRequested;
      });

      setUsers(fetchedUsers);
      setFriendRequests(requestsMap);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate()

  const sendFriendRequest = async (toUserId) => {
    try {
      await axios.post(`/friends/send-request`, { toUserId });
      setFriendRequests((prev) => ({ ...prev, [toUserId]: true }));
    } catch (err) {
      console.error("Friend request failed:", err);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-start justify-center px-4 py-10 bg-cover bg-center"
      style={{
        backgroundImage: "url(https://source.unsplash.com/1600x900/?people,network)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white/80 backdrop-blur-lg p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-white/30"
      >
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white/70">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent w-full text-sm md:text-base outline-none placeholder-gray-400 text-gray-800"
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="text-gray-600 text-center">Searching...</p>
          ) : users.length === 0 && query ? (
            <p className="text-gray-500 text-center">No users found.</p>
          ) : (
            <ul className="space-y-4">
              {users.map((user) => (
                <motion.li
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => navigate(`/view-profile/${user._id}`)}
                  className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-xl bg-white/80 border border-gray-200 shadow hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 mb-2 sm:mb-0 w-full sm:w-auto">
                    <img
                      src={
                        user.profilePic ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {user.username}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">{user.name}</p>
                    </div>
                  </div>

                  {user.isFriend ? (
                    <span className="text-green-600 font-semibold text-sm">Friends</span>
                  ) : (
                    <button
                      onClick={() => sendFriendRequest(user._id)}
                      disabled={friendRequests[user._id]}
                      className={`flex items-center justify-center gap-1 px-4 py-1.5 text-sm font-medium rounded-full transition shadow-sm ${
                        friendRequests[user._id]
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      <FaUserPlus className="text-sm" />
                      {friendRequests[user._id] ? "Requested" : "Add"}
                    </button>
                  )}
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SearchUser;
