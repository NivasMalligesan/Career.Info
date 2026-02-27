import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);

      return {
        token,
        userId: decoded.userId,   // ✅ NOW WORKS
        email: decoded.sub,
        role: decoded.role,
      };

    } catch (error) {
      localStorage.removeItem("token");
      return null;
    }
  });

  const login = (token) => {
    localStorage.setItem("token", token);
    try {
      const decoded = jwtDecode(token);
      setAuth({
        token,
        userId: decoded.userId,   // ✅ REQUIRED
        email: decoded.sub,
        role: decoded.role,
      });

    } catch (error) {
      console.error("Failed to decode token:", error);
      localStorage.removeItem("token");
      setAuth(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);