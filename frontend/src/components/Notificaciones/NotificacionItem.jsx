// frontend/src/components/Notificaciones/NotificacionItem.jsx
import { Card, Badge, Button, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaBell, FaClock, FaCheckCircle, FaTrash, FaEllipsisV } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const NotificacionItem = ({ notificacion, onMarcarLeida, onEliminar }) => {
  const obtenerIconoTipo = (tipo) => {
    switch (tipo) {
      case "examen":
        return "📝";
      case "tarea":
        return "📚";
      case "mensaje":
        return "💬";
      case "curso":
        return "🎓";
      case "alerta":
        return "⚠️";
      default:
        return "🔔";
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

  return (
    <Card
      className={`mb-3 shadow-sm ${
        !notificacion.leida ? "border-start border-primary border-3" : ""
      }`}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div className="d-flex gap-3 flex-grow-1">
            <div className="fs-2">{obtenerIconoTipo(notificacion.tipo)}</div>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <h6 className="mb-0">{notificacion.titulo}</h6>
                {!notificacion.leida && (
                  <Badge bg="primary" pill>
                    Nueva
                  </Badge>
                )}
                <Badge bg={obtenerColorTipo(notificacion.tipo)}>
                  {notificacion.tipo}
                </Badge>
              </div>
              <p className="mb-2 text-muted">{notificacion.mensaje}</p>
              <small className="text-muted">
                <FaClock size={12} className="me-1" />
                {formatDistanceToNow(new Date(notificacion.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </small>
            </div>
          </div>

          <Dropdown align="end">
            <Dropdown.Toggle variant="link" size="sm" className="text-muted">
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {!notificacion.leida && onMarcarLeida && (
                <Dropdown.Item onClick={() => onMarcarLeida(notificacion._id)}>
                  <FaCheckCircle className="me-2" />
                  Marcar como leída
                </Dropdown.Item>
              )}
              {onEliminar && (
                <Dropdown.Item
                  onClick={() => onEliminar(notificacion._id)}
                  className="text-danger"
                >
                  <FaTrash className="me-2" />
                  Eliminar
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {notificacion.enlace && (
          <div className="mt-2">
            <Link to={notificacion.enlace}>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() =>
                  !notificacion.leida &&
                  onMarcarLeida &&
                  onMarcarLeida(notificacion._id)
                }
              >
                Ver detalles →
              </Button>
            </Link>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default NotificacionItem;