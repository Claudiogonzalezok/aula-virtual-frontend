// src/pages/Dashboard.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <div className="p-6">
      <h2 className="text-2xl">Bienvenido, {usuario?.nombre}</h2>
      <p>Rol: {usuario?.rol}</p>

      {(usuario?.rol === "docente" || usuario?.rol === "admin") && (
        <Link
          to="/crear-curso"
          className="bg-green-500 text-white px-4 py-2 rounded mt-4 inline-block"
        >
          ➕ Crear curso
        </Link>
      )}

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4 block"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default Dashboard;
