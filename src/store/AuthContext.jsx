import { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/AxiosConfig.jsx";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const publicRoutes = ["/login", "/register", "/verify-email"];
    if (publicRoutes.includes(location.pathname)) {
      setIsAuthenticated(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await axios.get("/auth/is-authenticated", {
          withCredentials: true,
        });

        if (res.data.success) {
          setIsAuthenticated(true);
          setUser(res.data.user || null);
        } else if (res.data.message?.toLowerCase().includes("not verified")) {
          setIsAuthenticated(false);
          navigate("/verify-email");
        } else {
          setIsAuthenticated(false);
          navigate("/login");
        }
      } catch (err) {
        setIsAuthenticated(false);
        if (
          err.response?.data?.message?.toLowerCase().includes("not verified")
        ) {
          navigate("/verify-email");
        } else {
          navigate("/login");
        }
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setIsAuthenticated, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
