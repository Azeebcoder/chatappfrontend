import { motion, AnimatePresence } from "framer-motion";
import { FaUserFriends, FaComments, FaSearch, FaUserEdit } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton.jsx";
import NavIcon from "../components/NavIcon.jsx";

export default function HomePage() {
  const [active, setActive] = useState();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get("/auth/logout");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    { label: "Search", icon: <FaSearch size={22} /> },
    { label: "Friends", icon: <FaUserFriends size={22} /> },
    { label: "Chats", icon: <FaComments size={22} /> },
    { label: "Profile", icon: <FaUserEdit size={22} /> },
  ];

  return (
    <div className="min-h-[100dvh] flex bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Sidebar for Large Screens */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col items-center w-20 bg-gray-800/90 backdrop-blur-lg py-5 space-y-8 shadow-xl"
      >
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl font-bold text-blue-400 tracking-wide"
        >
          S
        </motion.h1>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
          className="flex flex-col gap-6"
        >
          {navItems.map((item, i) => (
            <NavIcon
              key={i}
              icon={item.icon}
              label={item.label}
              active={active === item.label}
              onClick={() => {
                setActive(item.label);
                navigate(`/${item.label.toLowerCase()}`);
              }}
            />
          ))}
        </motion.div>
        <div className="mt-auto mb-4">
          <LogoutButton handleLogout={handleLogout} />
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar for Mobile */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between px-5 py-4 bg-gray-800/90 backdrop-blur-md shadow-md lg:hidden"
        >
          <h1 className="text-2xl font-bold text-blue-400">SumyChat</h1>
          <LogoutButton handleLogout={handleLogout} />
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 pb-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-gray-400 text-lg">Welcome back to</p>
              <h2 className="text-3xl font-semibold text-blue-400 mt-2">
                SumyChat
              </h2>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation for Mobile */}
        <motion.nav
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-md shadow-inner flex justify-around items-center py-2 sm:py-3 lg:hidden z-50"
        >
          {navItems.map((item, i) => (
            <NavIcon
              key={i}
              icon={item.icon}
              label={item.label}
              active={active === item.label}
              onClick={() => {
                setActive(item.label);
                navigate(`/${item.label.toLowerCase()}`);
              }}
            />
          ))}
        </motion.nav>
      </div>
    </div>
  );
}
