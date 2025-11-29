import { useContext, useState } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NavbarDashboard from "./NavbarDashboard";
import { Container, Row, Col, Nav, Offcanvas } from "react-bootstrap";
import {
  BsHouseDoor,
  BsBook,
  BsClipboardCheck,
  BsChatDots,
  BsGear,
  BsPeople,
  BsCardChecklist,
  BsFileEarmarkText,
  BsCalendar,
  BsClipboard2Check,
  BsBell,
  BsEnvelope,
  BsMortarboard,
  BsPersonCircle,
  BsClipboardPlus,
  BsInboxes,
} from "react-icons/bs";

const DashboardLayout = () => {
  const { usuario, logout } = useContext(AuthContext);
  const [showSidebar, setShowSidebar] = useState(false);

  if (!usuario) return <Navigate to="/login" />;

  // Sidebar dinámico por rol
  const getSidebarLinks = () => {
    switch (usuario.rol) {
      case "admin":
        return [
          { to: "/dashboard", icon: <BsHouseDoor />, label: "Inicio" },
          { to: "/dashboard/usuarios", icon: <BsPeople />, label: "Usuarios" },
          { to: "/dashboard/cursos", icon: <BsBook />, label: "Cursos" },
          { to: "/dashboard/clases", icon: <BsCalendar />, label: "Clases" },
          { to: "/dashboard/tareas", icon: <BsClipboard2Check />, label: "Tareas" },
          { to: "/dashboard/examenes", icon: <BsClipboardCheck />, label: "Exámenes" },
          { to: "/dashboard/calificaciones", icon: <BsMortarboard />, label: "Calificaciones" },
          { to: "/dashboard/solicitudes-inscripcion", icon: <BsInboxes />, label: "Solicitudes" },
          { to: "/dashboard/reportes", icon: <BsFileEarmarkText />, label: "Reportes" },
          { to: "/dashboard/mensajes", icon: <BsEnvelope />, label: "Mensajes" },
          { to: "/dashboard/notificaciones", icon: <BsBell />, label: "Notificaciones" },
          { to: "/dashboard/perfil", icon: <BsPersonCircle />, label: "Mi Perfil" },
          { to: "/dashboard/configuracion", icon: <BsGear />, label: "Configuración" },
        ];
      case "docente":
        return [
          { to: "/dashboard", icon: <BsHouseDoor />, label: "Inicio" },
          { to: "/dashboard/cursos", icon: <BsBook />, label: "Mis Cursos" },
          { to: "/dashboard/clases", icon: <BsCalendar />, label: "Mis Clases" },
          { to: "/dashboard/tareas", icon: <BsClipboard2Check />, label: "Tareas" },
          { to: "/dashboard/examenes", icon: <BsClipboardCheck />, label: "Exámenes" },
          { to: "/dashboard/calificaciones", icon: <BsMortarboard />, label: "Calificaciones" },
          { to: "/dashboard/reportes", icon: <BsFileEarmarkText />, label: "Reportes" },
          { to: "/dashboard/mensajes", icon: <BsEnvelope />, label: "Mensajes" },
          { to: "/dashboard/notificaciones", icon: <BsBell />, label: "Notificaciones" },
          { to: "/dashboard/perfil", icon: <BsPersonCircle />, label: "Mi Perfil" },
        ];
      case "alumno":
        return [
          { to: "/dashboard", icon: <BsHouseDoor />, label: "Inicio" },
          { to: "/dashboard/cursos", icon: <BsBook />, label: "Mis Cursos" },
          { to: "/dashboard/inscripcion", icon: <BsClipboardPlus />, label: "Inscripción" },
          { to: "/dashboard/mis-tareas", icon: <BsClipboard2Check />, label: "Mis Tareas" },
          { to: "/dashboard/examenes", icon: <BsClipboardCheck />, label: "Exámenes" },
          { to: "/dashboard/notas", icon: <BsCardChecklist />, label: "Mis Notas" },
          { to: "/dashboard/mensajes", icon: <BsEnvelope />, label: "Mensajes" },
          { to: "/dashboard/notificaciones", icon: <BsBell />, label: "Notificaciones" },
          { to: "/dashboard/perfil", icon: <BsPersonCircle />, label: "Mi Perfil" },
        ];
      default:
        return [];
    }
  };

  const sidebarLinks = getSidebarLinks();

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <NavbarDashboard
        usuario={usuario}
        onLogout={logout}
        onToggleSidebar={() => setShowSidebar(true)}
      />

      <Container fluid>
        <Row>
          {/* Sidebar lateral (desktop) */}
          <Col
            xs={12}
            md={3}
            lg={2}
            className="d-none d-md-block bg-dark text-white p-0"
            style={{ minHeight: "calc(100vh - 56px)" }}
          >
            <div className="p-4 border-bottom border-secondary">
              <h5 className="fw-bold text-center mb-0">
                {usuario.rol === "admin" && "Panel Administrador"}
                {usuario.rol === "docente" && "Panel Docente"}
                {usuario.rol === "alumno" && "Panel Estudiante"}
              </h5>
            </div>
            <Nav className="flex-column p-3">
              {sidebarLinks.map((item, index) => (
                <Nav.Item key={index}>
                  <Nav.Link
                    as={Link}
                    to={item.to}
                    className="text-white d-flex align-items-center mb-2 rounded sidebar-link"
                  >
                    <span className="me-2">{item.icon}</span> {item.label}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>

          {/* Sidebar móvil (Offcanvas) */}
          <Offcanvas
            show={showSidebar}
            onHide={() => setShowSidebar(false)}
            className="bg-dark text-white"
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title>
                {usuario.rol === "admin" && "Panel Administrador"}
                {usuario.rol === "docente" && "Panel Docente"}
                {usuario.rol === "alumno" && "Panel Estudiante"}
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column">
                {sidebarLinks.map((item, index) => (
                  <Nav.Item key={index}>
                    <Nav.Link
                      as={Link}
                      to={item.to}
                      onClick={() => setShowSidebar(false)}
                      className="text-white d-flex align-items-center mb-2 rounded sidebar-link"
                    >
                      <span className="me-2">{item.icon}</span> {item.label}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Contenido principal */}
          <Col xs={12} md={9} lg={10} className="p-4">
            <Outlet />
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>
          © {new Date().getFullYear()} Aula Virtual - Todos los derechos reservados.
        </small>
      </footer>

      {/* Estilos para sidebar */}
      <style>{`
        .sidebar-link {
          transition: background-color 0.2s ease, padding-left 0.2s ease;
        }
        .sidebar-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
          padding-left: 1rem !important;
        }
        .sidebar-link.active {
          background-color: rgba(255, 255, 255, 0.2);
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;