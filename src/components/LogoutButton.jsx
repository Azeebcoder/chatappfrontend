import { motion } from "framer-motion";
import {FaSignOutAlt } from "react-icons/fa";

function LogoutButton({handleLogout}) {
  return (
    <motion.button
      whileHover={{ rotate: 15, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="p-2 bg-red-500 hover:bg-red-600 rounded-full shadow-md transition"
      onClick={() => handleLogout()}
    >
      <FaSignOutAlt size={18} />
    </motion.button>
  );
}
export default LogoutButton;