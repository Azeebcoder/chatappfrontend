import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Login from "./pages/Login.jsx";
import SearchUser from "./pages/SearchUser.jsx";
import Chats from "./pages/Chats.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import UpdateProfile from "./pages/UpdateProfile.jsx";
import ViewProfile from "./pages/ViewProfile.jsx";
import HomePage from "./pages/HomePage.jsx";
import Protected from "./Protected/Protected.jsx";
import Friends from "./pages/Friends.jsx";

const App = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (No HomeLayout) */}
        <Route
          path="/"
          element={
            <Protected>
              <HomePage />
            </Protected>
          }
        />
        <Route
          path="/search"
          element={
            <Protected>
              <SearchUser />
            </Protected>
          }
        />
        <Route
          path="/friends"
          element={
            <Protected>
              <Friends />
            </Protected>
          }
        />
        <Route
          path="/chats"
          element={
            <Protected>
              <Chats />
            </Protected>
          }
        />
        <Route
          path="/message/:chatId"
          element={
            <Protected>
              <ChatPage />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <UpdateProfile />
            </Protected>
          }
        />
        <Route
          path="/view-profile/:userId"
          element={
            <Protected>
              <ViewProfile />
            </Protected>
          }
        />
      </Routes>
    </>
  );
};

export default App;
