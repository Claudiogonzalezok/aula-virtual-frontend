import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  Modal,
  Toast,
  ToastContainer,
  Pagination,
  InputGroup,
  FormControl,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { BsSearch, BsFilter } from "react-icons/bs";
import API from "../../services/api";
import { Link, useLocation } from "react-router-dom";

const UsuariosList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [toast, setToast] = useState({ show: false, mensaje: "", tipo: "success" });
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const location = useLocation();

  // Función para cargar usuarios
  const cargarUsuarios = async (pagina = 1, termino = "", rol = "") => {
    setLoading(true);
    try {
      let url = `/usuarios?page=${pagina}&limit=15&search=${encodeURIComponent(termino)}`;
      if (rol) {
        url += `&rol=${rol}`;
      }
      const { data } = await API.get(url);
      setUsuarios(data.usuarios);
      setTotalPaginas(data.totalPaginas);
      setPaginaActual(data.paginaActual);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      setToast({ show: true, mensaje: "Error al cargar usuarios", tipo: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Mostrar toast si venimos de crear o editar
  useEffect(() => {
    if (location.state?.mensaje) {
      setToast({
        show: true,
        mensaje: location.state.mensaje,
        tipo: location.state.tipo || "success",
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Buscar usuarios manualmente
  const buscarUsuarios = () => {
    setTerminoBusqueda(busqueda.trim());
    setPaginaActual(1);
    cargarUsuarios(1, busqueda.trim(), filtroRol);
  };

  // Ejecutar búsqueda al presionar Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      buscarUsuarios();
    }
  };

  // Cambiar filtro de rol
  const handleFiltroRol = (rol) => {
    setFiltroRol(rol);
    setPaginaActual(1);
    cargarUsuarios(1, terminoBusqueda, rol);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda("");
    setTerminoBusqueda("");
    setFiltroRol("");
    setPaginaActual(1);
    cargarUsuarios(1, "", "");
  };

  // Eliminar usuario
  const eliminarUsuario = async () => {
    if (!usuarioSeleccionado) return;
    try {
      await API.delete(`/usuarios/${usuarioSeleccionado._id}`);
      setUsuarios((prev) => prev.filter((u) => u._id !== usuarioSeleccionado._id));
      setToast({ show: true, mensaje: "Usuario eliminado correctamente", tipo: "success" });

      if (usuarios.length === 1 && paginaActual > 1) {
        setPaginaActual((prev) => prev - 1);
        cargarUsuarios(paginaActual - 1, terminoBusqueda, filtroRol);
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      setToast({ show: true, mensaje: "Error al eliminar usuario", tipo: "danger" });
    } finally {
      setShowConfirm(false);
    }
  };

  // Badge de rol con colores
  const getBadgeRol = (rol) => {
    const config = {
      admin: { bg: "danger", text: "Admin" },
      docente: { bg: "success", text: "Docente" },
      alumno: { bg: "primary", text: "Alumno" },
    };
    const { bg, text } = config[rol] || { bg: "secondary", text: rol };
    return <span className={`badge bg-${bg}`}>{text}</span>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Gestión de Usuarios</h2>
        <Link to="/dashboard/usuarios/nuevo">
          <Button variant="success" className="shadow-sm">
            ➕ Nuevo Usuario
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Row className="mb-3 g-2">
        <Col md={5}>
          <InputGroup>
            <FormControl
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button variant="primary" onClick={buscarUsuarios}>
              <BsSearch />
            </Button>
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={filtroRol}
            onChange={(e) => handleFiltroRol(e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="docente">Docente</option>
            <option value="alumno">Alumno</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={limpiarFiltros}
            disabled={!busqueda && !filtroRol}
          >
            Limpiar
          </Button>
        </Col>
      </Row>

      {/* Spinner de carga */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Tabla */}
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u._id}>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>{getBadgeRol(u.rol)}</td>
                    <td>
                      {u.rol === "admin" ? (
                        <span className="text-muted">No disponible</span>
                      ) : (
                        <>
                          <Link to={`/dashboard/usuarios/editar/${u._id}`}>
                            <Button variant="primary" size="sm" className="me-2">
                              Editar
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setUsuarioSeleccionado(u);
                              setShowConfirm(true);
                            }}
                          >
                            Eliminar
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Paginado */}
          {totalPaginas > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.Prev
                  onClick={() => {
                    const nuevaPagina = Math.max(paginaActual - 1, 1);
                    setPaginaActual(nuevaPagina);
                    cargarUsuarios(nuevaPagina, terminoBusqueda, filtroRol);
                  }}
                  disabled={paginaActual === 1}
                />
                {[...Array(totalPaginas)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === paginaActual}
                    onClick={() => {
                      setPaginaActual(i + 1);
                      cargarUsuarios(i + 1, terminoBusqueda, filtroRol);
                    }}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => {
                    const nuevaPagina = Math.min(paginaActual + 1, totalPaginas);
                    setPaginaActual(nuevaPagina);
                    cargarUsuarios(nuevaPagina, terminoBusqueda, filtroRol);
                  }}
                  disabled={paginaActual === totalPaginas}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que deseas eliminar a <strong>{usuarioSeleccionado?.nombre}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarUsuario}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast de mensajes */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.tipo}
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">{toast.tipo === "success" ? "Éxito" : "Error"}</strong>
          </Toast.Header>
          <Toast.Body className={toast.tipo === "success" ? "" : "text-white"}>
            {toast.mensaje}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default UsuariosList;




