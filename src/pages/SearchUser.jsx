import React, { useState, useEffect } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { FaUserPlus, FaSearch } from "react-icons/fa";

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/chat/searchedusers?search=${query}`);
      const fetchedUsers = res.data.data;

      // Build friendRequests map
      const requestsMap = {};
      fetchedUsers.forEach(user => {
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

  const sendFriendRequest = async (toUserId) => {
    try {
      await axios.post(`/friends/send-request`, { toUserId });
      setFriendRequests((prev) => ({ ...prev, [toUserId]: true }));
    } catch (err) {
      console.error("Friend request failed:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-900 text-white rounded-lg shadow-md">
      <div className="flex items-center border border-gray-700 rounded-lg px-3 py-2 mb-4">
        <FaSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent w-full outline-none placeholder-gray-400"
        />
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Searching...</p>
      ) : users.length === 0 && query ? (
        <p className="text-gray-500 text-sm">No users found.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              className="flex items-center justify-between p-2 border-b border-gray-700"
            >
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-400">{user.name}</p>
              </div>
              <button
                onClick={() => sendFriendRequest(user._id)}
                disabled={friendRequests[user._id]}
                className={`flex items-center px-3 py-1 rounded text-sm ${
                  friendRequests[user._id]
                    ? "bg-green-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <FaUserPlus className="mr-1" />
                {friendRequests[user._id] ? "Requested" : "Add"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchUser;
  