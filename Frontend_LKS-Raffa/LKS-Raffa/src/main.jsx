import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Signin from './page/auth/Signin.jsx'
import Signup from './page/auth/Signup.jsx'
import AdminDashboard from './page/admin/AdminDashboard.jsx'
import ListAdmin from './page/admin/ListAdmin.jsx'
import ListUser from './page/admin/ListUser.jsx'
import UpdateUser from './page/admin/UpdateUser.jsx'
import CreateUser from './page/admin/CreateUser.jsx'
import UserDashboard from './page/user/UserDashboard.jsx'
import DiscoverGames from './page/user/DiscoverGames.jsx'
import ManageGames from './page/user/ManageGames.jsx'
import AddGames from './page/user/AddGames.jsx'
import DetailGames from './page/user/DetailGames.jsx'
import UpdateGames from './page/user/UpdateGames.jsx'
import UserProfile from './page/user/UserProfile.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/listadmin" element={<ListAdmin />} />
        <Route path="/admin/listusers" element={<ListUser />} />
        <Route path="/admin/updateuser/:id" element={<UpdateUser />} />
        <Route path="/admin/createuser" element={<CreateUser />} />

        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/discovergames" element={<DiscoverGames />} />
        <Route path="/user/managegames" element={<ManageGames />} />
        <Route path="/user/addgames" element={<AddGames />} />
        <Route path="/user/detailgames/:slug" element={<DetailGames />} />
        <Route path="/user/updategames/:slug" element={<UpdateGames />} />
        <Route path="/user/userprofile/" element={<UserProfile />} />
        <Route path="/user/userprofile/:username" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
