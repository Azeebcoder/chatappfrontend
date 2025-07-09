import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Login from './pages/Login.jsx';
import SearchUser from './pages/SearchUser.jsx';
import FriendRequests from './pages/FriendRequests.jsx';
import Chats from './pages/Chats.jsx';
import ChatPage from './pages/ChatPage.jsx';
import HomeLayout from '../src/layout/HomeLayout.jsx'; // New
import UpdateProfile from './pages/UpdateProfile.jsx';
import ViewProfile from './pages/ViewProfile.jsx';


const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />

        {/* Home Routes (with layout) */}
        <Route path="/" element={<HomeLayout />}>
          <Route path="searchuser" element={<SearchUser />} />
          <Route path="friendrequests" element={<FriendRequests />} />
          <Route path="chats" element={<Chats />} />
          <Route path="message/:chatId" element={<ChatPage />} />
          <Route path="update-profile" element={<UpdateProfile />} />
          <Route path='view-profile/:userId' element={<ViewProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;