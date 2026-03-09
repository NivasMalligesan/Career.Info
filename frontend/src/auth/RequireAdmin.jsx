import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAdmin({ children }) {
  const { auth, loading } = useAuth();

  if (loading) return null;

  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ FIXED: Check for "ADMIN" not "ROLE_ADMIN"
  if (auth.role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}