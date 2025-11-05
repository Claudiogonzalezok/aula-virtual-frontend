import { Navbar, Nav, NavDropdown, Container, Button } from "react-bootstrap";
import { BsBell, BsPersonCircle, BsList } from "react-icons/bs";

const NavbarDashboard = ({ usuario, onLogout, onToggleSidebar }) => {
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
            <Nav.Link href="/notificaciones">
              <BsBell size={18} className="me-1" /> Notificaciones
            </Nav.Link>
            <NavDropdown
              title={
                <>
                  <BsPersonCircle size={20} className="me-1" />
                  {usuario?.nombre || "Usuario"}
                </>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item href="/perfil">Perfil</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={onLogout}>Cerrar sesión</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarDashboard;
