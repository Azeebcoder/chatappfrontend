import React from 'react'
import {BrowserRouter ,Routes,Route} from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Register from './pages/Register.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx';
import Login from './pages/Login.jsx';
import SearchUser from './pages/SearchUser.jsx';
import FriendRequests from './pages/FriendRequests.jsx';
import CreateChat from './pages/CreateNewChat.jsx';
import ChatPage from './pages/ChatPage.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path='/register' element={<Register/>} />
        <Route path='/verify-email' element={<VerifyEmail/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/searchuser' element={<SearchUser/>} />
        <Route path='/friendrequests' element={<FriendRequests/>} />
        <Route path='/createnewchat' element={<CreateChat/>} />
        <Route path='/message/:chatId' element={<ChatPage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App