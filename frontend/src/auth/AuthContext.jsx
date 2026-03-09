import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore auth from token on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      setAuth({
        token,
        userId: decoded.userId,
        email: decoded.sub,
        role: decoded.role, // ROLE_USER / ROLE_ADMIN
      });
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      setAuth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔐 Login
  const login = (token) => {
    localStorage.setItem("token", token);

    try {
      const decoded = jwtDecode(token);

      setAuth({
        token,
        userId: decoded.userId,
        email: decoded.sub,
        role: decoded.role,
      });
    } catch (error) {
      console.error("Failed to decode token:", error);
      localStorage.removeItem("token");
      setAuth(null);
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
