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
  onCancelEdit,
  editingMessageId,
  bottomRef,
}) => {
  const [activeMessage, setActiveMessage] = useState(null);

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
              className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2`}
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

              <div className="relative flex flex-col max-w-[80%]">

                <div
                  className={`relative rounded-xl px-4 py-2 shadow-md group cursor-pointer text-sm whitespace-pre-line break-words
                    ${
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

                  <div className="pr-14">
                    <p className="whitespace-pre-wrap break-words">
                      {msg.content}
                      {msg.edited && (
                        <span className="ml-2 text-xs text-gray-400">
                          (edited)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* WhatsApp-like footer */}
                  {isOwn && (
                    <div className="absolute bottom-1 right-2 flex items-center gap-[4px] text-[10px] text-white/80">
                      <span>{formatTime(msg.createdAt)}</span>
                      {msg.status === "sending" ? (
                        <span className="italic text-white/60">...</span>
                      ) : msg.status === "failed" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetry(e, msg._id);
                          }}
                          className="text-red-300 underline ml-1"
                        >
                          Retry
                        </button>
                      ) : (
                        <span
                          className={`text-[11px] leading-none flex ${
                            msg.read ? "text-blue-400" : "text-white/70"
                          }`}
                        >
                          <span className="-mr-[2px]">✓</span>
                          <span>✓</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Left-side action popup */}
                <AnimatePresence>
                  {isOwn && isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute right-full mr-2 top-0 bg-zinc-900 border border-white/10 shadow-md rounded-md z-50 w-max"
                    >
                      <button
                        className="px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(msg._id);
                          setActiveMessage(null);
                        }}
                      >
                        Unsend
                      </button>
                      <button
                        className="px-4 py-2 text-sm text-white hover:bg-zinc-800 w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(msg);
                          setActiveMessage(null);
                        }}
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

      {/* Typing indicator */}
      {typing && (
        <div className="text-sm italic text-gray-400 px-2 pt-2">Typing...</div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
