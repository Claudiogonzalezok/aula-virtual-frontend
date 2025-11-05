// src/components/NavbarApp.js
import { useContext } from "react";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const NavbarApp = () => {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-primary">
          Aula Virtual 📘
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/cursos">
              Mis Cursos
            </Nav.Link>

            {(usuario?.rol === "docente" || usuario?.rol === "admin") && (
              <Nav.Link as={Link} to="/crear-curso">
                Crear Curso
              </Nav.Link>
            )}

            {usuario?.rol === "admin" && (
              <Nav.Link as={Link} to="/admin">
                Panel Admin
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            <NavDropdown
              title={<span>👤 {usuario?.nombre}</span>}
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item disabled>
                Rol: {usuario?.rol?.toUpperCase()}
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Button} variant="link" onClick={handleLogout}>
                🔒 Cerrar sesión
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarApp;
