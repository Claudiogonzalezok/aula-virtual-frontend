// frontend/src/components/Comunicacion/ListaForos.jsx
import { Card, Badge, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUser, FaClock, FaComments } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const ListaForos = ({ foros }) => {
  if (!foros || foros.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <FaComments size={60} className="text-muted mb-3" />
          <h5>No hay foros disponibles</h5>
          <p className="text-muted">
            Sé el primero en iniciar una conversación
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <ListGroup>
      {foros.map((foro) => (
        <ListGroup.Item key={foro._id} className="mb-3 shadow-sm">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <Link
                to={`/dashboard/foros/${foro._id}`}
                className="text-decoration-none"
              >
                <h5 className="mb-2">{foro.titulo}</h5>
              </Link>
              <p className="text-muted mb-2">
                {foro.contenido.length > 200
                  ? `${foro.contenido.substring(0, 200)}...`
                  : foro.contenido}
              </p>
              <div className="d-flex gap-3 text-muted small">
                <span>
                  <FaUser className="me-1" />
                  {foro.autor?.nombre || "Usuario"}
                </span>
                <span>
                  <FaClock className="me-1" />
                  {formatDistanceToNow(new Date(foro.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
                <span>
                  <FaComments className="me-1" />
                  {foro.respuestas?.length || 0} respuestas
                </span>
              </div>
            </div>
            <div className="text-end">
              <Badge bg="primary" pill>
                {foro.respuestas?.length || 0}
              </Badge>
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default ListaForos;