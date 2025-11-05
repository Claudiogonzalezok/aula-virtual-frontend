import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  Modal,
  Toast,
  ToastContainer,
  Badge,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import API from "../../services/api";
import { Link, useLocation } from "react-router-dom";

const CursosList = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [toast, setToast] = useState({ show: false, mensaje: "", tipo: "success" });
  const [vistaTabla, setVistaTabla] = useState(true);
  const location = useLocation();

  // Función para cargar cursos
  const cargarCursos = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/cursos");
      setCursos(data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      setToast({ show: true, mensaje: "Error al cargar cursos", tipo: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarCursos();
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

  // Eliminar curso
  const eliminarCurso = async () => {
    if (!cursoSeleccionado) return;
    try {
      await API.delete(`/cursos/${cursoSeleccionado._id}`);
      setCursos((prev) => prev.filter((c) => c._id !== cursoSeleccionado._id));
      setToast({ show: true, mensaje: "Curso eliminado correctamente", tipo: "success" });
    } catch (error) {
      console.error("Error al eliminar curso:", error);
      setToast({ show: true, mensaje: "Error al eliminar curso", tipo: "danger" });
    } finally {
      setShowConfirm(false);
    }
  };

  // Obtener badge de estado
  const getBadgeEstado = (estado) => {
    const badges = {
      activo: "success",
      inactivo: "secondary",
      finalizado: "dark",
    };
    return badges[estado] || "secondary";
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Gestión de Cursos</h2>
        <div>
          <Button
            variant={vistaTabla ? "primary" : "outline-primary"}
            size="sm"
            className="me-2"
            onClick={() => setVistaTabla(true)}
          >
            📋 Tabla
          </Button>
          <Button
            variant={!vistaTabla ? "primary" : "outline-primary"}
            size="sm"
            className="me-3"
            onClick={() => setVistaTabla(false)}
          >
            🎴 Tarjetas
          </Button>
          <Link to="/dashboard/cursos/nuevo">
            <Button variant="success" className="shadow-sm">
              ➕ Nuevo Curso
            </Button>
          </Link>
        </div>
      </div>

      {/* Spinner de carga */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Vista de Tabla */}
          {vistaTabla ? (
            <Table striped bordered hover responsive className="shadow-sm">
              <thead className="table-primary">
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Docente</th>
                  <th>Alumnos</th>
                  <th>Inicio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cursos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      No hay cursos disponibles.
                    </td>
                  </tr>
                ) : (
                  cursos.map((curso) => (
                    <tr key={curso._id}>
                      <td>
                        <strong>{curso.codigo}</strong>
                      </td>
                      <td>{curso.titulo}</td>
                      <td>{curso.docente?.nombre}</td>
                      <td className="text-center">
                        <Badge bg="info">{curso.alumnos?.length || 0}</Badge>
                      </td>
                      <td>{formatearFecha(curso.fechaInicio)}</td>
                      <td>
                        <Badge bg={getBadgeEstado(curso.estado)}>
                          {curso.estado}
                        </Badge>
                      </td>
                      <td>
                        <Link to={`/dashboard/cursos/${curso._id}`}>
                          <Button variant="info" size="sm" className="me-2">
                            👁️ Ver
                          </Button>
                        </Link>
                        <Link to={`/dashboard/cursos/editar/${curso._id}`}>
                          <Button variant="primary" size="sm" className="me-2">
                            ✏️ Editar
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setCursoSeleccionado(curso);
                            setShowConfirm(true);
                          }}
                        >
                          🗑️ Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          ) : (
            /* Vista de Tarjetas */
            <Row>
              {cursos.length === 0 ? (
                <Col xs={12} className="text-center text-muted my-5">
                  No hay cursos disponibles.
                </Col>
              ) : (
                cursos.map((curso) => (
                  <Col key={curso._id} xs={12} md={6} lg={4} className="mb-4">
                    <Card className="shadow-sm h-100">
                      <Card.Img
                        variant="top"
                        src={curso.imagen || "https://via.placeholder.com/300x200?text=Curso"}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Badge bg="secondary">{curso.codigo}</Badge>
                          <Badge bg={getBadgeEstado(curso.estado)}>
                            {curso.estado}
                          </Badge>
                        </div>
                        <Card.Title>{curso.titulo}</Card.Title>
                        <Card.Text className="text-muted small">
                          {curso.descripcion?.substring(0, 100)}...
                        </Card.Text>
                        <div className="mt-auto">
                          <div className="mb-3">
                            <small className="text-muted">
                              👨‍🏫 {curso.docente?.nombre}
                            </small>
                            <br />
                            <small className="text-muted">
                              👥 {curso.alumnos?.length || 0} alumnos
                            </small>
                            <br />
                            <small className="text-muted">
                              📅 {formatearFecha(curso.fechaInicio)} - {formatearFecha(curso.fechaFin)}
                            </small>
                          </div>
                          <div className="d-grid gap-2">
                            <Link to={`/dashboard/cursos/${curso._id}`}>
                              <Button variant="info" size="sm" className="w-100">
                                👁️ Ver Detalles
                              </Button>
                            </Link>
                            <div className="d-flex gap-2">
                              <Link to={`/dashboard/cursos/editar/${curso._id}`} className="flex-fill">
                                <Button variant="primary" size="sm" className="w-100">
                                  ✏️ Editar
                                </Button>
                              </Link>
                              <Button
                                variant="danger"
                                size="sm"
                                className="flex-fill"
                                onClick={() => {
                                  setCursoSeleccionado(curso);
                                  setShowConfirm(true);
                                }}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          )}
        </>
      )}

      {/* Modal de confirmación */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que deseas eliminar el curso{" "}
          <strong>{cursoSeleccionado?.titulo}</strong>?
          <br />
          <small className="text-danger">
            Se eliminarán también todas las clases asociadas.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarCurso}>
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
            <strong className="me-auto">
              {toast.tipo === "success" ? "Éxito" : "Error"}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toast.mensaje}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default CursosList;