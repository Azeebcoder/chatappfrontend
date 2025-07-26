import { motion } from "framer-motion";
import { useRef } from "react";

const MessageInput = ({ content, setContent, sendMessage, socket, chatId }) => {
  const inputRef = useRef(null);
  let typingTimeout;

  return (
    <div className="sticky bottom-0 bg-[#1e293b]/70 border-t border-white/10 px-4 py-3 backdrop-blur-lg z-10">
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            socket.emit("typing", chatId);
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => socket.emit("stopTyping", chatId), 1500);
          }}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(e)}
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
  );
};

export default MessageInput;
