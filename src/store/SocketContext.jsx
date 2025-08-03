
import { createContext, useContext, useEffect, useState } from "react";
import socket from "../utils/socket";
// src/context/SocketContext.jsx

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    socket.emit("getActiveUsers");

    const handleActiveUsers = (userIds) => {
      setActiveUsers(userIds);
    };

    socket.on("activeUsers", handleActiveUsers);

    return () => {
      socket.off("activeUsers", handleActiveUsers);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, activeUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
