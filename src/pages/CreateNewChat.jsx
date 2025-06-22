import { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx"; // Your Axios instance
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const CreateChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chattedFriends, setChattedFriends] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState("");

  // ✅ Fetch all friends from backend
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get("/friends/getfriends");
      const friendsArray = response.data.data || [];
      setUsers(friendsArray);
    } catch (err) {
      toast.error("Failed to load users.");
    }
  };

  const fetchChattedUsers = async () => {
    try {
      const response = await axios.get("/chat/getchatteduser");
      const chattedUsers = response.data.data || [];
      setChattedFriends(chattedUsers);
    } catch (err) {
      toast.error("Failed to load chatted users.");
    }
  }


  useEffect(() => {
    fetchAllUsers();
    fetchChattedUsers();
  }, []);

  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    } else {
      setSelectedUsers((prev) => [...prev, userId]);
    }
  };

 const handleCreateChat = async () => {
    if (selectedUsers.length < 1) {
      toast.warning("Select at least one user.");
      return;
    }

    const payload = {
      userIds: selectedUsers, // ✅ Current user is added in backend
      isGroupChat,
      name: isGroupChat ? groupName : undefined,
    };

    try {
      const res = await axios.post("/message/createchat", payload);
      toast.success(isGroupChat ? "Group created!" : "Chat started!");
      fetchChattedUsers();
      setSelectedUsers([]);
      setGroupName("");
    } catch (err) {
      toast.error("Failed to create chat.");
    }
  };
  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg space-y-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">Create New Chat</h2>

      <label className="flex items-center gap-2">
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
          className="p-2 bg-gray-800 border border-gray-600 rounded w-full"
        />
      )}

      <div>
        <p className="mb-2 font-semibold">Select Users:</p>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(users) && users.map((user) => (
            <button
              key={user._id}
              className={`px-3 py-1 rounded border ${
                selectedUsers.includes(user._id)
                  ? "bg-green-600 border-green-500"
                  : "bg-gray-700 border-gray-500"
              }`}
              onClick={() => handleUserSelect(user._id)}
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleCreateChat}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
      >
        Create Chat
      </button>

      <hr className="border-gray-700" />

      <div>
        <h3 className="text-lg font-bold mb-2">Chatted Friends</h3>
        {chattedFriends.length === 0 ? (
          <p>No chats yet.</p>
        ) : (
          <ul className="space-y-2">
            {chattedFriends.map((user) => (
              <Link to={`/message/${user.chats}`} key={user._id} className="flex items-center gap-3">
                <img
                  src={user.profilePic || "/default-avatar.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CreateChat;
