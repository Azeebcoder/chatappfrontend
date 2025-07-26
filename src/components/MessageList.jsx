import { motion, AnimatePresence } from "framer-motion";

const MessageList = ({ messages, userId, chatUser, typing, onRetry }) => {
  const getInitial = (name) => name?.[0]?.toUpperCase() || "U";

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-3 scrollbar-thin scrollbar-thumb-gray-600">
      <AnimatePresence>
        {messages.map((msg) => {
          const isOwn = msg.sender._id === userId;
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2`}
            >
              {!isOwn && chatUser && (
                <div className="w-9 h-9">
                  {chatUser.profilePic ? (
                    <img
                      src={chatUser.profilePic}
                      alt="avatar"
                      className="w-9 h-9 rounded-full border border-white/20 object-cover mt-1"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center mt-1 font-semibold text-white">
                      {getInitial(chatUser.username)}
                    </div>
                  )}
                </div>
              )}
              <div
                className={`rounded-xl px-5 py-3 max-w-xs md:max-w-md relative shadow-md ${
                  isOwn
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white/5 text-white border border-white/10 rounded-bl-none"
                }`}
              >
                {!isOwn && (
                  <p className="text-xs text-gray-300 font-medium mb-1">{msg.sender.username}</p>
                )}
                <p className="text-sm break-words whitespace-pre-line">{msg.content}</p>
                {isOwn && msg.status === "sending" && (
                  <span className="absolute -bottom-4 right-2 text-xs text-gray-400">Sending...</span>
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
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {typing && <div className="text-sm italic text-gray-400 px-2 pt-2">Typing...</div>}
    </div>
  );
};

export default MessageList;
