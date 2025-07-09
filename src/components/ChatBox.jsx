import { useEffect, useState, useRef } from "react";
import axios from "../utils/AxiosConfig.jsx";
import socket from "../utils/socket.js";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ChatBox = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const { chatId: routeChatId } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/auth/is-authenticated", {
          withCredentials: true,
        });
        const id = res.data.data?._id;
        if (id) setUserId(id);
        if (res.data.message?.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
        }
      } catch (err) {
        const msg = err.response?.data?.message || "";
        if (msg.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
        } else {
          console.log("Not authenticated:", msg || "Unauthenticated");
        }
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (chatId) socket.emit("joinChat", chatId);
    return () => {
      socket.emit("leaveChat", chatId);
    };
  }, [chatId]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.chat === chatId) {
        setMessages((prev) =>
          prev.some((m) => m._id === message._id) ? prev : [...prev, message]
        );
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [chatId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`/message/getmessage/${chatId}`);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    if (chatId) fetchMessages();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const { data } = await axios.post(`/message/sendmessage/${chatId}`, {
        content,
        messageType: "text",
        attachments: [],
      });
      setMessages((prev) =>
        prev.some((m) => m._id === data._id) ? prev : [...prev, data]
      );
      setContent("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 md:p-6 text-white flex flex-col"
    >
      {/* Chat container */}
      <motion.div
        layout
        className="flex-1 overflow-y-auto space-y-3 p-4 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 shadow-inner"
      >
        <AnimatePresence>
          {messages.map((msg) => {
            const isOwn = msg.sender._id === userId;
            return (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-full flex ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-5 py-3 max-w-xs md:max-w-md shadow-xl ${
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-800 text-white rounded-bl-none"
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-300 mb-1">
                    {msg.sender.username}
                  </p>
                  <p className="text-sm leading-snug break-words">{msg.content}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </motion.div>

      {/* Input Box */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 flex gap-3"
      >
        <form action="sendmessage" onSubmit={sendMessage} className="flex w-full gap-3">
          <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-semibold shadow-md transition-all"
        >
          Send
        </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ChatBox;
