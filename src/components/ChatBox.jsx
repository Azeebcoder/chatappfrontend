// import { useEffect, useLayoutEffect, useState, useRef } from "react";
// import axios from "../utils/AxiosConfig.jsx";
// import socket from "../utils/socket.js";
// import { useNavigate, useParams } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";

// const ChatBox = ({ chatId }) => {
//   const [messages, setMessages] = useState([]);
//   const [content, setContent] = useState("");
//   const [userId, setUserId] = useState("");
//   const [chatUser, setChatUser] = useState(null);
//   const [skip, setSkip] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [limit] = useState(20);
//   const [typing, setTyping] = useState(false);
//   const [isChatUserOnline, setIsChatUserOnline] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);

//   const inputRef = useRef(null);
//   const bottomRef = useRef(null);
//   const containerRef = useRef(null);
//   const notificationAudio = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const navigate = useNavigate();
//   const { chatId: routeChatId } = useParams();

//   useEffect(() => {
//     notificationAudio.current = new Audio("/notification.mp3");
//     notificationAudio.current.load();
//   }, []);

//   useLayoutEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;
//     const isNearBottom =
//       container.scrollHeight - container.scrollTop - container.clientHeight < 100;
//     if (isNearBottom) {
//       bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await axios.get("/auth/is-authenticated", { withCredentials: true });
//         const id = res.data.data?._id;
//         if (id) {
//           setUserId(id);
//           localStorage.setItem("userId", id);
//         }
//         if (res.data.message?.toLowerCase().includes("not verified")) {
//           navigate("/verify-email");
//         }
//       } catch (err) {
//         const msg = err.response?.data?.message || "";
//         if (msg.toLowerCase().includes("not verified")) {
//           navigate("/verify-email");
//         }
//       }
//     };
//     checkAuth();
//   }, [navigate]);

//   useEffect(() => {
//     const fetchChatUser = async () => {
//       try {
//         const { data } = await axios.get(`/message/user/${chatId}`);
//         setChatUser(data);
//       } catch (err) {
//         console.error("Error fetching chat user:", err);
//       }
//     };
//     if (chatId) fetchChatUser();
//   }, [chatId]);

//   useEffect(() => {
//     if (chatId) socket.emit("joinChat", chatId);
//     return () => socket.emit("leaveChat", chatId);
//   }, [chatId]);

//   useEffect(() => {
//     const handleNewMessage = (message) => {
//       if (message.chat === chatId) {
//         setMessages((prev) => {
//           const exists = prev.some((m) => m._id === message._id);
//           return exists ? prev : [...prev, message];
//         });

//         if (message.sender._id !== userId) {
//           notificationAudio.current?.play().catch((err) => console.warn("Sound failed:", err));
//         }
//       }
//     };

//     socket.on("newMessage", handleNewMessage);
//     return () => socket.off("newMessage", handleNewMessage);
//   }, [chatId, userId]);

//   useEffect(() => {
//     socket.on("typing", (id) => {
//       if (chatUser?._id === id) setTyping(true);
//     });

//     socket.on("stopTyping", (id) => {
//       if (chatUser?._id === id) setTyping(false);
//     });

//     socket.on("activeUsers", (userIds) => {
//       setIsChatUserOnline(userIds.includes(chatUser?._id));
//     });

//     return () => {
//       socket.off("typing");
//       socket.off("stopTyping");
//       socket.off("activeUsers");
//     };
//   }, [chatUser]);

//   const fetchMessages = async (loadMore = false) => {
//     if (isLoadingMore) return;
//     try {
//       setIsLoadingMore(true);
//       const res = await axios.get(`/message/getmessage/${chatId}?limit=${limit}&skip=${loadMore ? skip : 0}`);
//       const newMessages = res.data;

//       if (loadMore) {
//         const container = containerRef.current;
//         const prevScrollHeight = container.scrollHeight;

//         setMessages((prev) => [...newMessages, ...prev]);
//         setSkip((prev) => prev + newMessages.length);

//         requestAnimationFrame(() => {
//           const newScrollHeight = container.scrollHeight;
//           container.scrollTop = newScrollHeight - prevScrollHeight;
//         });
//       } else {
//         setMessages(newMessages);
//         setSkip(newMessages.length);
//         requestAnimationFrame(() => {
//           bottomRef.current?.scrollIntoView({ behavior: "auto" });
//         });
//       }

//       if (newMessages.length < limit) setHasMore(false);
//     } catch (err) {
//       console.error("Failed to fetch messages:", err);
//     } finally {
//       setIsLoadingMore(false);
//     }
//   };

