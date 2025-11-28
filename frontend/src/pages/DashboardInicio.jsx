// frontend/src/pages/DashboardInicio.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Dashboards por rol
import AdminDashboard from "./Dashboard/AdminDashboard";
import DocenteDashboard from "./Dashboard/DocenteDashboard";
import AlumnoDashboard from "./Dashboard/AlumnoDashboard";

const DashboardInicio = () => {
  const { usuario } = useContext(AuthContext);

  // Renderizar dashboard según el rol del usuario
  switch (usuario?.rol) {
    case "admin":
      return <AdminDashboard usuario={usuario} />;
    case "docente":
      return <DocenteDashboard usuario={usuario} />;
    case "alumno":
      return <AlumnoDashboard usuario={usuario} />;
    default:
      return (
        <div className="text-center py-5">
          <h4>Bienvenido al Aula Virtual</h4>
          <p className="text-muted">Tu rol no tiene un dashboard asignado.</p>
        </div>
      );
  }
};

export default DashboardInicio;
