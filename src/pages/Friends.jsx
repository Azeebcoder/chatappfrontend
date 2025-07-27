import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../utils/AxiosConfig.jsx";
import { FiCheck, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const Friends = () => {
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, friendsRes] = await Promise.all([
          axios.get(`/friends/requests`),
          axios.get(`/friends/getfriends`),
        ]);
        setRequests(requestsRes.data.data || []);
        setFriends(friendsRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAccept = async (requesterId) => {
    try {
      await axios.post("/friends/accept-request", { requesterId });
      const accepted = requests.find((r) => r._id === requesterId);
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
      if (accepted) setFriends((prev) => [...prev, accepted]);
    } catch (err) {
      console.error("Error accepting request", err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post("/friends/reject-request", { requestId });
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error("Error rejecting request", err);
    }
  };
  const handleProfileClick = async (userId) => {
    navigate(`/view-profile/${userId}`);
  }
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-blue-400 text-xl font-semibold"
        >
          Loading Friends...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white px-6 py-10 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-green-400/10 rounded-full blur-2xl"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-16">
        {/* Friend Requests */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Friend Requests
          </h2>
          <AnimatePresence>
            {requests.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400"
              >
                No friend requests
              </motion.p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {requests.map((req) => (
                  <motion.div
                    key={req._id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={()=>handleProfileClick(req._id)}
                    whileHover={{
                      y: -5,
                      scale: 1.02,
                      boxShadow:
                        "0px 6px 16px rgba(0, 0, 0, 0.4), 0px 3px 10px rgba(59, 130, 246, 0.3)",
                    }}
                    className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-center shadow-lg border border-gray-700"
                  >
                    {/* Profile Image */}
                    {req.profilePic ? (
                      <img
                        src={req.profilePic}
                        alt={req.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-800 mb-4 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-md mb-4 border-4 border-gray-800">
                        {req.name.charAt(0)}
                      </div>
                    )}

                    <p className="text-lg font-semibold">{req.name}</p>
                    <p className="text-sm text-gray-400">@{req.username}</p>
                    <div className="mt-5 flex gap-3 w-full">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAccept(req._id)}
                        className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 px-4 py-2 rounded-lg text-white font-medium shadow-md"
                      >
                        <FiCheck className="inline mr-1" /> Accept
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(req._id)}
                        className="flex-1 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 px-4 py-2 rounded-lg text-white font-medium shadow-md"
                      >
                        <FiX className="inline mr-1" /> Reject
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* Friends List */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
            Your Friends
          </h2>
          {friends.length === 0 ? (
            <p className="text-center text-gray-400">
              You have no friends yet.
            </p>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
              {friends.map((friend) => (
                <motion.div
                key={friend._id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  scale: 1.01,
                  boxShadow:
                  "0px 6px 16px rgba(0, 0, 0, 0.4), 0px 3px 10px rgba(34, 197, 94, 0.3)",
                }}
                className="bg-gray-800/60 backdrop-blur-lg p-5 rounded-xl flex items-center gap-4 border border-gray-700"
                onClick={()=>handleProfileClick(friend._id)}
                >
                  {friend.profilePic ? (
                    <img
                      src={friend.profilePic}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-800 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-400 text-white flex items-center justify-center font-bold">
                      {friend.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{friend.name}</p>
                    <p className="text-sm text-gray-400">@{friend.username}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Friends;
