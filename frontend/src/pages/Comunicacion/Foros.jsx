// frontend/src/pages/Comunicacion/Foros.jsx
import { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Button, Form, Badge, ListGroup, Modal, Spinner } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { listarForos, crearForo } from "../../services/foroService";
import { FaComments, FaPlus, FaUser, FaClock } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const Foros = () => {
  const { cursoId } = useParams();
  const { usuario } = useContext(AuthContext);
  const [foros, setForos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nuevoForo, setNuevoForo] = useState({ titulo: "", contenido: "" });

  useEffect(() => {
    cargarForos();
  }, [cursoId]);

  const cargarForos = async () => {
    try {
      setLoading(true);
      const data = await listarForos(cursoId);
      setForos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearForo = async (e) => {
    e.preventDefault();
    try {
      await crearForo({ ...nuevoForo, cursoId });
      setShowModal(false);
      setNuevoForo({ titulo: "", contenido: "" });
      cargarForos();
    } catch (err) {
      alert("Error al crear foro");
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>💬 Foros de Discusión</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              Nuevo Tema
            </Button>
          </div>
        </Col>
      </Row>

      {foros.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <FaComments size={60} className="text-muted mb-3" />
            <h5>No hay temas de discusión</h5>
            <p className="text-muted">Sé el primero en iniciar una conversación</p>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Crear Primer Tema
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <ListGroup>
          {foros.map((foro) => (
            <ListGroup.Item key={foro._id} className="mb-3 shadow-sm">
              <Row>
                <Col md={8}>
                  <Link to={`/dashboard/foros/${foro._id}`} className="text-decoration-none">
                    <h5 className="mb-2">{foro.titulo}</h5>
                  </Link>
                  <p className="text-muted mb-2">
                    {foro.contenido.substring(0, 150)}...
                  </p>
                  <div className="d-flex gap-3 text-muted small">
                    <span>
                      <FaUser className="me-1" />
                      {foro.autor.nombre}
                    </span>
                    <span>
                      <FaClock className="me-1" />
                      {formatDistanceToNow(new Date(foro.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <Badge bg="primary" className="mb-2">
                    {foro.respuestas?.length || 0} respuestas
                  </Badge>
                  <br />
                  {foro.respuestas?.length > 0 && (
                    <small className="text-muted">
                      Última respuesta:{" "}
                      {formatDistanceToNow(
                        new Date(foro.respuestas[foro.respuestas.length - 1].createdAt),
                        { addSuffix: true, locale: es }
                      )}
                    </small>
                  )}
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Modal Crear Foro */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Tema de Discusión</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCrearForo}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título *</Form.Label>
              <Form.Control
                value={nuevoForo.titulo}
                onChange={(e) => setNuevoForo({ ...nuevoForo, titulo: e.target.value })}
                required
                placeholder="¿Sobre qué quieres hablar?"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Contenido *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={nuevoForo.contenido}
                onChange={(e) => setNuevoForo({ ...nuevoForo, contenido: e.target.value })}
                required
                placeholder="Escribe tu mensaje..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Publicar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Foros;