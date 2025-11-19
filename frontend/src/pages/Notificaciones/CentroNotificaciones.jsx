// frontend/src/pages/Notificaciones/CentroNotificaciones.jsx
import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
  Button,
  Spinner,
  Alert,
  Tabs,
  Tab,
  Dropdown,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { NotificacionContext } from "../../context/NotificacionContext";
import {
  obtenerNotificaciones,
  marcarComoLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
} from "../../services/notificacionService";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  FaBell,
  FaCheckCircle,
  FaTrash,
  FaEllipsisV,
  FaEnvelope,
  FaEnvelopeOpen,
  FaExclamationCircle,
  FaInfoCircle,
  FaCheckDouble,
} from "react-icons/fa";

const CentroNotificaciones = () => {
  const { cargarNotificaciones, cargarNoLeidas } = useContext(NotificacionContext);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("todas"); // todas, leidas, noLeidas
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarTodasNotificaciones();
  }, [filtro]);

  const cargarTodasNotificaciones = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filtro === "leidas") {
        params.leida = true;
      } else if (filtro === "noLeidas") {
        params.leida = false;
      }

      const data = await obtenerNotificaciones(params);
      setNotificaciones(data.notificaciones || data);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await marcarComoLeida(id);
      setNotificaciones((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, leida: true } : notif
        )
      );
      cargarNoLeidas();
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      setProcesando(true);
      await marcarTodasLeidas();
      setNotificaciones((prev) =>
        prev.map((notif) => ({ ...notif, leida: true }))
      );
      cargarNoLeidas();
    } catch (err) {
      alert("Error al marcar todas como leídas");
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta notificación?")) return;

    try {
      await eliminarNotificacion(id);
      setNotificaciones((prev) => prev.filter((notif) => notif._id !== id));
      cargarNotificaciones();
      cargarNoLeidas();
    } catch (err) {
      alert("Error al eliminar notificación");
    }
  };

  const obtenerIconoTipo = (tipo) => {
    switch (tipo) {
      case "examen":
        return <FaCheckCircle className="text-primary" />;
      case "tarea":
        return <FaEnvelope className="text-warning" />;
      case "mensaje":
        return <FaEnvelopeOpen className="text-info" />;
      case "curso":
        return <FaInfoCircle className="text-success" />;
      case "alerta":
        return <FaExclamationCircle className="text-danger" />;
      default:
        return <FaBell className="text-secondary" />;
    }
  };

  const obtenerColorTipo = (tipo) => {
    switch (tipo) {
      case "examen":
        return "primary";
      case "tarea":
        return "warning";
      case "mensaje":
        return "info";
      case "curso":
        return "success";
      case "alerta":
        return "danger";
      default:
        return "secondary";
    }
  };

  const notificacionesFiltradas = notificaciones;

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando notificaciones...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FaBell className="me-2" />
                Centro de Notificaciones
              </h2>
              <p className="text-muted mb-0">
                {notificaciones.filter((n) => !n.leida).length} sin leer de{" "}
                {notificaciones.length} total
              </p>
            </div>
            <Button
              variant="outline-primary"
              onClick={handleMarcarTodasLeidas}
              disabled={
                procesando ||
                notificaciones.filter((n) => !n.leida).length === 0
              }
            >
              {procesando ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <FaCheckDouble className="me-2" />
                  Marcar todas como leídas
                </>
              )}
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros por Tabs */}
      <Tabs
        activeKey={filtro}
        onSelect={(k) => setFiltro(k)}
        className="mb-4"
      >
        <Tab
          eventKey="todas"
          title={`Todas (${notificaciones.length})`}
        />
        <Tab
          eventKey="noLeidas"
          title={
            <span>
              No leídas{" "}
              <Badge bg="danger" pill>
                {notificaciones.filter((n) => !n.leida).length}
              </Badge>
            </span>
          }
        />
        <Tab
          eventKey="leidas"
          title={`Leídas (${notificaciones.filter((n) => n.leida).length})`}
        />
      </Tabs>

      {/* Lista de Notificaciones */}
      {notificacionesFiltradas.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <FaBell size={60} className="text-muted mb-3" />
            <h5 className="text-muted">No hay notificaciones</h5>
            <p className="text-muted">
              {filtro === "noLeidas"
                ? "¡Todo al día! No tienes notificaciones sin leer"
                : "Aquí aparecerán tus notificaciones"}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <ListGroup>
          {notificacionesFiltradas.map((notif) => (
            <ListGroup.Item
              key={notif._id}
              className={`${
                !notif.leida ? "bg-light border-start border-primary border-3" : ""
              } mb-2 shadow-sm`}
            >
              <Row className="align-items-center">
                {/* Icono */}
                <Col xs="auto">
                  <div
                    className="rounded-circle p-3"
                    style={{
                      backgroundColor: `var(--bs-${obtenerColorTipo(
                        notif.tipo
                      )}-bg-subtle)`,
                    }}
                  >
                    {obtenerIconoTipo(notif.tipo)}
                  </div>
                </Col>

                {/* Contenido */}
                <Col>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">
                        {notif.titulo}
                        {!notif.leida && (
                          <Badge bg="primary" pill className="ms-2">
                            Nueva
                          </Badge>
                        )}
                      </h6>
                      <p className="mb-1 text-muted">{notif.mensaje}</p>
                      <small className="text-muted">
                        <FaBell size={12} className="me-1" />
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </small>
                    </div>

                    {/* Acciones */}
                    <Dropdown align="end">
                      <Dropdown.Toggle
                        variant="link"
                        size="sm"
                        className="text-muted"
                      >
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {!notif.leida && (
                          <Dropdown.Item
                            onClick={() => handleMarcarLeida(notif._id)}
                          >
                            <FaCheckCircle className="me-2" />
                            Marcar como leída
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item
                          onClick={() => handleEliminar(notif._id)}
                          className="text-danger"
                        >
                          <FaTrash className="me-2" />
                          Eliminar
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  {/* Botón de acción si tiene enlace */}
                  {notif.enlace && (
                    <div>
                      <Link to={notif.enlace}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => !notif.leida && handleMarcarLeida(notif._id)}
                        >
                          Ver detalles →
                        </Button>
                      </Link>
                    </div>
                  )}
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Paginación (si hay muchas notificaciones) */}
      {notificacionesFiltradas.length > 0 && (
        <div className="text-center mt-4">
          <small className="text-muted">
            Mostrando {notificacionesFiltradas.length} notificaciones
          </small>
        </div>
      )}
    </Container>
  );
};

export default CentroNotificaciones;