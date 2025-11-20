// frontend/src/components/Comunicacion/TarjetaMensaje.jsx
import { Card, Badge } from "react-bootstrap";
import { FaUser, FaClock } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const TarjetaMensaje = ({ mensaje, esPropio }) => {
  return (
    <div
      className={`d-flex mb-3 ${esPropio ? "justify-content-end" : "justify-content-start"}`}
    >
      <Card
        className={`shadow-sm ${esPropio ? "bg-primary text-white" : ""}`}
        style={{ maxWidth: "70%" }}
      >
        <Card.Body className="py-2 px-3">
          {!esPropio && (
            <div className="d-flex align-items-center mb-1">
              <FaUser size={12} className="me-1" />
              <small className="fw-bold">
                {mensaje.remitente?.nombre || "Usuario"}
              </small>
            </div>
          )}
          <p className="mb-1">{mensaje.contenido}</p>
          <div className="d-flex justify-content-between align-items-center">
            <small
              className={`${esPropio ? "text-white-50" : "text-muted"}`}
            >
              <FaClock size={10} className="me-1" />
              {formatDistanceToNow(new Date(mensaje.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </small>
            {!mensaje.leido && !esPropio && (
              <Badge bg="danger" pill>
                Nuevo
              </Badge>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TarjetaMensaje;