// src/components/DocenteRoute.js
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const DocenteRoute = ({ children }) => {
  const { usuario } = useContext(AuthContext);
  if (!usuario || (usuario.rol !== "docente" && usuario.rol !== "admin")) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

export default DocenteRoute;