//   useEffect(() => {
//     if (chatId) {
//       setSkip(0);
//       setHasMore(true);
//       fetchMessages(false);
//     }
//   }, [chatId]);

//   const handleScroll = () => {
//     const container = containerRef.current;
//     if (container && hasMore && container.scrollTop < 50) {
//       fetchMessages(true);
//     }
//   };

//   const sendMessage = async (e, retryTempId = null) => {
//     e?.preventDefault?.();
//     const trimmed = content.trim();
//     if (!trimmed && !retryTempId) return;

//     inputRef.current?.focus();
//     const tempId = retryTempId || `temp-${Date.now()}`;
//     const msgContent = retryTempId
//       ? messages.find((m) => m._id === retryTempId)?.content
//       : trimmed;

//     const tempMessage = {
//       _id: tempId,
//       content: msgContent,
//       sender: { _id: userId, username: "You" },
//       chat: chatId,
//       status: "sending",
//     };

//     if (!retryTempId) {
//       setMessages((prev) => [...prev, tempMessage]);
//       setContent("");
//     } else {
//       setMessages((prev) =>
//         prev.map((m) => (m._id === retryTempId ? tempMessage : m))
//       );
//     }

//     try {
//       const { data } = await axios.post(`/message/sendmessage/${chatId}`, {
//         content: msgContent,
//         messageType: "text",
//         attachments: [],
//       });

//       setMessages((prev) => {
//         const filtered = prev.filter((m) => m._id !== tempId);
//         const exists = filtered.some((m) => m._id === data._id);
//         return exists ? filtered : [...filtered, data];
//       });
//     } catch (err) {
//       setMessages((prev) =>
//         prev.map((m) => (m._id === tempId ? { ...m, status: "failed" } : m))
//       );
//     }
//   };

//   const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

//   return (
//     <div className="relative w-full h-full flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden rounded-xl">
//       {chatUser && (
//         <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-3 bg-white/10 backdrop-blur border-b border-white/10 shadow-md">
//           {chatUser?.profilePic ? (
//             <img
//               src={chatUser.profilePic}
//               alt="profile"
//               className="w-10 h-10 rounded-full object-cover border border-white/20"
//             />
//           ) : (
//             <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold border border-white/20">
//               {getInitial(chatUser?.username)}
//             </div>
//           )}
//           <div>
//             <h2 className="text-base font-semibold">{chatUser.name || "Unknown"}</h2>
//             <p className="text-xs text-gray-300 flex items-center gap-2">
//               @{chatUser.username}
//               {isChatUserOnline ? (
//                 <span className="text-green-400">● Online</span>
//               ) : (
//                 <span className="text-gray-400">● Offline</span>
//               )}
//             </p>
//           </div>
//         </div>
//       )}

//       <div
//         ref={containerRef}
//         onScroll={handleScroll}
//         className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pt-[72px] pb-[100px]"
//       >
//         {hasMore && isLoadingMore && (
//           <div className="text-center text-sm text-gray-400 mb-2">Loading older messages...</div>
//         )}

//         <AnimatePresence>
//           {messages.map((msg) => {
//             const isOwn = msg.sender._id === userId;
//             return (
//               <motion.div
//                 key={msg._id}
//                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className={`w-full flex ${isOwn ? "justify-end" : "justify-start"} gap-2`}
//               >
//                 {!isOwn && chatUser && (
//                   <div className="min-w-9 w-9 h-9">
//                     {chatUser?.profilePic ? (
//                       <img
//                         src={chatUser.profilePic}
//                         alt="avatar"
//                         className="w-9 h-9 rounded-full object-cover mt-1 border border-white/20"
//                       />
//                     ) : (
//                       <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold mt-1">
//                         {getInitial(chatUser?.username)}
//                       </div>
//                     )}
//                   </div>
//                 )}
//                 <div
//                   className={`rounded-2xl px-5 py-3 max-w-xs md:max-w-md shadow-xl relative ${
//                     isOwn
//                       ? "bg-blue-600 text-white rounded-br-none"
//                       : "bg-gray-800 text-white rounded-bl-none"
//                   }`}
//                 >
//                   {!isOwn && (
//                     <p className="text-xs font-semibold text-gray-300 mb-1">
//                       {msg.sender.username}
//                     </p>
//                   )}
//                   <p className="text-sm leading-snug break-words">{msg.content}</p>
//                   {isOwn && msg.status === "sending" && (
//                     <span className="absolute -bottom-4 right-2 text-xs text-gray-400">Sending...</span>
//                   )}
//                   {isOwn && msg.status === "failed" && (
//                     <button
//                       className="absolute -bottom-4 right-2 text-xs text-red-400 underline"
//                       onClick={(e) => sendMessage(e, msg._id)}
//                     >
//                       Retry
//                     </button>
//                   )}
//                 </div>
//               </motion.div>
//             );
//           })}
//         </AnimatePresence>

