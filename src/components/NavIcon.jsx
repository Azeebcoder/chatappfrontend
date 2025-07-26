import { motion, AnimatePresence } from "framer-motion";

function NavIcon({ icon, label, active, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-300 ${
        active
          ? "text-blue-400 bg-blue-500/10 shadow-md"
          : "text-gray-300 hover:text-blue-400"
      }`}
    >
      <motion.div
        animate={active ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {icon}
      </motion.div>
      <span className="text-xs mt-1">{label}</span>
    </motion.button>
  );
}

export default NavIcon;
