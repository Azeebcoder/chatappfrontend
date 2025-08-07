import { Navigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext.jsx";
import FancyLoader from "../components/Loader.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return <FancyLoader/>
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
