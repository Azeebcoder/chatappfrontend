import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const MessageList = ({
  messages,
  userId,
  chatUser,
  typing,
  onRetry,
  onDelete,
  onEdit,
  bottomRef, // ✅ Accept bottomRef as prop
}) => {
  const [activeMessage, setActiveMessage] = useState(null);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-12 space-y-3 scrollbar-thin scrollbar-thumb-gray-600">
      <AnimatePresence>
        {messages.map((msg) => {
          const isOwn = msg.sender._id === userId;
          const isActive = activeMessage === msg._id;

          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2 relative`}
              onClick={() =>
                isOwn &&
                setActiveMessage(msg._id === activeMessage ? null : msg._id)
              }
            >
              {!isOwn && chatUser && (
                <img
                  src={chatUser.profilePic}
                  alt="avatar"
                  className="w-9 h-9 rounded-full border border-white/20 object-cover mt-1"
                />
              )}

              <div
                className={`rounded-xl px-5 py-3 max-w-xs md:max-w-md relative shadow-md group cursor-pointer ${
                  isOwn
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white/5 text-white border border-white/10 rounded-bl-none"
                }`}
              >
                {!isOwn && (
                  <p className="text-xs text-gray-300 font-medium mb-1">
                    {msg.sender.username}
                  </p>
                )}
                <p className="text-sm break-words whitespace-pre-line">
                  {msg.content}
                  {msg.edited && (
                    <span className="ml-2 text-xs text-gray-400">(edited)</span>
                  )}
                </p>

                {/* Status Indicators */}
                {isOwn && msg.status === "sending" && (
                  <span className="absolute -bottom-4 right-2 text-xs text-gray-400">
                    Sending...
                  </span>
                )}
                {isOwn && msg.status === "failed" && (
                  <button
                    onClick={(e) => onRetry(e, msg._id)}
                    className="absolute -bottom-4 right-2 text-xs text-red-400 underline"
                  >
                    Retry
                  </button>
                )}
                {isOwn && msg.status !== "failed" && (
                  <span className="absolute -bottom-4 right-2 text-xs text-gray-400">
                    {msg.read ? "Seen" : "Delivered"}
                  </span>
                )}

                {/* Popup */}
                <AnimatePresence>
                  {isOwn && isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute left-[-120px] top-1 z-50 bg-zinc-900 border border-white/10 shadow-md rounded-md"
                    >
                      <button
                        className="px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 w-full text-left"
                        onClick={() => onDelete(msg._id)}
                      >
                        Unsend
                      </button>
                      <button
                        className="px-4 py-2 text-sm text-white hover:bg-zinc-800 w-full text-left"
                        onClick={() => onEdit(msg)}
                      >
                        Edit
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {typing && (
        <div className="text-sm italic text-gray-400 px-2 pt-2">Typing...</div>
      )}

      <div ref={bottomRef} /> {/* ✅ Keep this here for manual scroll control */}
    </div>
  );
};

export default MessageList;
