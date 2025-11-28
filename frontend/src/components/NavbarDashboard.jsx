import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { BsPersonCircle, BsList } from "react-icons/bs";
import { Link } from "react-router-dom";
import NotificacionBadge from "./Notificaciones/NotificacionBadge";

const NavbarDashboard = ({ usuario, onLogout, onToggleSidebar }) => {
  // Obtener iniciales del nombre
  const getIniciales = (nombre) => {
    if (!nombre) return "?";
    const partes = nombre.trim().split(" ");
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  // Obtener URL de la imagen
  const getImagenUrl = () => {
    if (usuario?.imagen) {
      if (usuario.imagen.startsWith("http")) {
        return usuario.imagen;
      }
      // Construir URL completa para imágenes locales
      const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
      return `${baseUrl}${usuario.imagen}`;
    }
    return null;
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container fluid>
        {/* Botón del sidebar (solo móvil) */}
        <Button
          variant="outline-light"
          className="d-md-none me-2"
          onClick={onToggleSidebar}
        >
          <BsList size={20} />
        </Button>

        <Navbar.Brand href="/dashboard" className="fw-bold">
          Aula Virtual
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-dashboard" />
        <Navbar.Collapse id="navbar-dashboard" className="justify-content-end">
          <Nav>
            <NotificacionBadge />
            <NavDropdown
              title={
                <span className="d-flex align-items-center">
                  {getImagenUrl() ? (
                    <img
                      src={getImagenUrl()}
                      alt="Perfil"
                      className="rounded-circle me-2"
                      style={{ width: "28px", height: "28px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                      style={{ width: "28px", height: "28px", fontSize: "0.75rem" }}
                    >
                      {getIniciales(usuario?.nombre)}
                    </div>
                  )}
                  {usuario?.nombre || "Usuario"}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/dashboard/perfil">
                <BsPersonCircle className="me-2" />
                Mi Perfil
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={onLogout} className="text-danger">
                Cerrar sesión
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarDashboard;
