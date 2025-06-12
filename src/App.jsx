import React from 'react'
import {BrowserRouter ,Routes,Route} from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Register from './pages/Register.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx';
import Login from './pages/Login.jsx';
import SearchUser from './pages/SearchUser.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path='/register' element={<Register/>} />
        <Route path='/verify-email' element={<VerifyEmail/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/searchuser' element={<SearchUser/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App