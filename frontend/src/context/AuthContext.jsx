// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = (data) => {
    setUsuario(data.usuario);
    setToken(data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario)); // ✅
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("usuario"); // ✅
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

