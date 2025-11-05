import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Importamos los dashboards individuales
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import DocenteDashboard from "../pages/Dashboard/DocenteDashboard";
import AlumnoDashboard from "../pages/Dashboard/AlumnoDashboard";

const DashboardInicio = () => {
  const { usuario } = useContext(AuthContext);

  if (!usuario) return null;

  switch (usuario.rol) {
    case "admin":
      return <AdminDashboard usuario={usuario} />;
    case "docente":
      return <DocenteDashboard usuario={usuario} />;
    case "alumno":
      return <AlumnoDashboard usuario={usuario} />;
    default:
      return <p>No se reconoce el rol del usuario.</p>;
  }
};

export default DashboardInicio;
