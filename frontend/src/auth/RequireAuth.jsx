import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" />;
}
