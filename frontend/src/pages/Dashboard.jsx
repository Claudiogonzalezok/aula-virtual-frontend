// src/pages/Dashboard.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <div className="p-6">
      <h2 className="text-2xl">Bienvenido, {usuario?.nombre}</h2>
      <p>Rol: {usuario?.rol}</p>
      <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
        Cerrar sesión
      </button>
    </div>
  );
};

export default Dashboard;