import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
  const { auth, loading } = useAuth();

  if (loading) return null;

  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
