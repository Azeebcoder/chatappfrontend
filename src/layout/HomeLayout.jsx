// src/layouts/HomeLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiUsers,
  FiMessageCircle,
  FiPlusCircle,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

const HomeLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-5 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6 text-purple-600">SumyChat</h1>
          <nav className="flex flex-col space-y-2">
            <NavLink to="/searchuser" className={navStyle}>
              <FiSearch /> Search Users
            </NavLink>
            <NavLink to="/friendrequests" className={navStyle}>
              <FiUsers /> Friend Requests
            </NavLink>
            <NavLink to="/createnewchat" className={navStyle}>
              <FiPlusCircle /> New Chat
            </NavLink>
            <NavLink to="/message/123" className={navStyle}>
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

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
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
