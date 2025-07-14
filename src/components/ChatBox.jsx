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
  const [chatUser, setChatUser] = useState(null);
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
    const fetchChatUser = async () => {
      try {
        const { data } = await axios.get(`/message/user/${chatId}`);
        setChatUser(data);
      } catch (error) {
        console.error("Error fetching chat user:", error);
      }
    };
    if (chatId) fetchChatUser();
  }, [chatId]);

  useEffect(() => {
    if (chatId) socket.emit("joinChat", chatId);
    return () => {
      socket.emit("leaveChat", chatId);
    };
  }, [chatId]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.chat === chatId) {
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (m) =>
              m._id === message._id ||
              (m.status === "sending" && m.content === message.content)
          );
          return alreadyExists ? prev : [...prev, message];
        });
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

  const sendMessage = async (e, retryTempId = null) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed && !retryTempId) return;

    const tempId = retryTempId || `temp-${Date.now()}`;
    const msgContent = retryTempId
      ? messages.find((m) => m._id === retryTempId)?.content
      : trimmed;

    const tempMessage = {
      _id: tempId,
      content: msgContent,
      sender: { _id: userId, username: "You" },
      chat: chatId,
      status: "sending",
    };

    if (!retryTempId) {
      setMessages((prev) => [...prev, tempMessage]);
      setContent("");
    } else {
      setMessages((prev) =>
        prev.map((m) => (m._id === retryTempId ? tempMessage : m))
      );
    }

    try {
      const { data } = await axios.post(`/message/sendmessage/${chatId}`, {
        content: msgContent,
        messageType: "text",
        attachments: [],
      });

      setMessages((prev) => {
        // Remove temp if exists and add actual only if not present
        const withoutTemp = prev.filter((m) => m._id !== tempId);
        const alreadyExists = withoutTemp.some((m) => m._id === data._id);
        return alreadyExists ? withoutTemp : [...withoutTemp, data];
      });
    } catch (error) {
      console.error("Message failed:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      {/* Header */}
      {chatUser && (
        <div className="sticky top-0 z-30 flex items-center gap-4 px-4 py-3 bg-white/10 backdrop-blur border-b border-white/10 shadow-md">
          {chatUser?.profilePic ? (
            <img
              src={chatUser.profilePic}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold border border-white/20">
              {getInitial(chatUser.username)}
            </div>
          )}
          <div>
            <h2 className="text-base font-semibold">{chatUser.name || "Unknown"}</h2>
            <p className="text-xs text-gray-300">@{chatUser.username}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-16 sm:pb-0">
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
                } gap-2`}
              >
                {!isOwn && (
                  <div className="min-w-9 w-9 h-9">
                    {chatUser.profilePic ? (
                      <img
                        src={chatUser.profilePic}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover mt-1 border border-white/20"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold mt-1">
                        {getInitial(chatUser.username)}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-5 py-3 max-w-xs md:max-w-md shadow-xl relative ${
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-800 text-white rounded-bl-none"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold text-gray-300 mb-1">
                      {msg.sender.username}
                    </p>
                  )}
                  <p className="text-sm leading-snug break-words">{msg.content}</p>

                  {/* Status Indicators */}
                  {isOwn && msg.status === "sending" && (
                    <span className="absolute -bottom-4 right-2 text-xs text-gray-400">Sending...</span>
                  )}
                  {isOwn && msg.status === "failed" && (
                    <button
                      className="absolute -bottom-4 right-2 text-xs text-red-400 underline"
                      onClick={(e) => sendMessage(e, msg._id)}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-30 bg-white/10 backdrop-blur px-4 py-3 border-t border-white/10">
        <form onSubmit={sendMessage} className="flex w-full gap-3">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={!content.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-xl font-semibold shadow-md transition-all"
          >
            Send
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