//         {typing && (
//           <div className="text-sm italic text-gray-400 px-4">Typing...</div>
//         )}

//         <div ref={bottomRef} />
//       </div>

//       <div className="sticky bottom-0 z-10 bg-white/10 backdrop-blur px-4 py-3 border-t border-white/10">
//         <div className="flex w-full gap-3">
//           <input
//             ref={inputRef}
//             type="text"
//             value={content}
//             onChange={(e) => {
//               setContent(e.target.value);
//               if (!isTyping) {
//                 setIsTyping(true);
//                 socket.emit("typing", chatId);
//               }
//               clearTimeout(typingTimeoutRef.current);
//               typingTimeoutRef.current = setTimeout(() => {
//                 setIsTyping(false);
//                 socket.emit("stopTyping", chatId);
//               }, 1500);
//             }}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 sendMessage();
//               }
//             }}
//             placeholder="Type your message..."
//             className="flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//           />
//           <motion.button
//             onClick={() => sendMessage()}
//             whileTap={{ scale: 0.95 }}
//             disabled={!content.trim()}
//             className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-xl font-semibold shadow-md transition-all"
//           >
//             Send
//           </motion.button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;

import { useEffect, useLayoutEffect, useState, useRef } from "react";
import axios from "../utils/AxiosConfig.jsx";
import socket from "../utils/socket.js";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ChatBox = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const [chatUser, setChatUser] = useState(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [limit] = useState(20);
  const [typing, setTyping] = useState(false);
  const [isChatUserOnline, setIsChatUserOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const notificationAudio = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const { chatId: routeChatId } = useParams();

  // Format lastSeen
  const formatLastSeen = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    notificationAudio.current = new Audio("/notification.mp3");
    notificationAudio.current.load();
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/auth/is-authenticated", { withCredentials: true });
        const id = res.data.data?._id;
        if (id) {
          setUserId(id);
          localStorage.setItem("userId", id);
        }
        if (res.data.message?.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
        }
      } catch (err) {
        const msg = err.response?.data?.message || "";
        if (msg.toLowerCase().includes("not verified")) {
          navigate("/verify-email");
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
      } catch (err) {
        console.error("Error fetching chat user:", err);
      }
    };
    if (chatId) fetchChatUser();
  }, [chatId]);

  // Refresh lastSeen if offline
  useEffect(() => {
    let interval;
    if (!isChatUserOnline && chatId) {
      interval = setInterval(async () => {
        try {
          const { data } = await axios.get(`/message/user/${chatId}`);
          setChatUser(data);
        } catch (err) {
          console.error("Error refreshing lastSeen:", err);
        }
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [isChatUserOnline, chatId]);

  useEffect(() => {
    if (chatId) socket.emit("joinChat", chatId);
    return () => socket.emit("leaveChat", chatId);
  }, [chatId]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      if (message.chat === chatId) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          return exists ? prev : [...prev, message];
        });
        if (message.sender._id !== userId) {
          notificationAudio.current?.play().catch(() => {});
        }
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [chatId, userId]);

  useEffect(() => {
    socket.on("typing", (id) => {
      if (chatUser?._id === id) setTyping(true);
    });
    socket.on("stopTyping", (id) => {
      if (chatUser?._id === id) setTyping(false);
    });
    socket.on("activeUsers", (userIds) => {
      setIsChatUserOnline(userIds.includes(chatUser?._id));
    });
    return () => {
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("activeUsers");
    };
  }, [chatUser]);

  const fetchMessages = async (loadMore = false) => {
    if (isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const res = await axios.get(`/message/getmessage/${chatId}?limit=${limit}&skip=${loadMore ? skip : 0}`);
      const newMessages = res.data;

      if (loadMore) {
        const container = containerRef.current;
        const prevHeight = container.scrollHeight;
        setMessages((prev) => [...newMessages, ...prev]);
        setSkip((prev) => prev + newMessages.length);
        requestAnimationFrame(() => {
          const newHeight = container.scrollHeight;
          container.scrollTop = newHeight - prevHeight;
        });
      } else {
        setMessages(newMessages);
        setSkip(newMessages.length);
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }));
      }

      if (newMessages.length < limit) setHasMore(false);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (chatId) {
      setSkip(0);
      setHasMore(true);
      fetchMessages(false);
    }
  }, [chatId]);

  const handleScroll = () => {
    const c = containerRef.current;
    if (c && hasMore && c.scrollTop < 50) fetchMessages(true);
  };

  const sendMessage = async (e, retryId = null) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed && !retryId) return;

    inputRef.current?.focus();
    const tempId = retryId || `temp-${Date.now()}`;
    const msgContent = retryId
      ? messages.find((m) => m._id === retryId)?.content
      : trimmed;
    const tempMsg = { _id: tempId, content: msgContent, sender: { _id: userId, username: "You" }, chat: chatId, status: "sending" };

    if (!retryId) {
      setMessages((prev) => [...prev, tempMsg]);
      setContent("");
    } else {
      setMessages((prev) => prev.map((m) => (m._id === retryId ? tempMsg : m)));
    }

    try {
      const { data } = await axios.post(`/message/sendmessage/${chatId}`, { content: msgContent, messageType: "text", attachments: [] });
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== tempId);
        return filtered.some((m) => m._id === data._id) ? filtered : [...filtered, data];
      });
    } catch {
      setMessages((prev) => prev.map((m) => (m._id === tempId ? { ...m, status: "failed" } : m)));
    }
  };

  const getInitial = (name) => name?.[0]?.toUpperCase() || "U";

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0f172a] text-white overflow-hidden rounded-xl">
      {chatUser && (
        <div className="sticky top-0 flex items-center gap-4 px-4 py-3 bg-white/5 backdrop-blur-md border-b border-white/10 z-10">
          {chatUser.profilePic ? (
            <img src={chatUser.profilePic} alt="profile" className="w-10 h-10 rounded-full border border-white/20 object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold border border-white/20">
              {getInitial(chatUser.username)}
            </div>
          )}
          <div>
            <h2 className="text-base font-semibold">{chatUser.name || "Unknown"}</h2>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              @{chatUser.username}
              {isChatUserOnline ? (
                <span className="text-green-400">● Online</span>
              ) : (
                <span className="text-gray-500">
                  ● Last seen{" "}
                  {chatUser.lastSeen ? formatLastSeen(chatUser.lastSeen) : "unknown"}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-3 scrollbar-thin scrollbar-thumb-gray-600">
        {hasMore && isLoadingMore && <div className="text-center text-sm text-gray-500">Loading older messages...</div>}
        <AnimatePresence>
          {messages.map((msg) => {
            const isOwn = msg.sender._id === userId;
            return (
              <motion.div key={msg._id} initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2`}>
                {!isOwn && chatUser && (
                  <div className="w-9 h-9">
                    {chatUser.profilePic ? (
                      <img src={chatUser.profilePic} alt="avatar" className="w-9 h-9 rounded-full border border-white/20 object-cover mt-1" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center mt-1 font-semibold text-white">
                        {getInitial(chatUser.username)}
                      </div>
                    )}
                  </div>
                )}
                <div className={`rounded-xl px-5 py-3 max-w-xs md:max-w-md relative shadow-md ${isOwn ? "bg-blue-600 text-white rounded-br-none" : "bg-white/5 text-white border border-white/10 rounded-bl-none"}`}>
                  {!isOwn && <p className="text-xs text-gray-300 font-medium mb-1">{msg.sender.username}</p>}
                  <p className="text-sm break-words whitespace-pre-line">{msg.content}</p>
                  {isOwn && msg.status === "sending" && <span className="absolute -bottom-4 right-2 text-xs text-gray-400">Sending...</span>}
                  {isOwn && msg.status === "failed" && <button onClick={(e) => sendMessage(e, msg._id)} className="absolute -bottom-4 right-2 text-xs text-red-400 underline">Retry</button>}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {typing && <div className="text-sm italic text-gray-400 px-2 pt-2">Typing...</div>}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-[#1e293b]/70 border-t border-white/10 px-4 py-3 backdrop-blur-lg z-10">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (!isTyping) {
                setIsTyping(true);
                socket.emit("typing", chatId);
              }
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                socket.emit("stopTyping", chatId);
              }, 1500);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); sendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 bg-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
          />
          <motion.button
            onClick={() => sendMessage()}
            whileTap={{ scale: 0.95 }}
            disabled={!content.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-xl font-semibold shadow-md transition"
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;

