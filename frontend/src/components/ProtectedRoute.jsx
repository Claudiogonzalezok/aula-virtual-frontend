// src/components/ProtectedRoute.js
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { accessToken } = useContext(AuthContext);  // ✅ Cambiar "token" por "accessToken"
  return accessToken ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;