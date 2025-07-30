import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { X } from "lucide-react";

const MessageInput = ({
  content,
  setContent,
  sendMessage,
  socket,
  chatId,
  editingMessage,
  setEditingMessage,
  isTyping,
  setIsTyping,
  typingTimeoutRef,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingMessage) {
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  const handleTyping = () => {
    if (!isTyping) {
      socket.emit("typing", chatId);
      setIsTyping(true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", chatId);
      setIsTyping(false);
    }, 1500);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setTimeout(() => {
      setContent("");
    }, 0);
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-t border-white/10 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-lg z-50 shadow-inner"
      style={{ paddingBottom: "calc(0.4rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex flex-col gap-2">
        {editingMessage && (
          <motion.div
            key="cancel-edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            onClick={handleCancelEdit}
            className="flex items-center gap-2 self-start bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-3 py-1.5 rounded-full text-sm font-medium shadow-md backdrop-blur-md cursor-pointer hover:bg-yellow-500/20 transition-colors duration-200"
          >
            <span>Editing message</span>
            <button
              onClick={handleCancelEdit}
              className="hover:text-red-400 text-red-300 transition-colors duration-200"
              title="Cancel edit"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}

        <div className="flex gap-2 sm:gap-3 items-center">
          <motion.input
            ref={inputRef}
            type="text"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && sendMessage(e)
            }
            placeholder={
              editingMessage ? "Edit your message..." : "Type your message..."
            }
            className="flex-1 bg-white/10 text-white placeholder-gray-400 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 backdrop-blur-md shadow-md"
            whileFocus={{ scale: 1.01 }}
            style={{ fontSize: "16px" }}
          />

          <motion.button
            onClick={() => sendMessage()}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            disabled={!content.trim()}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 w-10 h-10 sm:w-12 sm:h-11 rounded-xl sm:rounded-2xl shadow-md transition-colors duration-300"
          >
            <FaPaperPlane className="text-white text-base sm:text-lg" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageInput;
