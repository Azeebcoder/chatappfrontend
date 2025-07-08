import { useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import socket from "../utils/socket.js"; // ✅ import socket
import { useNavigate, useParams } from "react-router-dom";

const ChatBox = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const { chatId: routeChatId } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");

  // ✅ Check user auth and get user ID
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/auth/is-authenticated", {
          withCredentials: true,
        });

        const { success, message } = res.data;
        const id = res.data.data?._id;
        if (id) setUserId(id);

        if (message && message.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
        }
      } catch (err) {
        const message = err.response?.data?.message || "";
        if (message.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
        } else {
          console.log("Not authenticated:", message || "Unauthenticated");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  // ✅ Join chat room on mount
  useEffect(() => {
    if (chatId) {
      socket.emit("joinChat", chatId);
    }

    return () => {
      socket.emit("leaveChat", chatId); // Optional if backend supports it
    };
  }, [chatId]);

  // ✅ Listen for incoming socket messages
  useEffect(() => {
    socket.on("newMessage", (message) => {
      if (message.chat === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [chatId]);

  // ✅ Fetch past messages
  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/message/getmessage/${chatId}`);
      setMessages(data);
      console.log("Fetched messages:", data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  // ✅ Send new message
  const sendMessage = async () => {
    if (!content.trim()) return;
    try {
      const { data } = await axios.post(`/message/sendmessage/${chatId}`, {
        content,
        messageType: "text",
        attachments: [],
      });

      // Message will also come via socket if backend emits it
      setMessages((prev) => [...prev, data]);
      setContent("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-5">
      {/* Chat Messages */}
      <div className="h-[450px] overflow-y-auto space-y-4 px-2 py-3 bg-gray-50 border rounded-md">
        {messages.map((msg) => {
          const isOwn = msg.sender._id === userId;
          return (
            <div
              key={msg._id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[75%] shadow-md ${
                  isOwn
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="text-xs mb-1 font-semibold opacity-80">
                  {msg.sender.username}
                </p>
                <p className="break-words">{msg.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="flex mt-4 gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
