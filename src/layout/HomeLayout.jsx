import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiUsers,
  FiMessageCircle,
  FiPlusCircle,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { motion, AnimatePresence } from "framer-motion";

const HomeLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleLogout = async () => {
    try {
      await axios.get("/auth/logout");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleResize = () => {
    const isNowMobile = window.innerWidth < 768;
    setIsMobile(isNowMobile);
    if (!isNowMobile) setSidebarOpen(false);
  };

  const handleNavClick = () => {
    if (isMobile) setSidebarOpen(false);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-row h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white shadow-lg p-6 border-r border-gray-200">
        <div>
          <h1 className="text-2xl font-bold mb-6 text-purple-600">SumyChat</h1>
          <nav className="flex flex-col space-y-2">
            <NavLink to="/searchuser" className={navStyle}>
              <FiSearch /> Search Users
            </NavLink>
            <NavLink to="/friendrequests" className={navStyle}>
              <FiUsers /> Friend Requests
            </NavLink>
            <NavLink to="/chats" className={navStyle}>
              <FiMessageCircle /> Chats
            </NavLink>
            <NavLink to="/update-profile" className={navStyle}>
              <FiUser /> Update Profile
            </NavLink>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 flex items-center gap-2"
        >
          <FiLogOut /> Logout
        </button>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white h-14 flex items-center justify-between px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-purple-600">SumyChat</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <motion.div
            initial={false}
            animate={{ rotate: sidebarOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {sidebarOpen ? (
              <FiX className="text-purple-600 w-6 h-6" />
            ) : (
              <FiMenu className="text-purple-600 w-6 h-6" />
            )}
          </motion.div>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-14 left-0 z-40 bg-white w-64 h-[calc(100vh-3.5rem)] shadow-lg p-5 border-r border-gray-200 flex flex-col justify-between"
          >
            <nav className="flex flex-col space-y-2">
              <NavLink to="/searchuser" className={navStyle} onClick={handleNavClick}>
                <FiSearch /> Search Users
              </NavLink>
              <NavLink to="/friendrequests" className={navStyle} onClick={handleNavClick}>
                <FiUsers /> Friend Requests
              </NavLink>
              <NavLink to="/chats" className={navStyle} onClick={handleNavClick}>
                <FiMessageCircle /> Chats
              </NavLink>
              <NavLink to="/update-profile" className={navStyle} onClick={handleNavClick}>
                <FiUser /> Update Profile
              </NavLink>
            </nav>

            <button
              onClick={() => {
                handleLogout();
                handleNavClick();
              }}
              className="text-red-500 hover:text-red-700 flex items-center gap-2 mt-4"
            >
              <FiLogOut /> Logout
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col relative ${isMobile ? "pt-14" : ""} bg-gray-100`}>
        <Outlet />
      </main>
    </div>
  );
};

const navStyle = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-purple-100 transition ${
    isActive ? "bg-purple-200 font-semibold" : ""
  }`;

export default HomeLayout;
