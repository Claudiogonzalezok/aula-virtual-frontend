// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import API from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken") || null
  );

  // Sincronizar accessToken con localStorage
  useEffect(() => {
    if (accessToken) {
      console.log("💾 Guardando accessToken en localStorage:", accessToken.substring(0, 20) + "...");
      localStorage.setItem("accessToken", accessToken);
    } else {
      console.log("🗑️ Eliminando accessToken de localStorage");
      localStorage.removeItem("accessToken");
    }
  }, [accessToken]);

  // Sincronizar refreshToken con localStorage
  useEffect(() => {
    if (refreshToken) {
      console.log("💾 Guardando refreshToken en localStorage");
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      console.log("🗑️ Eliminando refreshToken de localStorage");
      localStorage.removeItem("refreshToken");
    }
  }, [refreshToken]);

  const login = (data) => {
    console.log("🔐 AuthContext - Login llamado con:", data);
    
    setUsuario(data.usuario);
    setAccessToken(data.accessToken);
    
    // Solo guardar refresh token si existe (cuando marcó "Recuérdame")
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    } else {
      setRefreshToken(null);
    }
    
    // Guardar usuario inmediatamente
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    
    console.log("✅ AuthContext - Estados actualizados");
  };

  const logout = async () => {
    try {
      await API.post("/usuarios/logout");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setUsuario(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem("usuario");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, accessToken, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
