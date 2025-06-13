import React, { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx"; // Make sure Axios is configured properly

const FriendRequests = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch incoming friend requests
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`/friends/requests`);
        setRequests(res.data.data);
      } catch (err) {
        console.error("Failed to fetch friend requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  const handleAccept = async (requesterId) => {
    try {
      await axios.post("/friends/accept-request", { requesterId });
      setRequests((prev) => prev.filter((r) => r._id !== requesterId));
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

  if (loading) return <div className="text-center text-gray-300">Loading...</div>;

  if (requests.length === 0)
    return <div className="text-center text-gray-400">No friend requests</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-white mb-4">Friend Requests</h2>
      <ul className="space-y-4">
        {requests.map((req) => (
          <li
            key={req._id}
            className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
          >
            <div className="text-white">
              <p className="font-medium">{req.name}</p>
              <p className="text-sm text-gray-400">{req.username}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(req._id)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(req._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendRequests;
