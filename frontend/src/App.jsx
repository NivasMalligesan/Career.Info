import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import RequireAdmin from "./auth/RequireAdmin";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Home from "./pages/Home";
import './App.css';
import ManageSkills from "./pages/admin/ManageSkills";
import ManageCareers from "./pages/admin/ManageCareers";
import UserSkill from "./pages/user/UserSkills";
import Recommendations from "./pages/user/Recomendations";
import Profile from "./pages/user/Profile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          

          {/* USER ROUTES */}
          <Route
            path="/user"
            element={
              <RequireAuth>
                <UserDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/user/skills"
            element={
              <RequireAuth>
                <UserSkill />
              </RequireAuth>
            }
          />
          <Route
            path="/user/recommendations"
            element={
              <RequireAuth>
                <Recommendations />
              </RequireAuth>
            }
          />
          <Route
            path="/user/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/skills"
            element={
              <RequireAdmin>
                <ManageSkills />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/careers"
            element={
              <RequireAdmin>
                <ManageCareers />
              </RequireAdmin>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
