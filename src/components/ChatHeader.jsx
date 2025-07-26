import { motion } from "framer-motion";

const ChatHeader = ({ chatUser, isChatUserOnline, formatLastSeen }) => {
  const getInitial = (name) => name?.[0]?.toUpperCase() || "U";

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 flex items-center gap-4 px-4 py-3 bg-white/5 backdrop-blur-md border-b border-white/10 z-10"
    >
      {chatUser?.profilePic ? (
        <img
          src={chatUser.profilePic}
          alt="profile"
          className="w-10 h-10 rounded-full border border-white/20 object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold border border-white/20">
          {getInitial(chatUser?.username)}
        </div>
      )}
      <div>
        <h2 className="text-base font-semibold">{chatUser?.name || "Unknown"}</h2>
        <p className="text-xs text-gray-400 flex items-center gap-2">
          @{chatUser?.username}
          {isChatUserOnline ? (
            <span className="text-green-400">● Online</span>
          ) : (
            <span className="text-gray-500">
              ● Last seen {chatUser?.lastSeen ? formatLastSeen(chatUser.lastSeen) : "unknown"}
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
