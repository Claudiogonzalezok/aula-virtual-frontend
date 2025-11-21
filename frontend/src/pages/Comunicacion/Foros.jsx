// frontend/src/pages/Comunicacion/Foros.jsx
import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  ListGroup,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";
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
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nuevoForo, setNuevoForo] = useState({ titulo: "", contenido: "" });
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    cargarForos();
  }, [cursoId]);

  const cargarForos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarForos(cursoId);
      setForos(data.foros || data);
    } catch (err) {
      console.error("Error al cargar foros:", err);
      setError("No se pudieron cargar los foros. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearForo = async (e) => {
    e.preventDefault();
    
    if (!nuevoForo.titulo.trim() || !nuevoForo.contenido.trim()) {
      alert("Completa todos los campos");
      return;
    }

    try {
      setCreando(true);
      await crearForo({ ...nuevoForo, cursoId });
      setShowModal(false);
      setNuevoForo({ titulo: "", contenido: "" });
      cargarForos();
    } catch (err) {
      console.error("Error al crear foro:", err);
      alert("Error al crear foro. Intenta nuevamente.");
    } finally {
      setCreando(false);
    }
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setNuevoForo({ titulo: "", contenido: "" });
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando foros...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FaComments className="me-2" />
                Foros de Discusión
              </h2>
              <p className="text-muted mb-0">
                {foros.length} {foros.length === 1 ? "tema" : "temas"} de discusión
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              Nuevo Tema
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
                <Col md={9}>
                  {/* ✅ CORREGIDO: Añadir /detalle a la ruta */}
                  <Link
                    to={`/dashboard/foros/${foro._id}/detalle`}
                    className="text-decoration-none"
                  >
                    <h5 className="mb-2 text-primary">{foro.titulo}</h5>
                  </Link>
                  <p className="text-muted mb-2">
                    {foro.contenido.substring(0, 150)}
                    {foro.contenido.length > 150 ? "..." : ""}
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
                  </div>
                </Col>
                <Col md={3} className="text-end d-flex flex-column justify-content-center">
                  <Badge bg="primary" className="mb-2 fs-6">
                    <FaComments className="me-1" />
                    {foro.respuestas?.length || 0}{" "}
                    {foro.respuestas?.length === 1 ? "respuesta" : "respuestas"}
                  </Badge>
                  {foro.respuestas?.length > 0 && (
                    <small className="text-muted">
                      Última actividad:{" "}
                      {formatDistanceToNow(
                        new Date(
                          foro.respuestas[foro.respuestas.length - 1].createdAt
                        ),
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
      <Modal show={showModal} onHide={handleCerrarModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Tema de Discusión</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCrearForo}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título *</Form.Label>
              <Form.Control
                type="text"
                value={nuevoForo.titulo}
                onChange={(e) =>
                  setNuevoForo({ ...nuevoForo, titulo: e.target.value })
                }
                required
                placeholder="¿Sobre qué quieres hablar?"
                maxLength={200}
              />
              <Form.Text className="text-muted">
                {nuevoForo.titulo.length}/200 caracteres
              </Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Contenido *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={nuevoForo.contenido}
                onChange={(e) =>
                  setNuevoForo({ ...nuevoForo, contenido: e.target.value })
                }
                required
                placeholder="Escribe tu mensaje... Puedes hacer preguntas, compartir ideas o iniciar debates."
              />
              <Form.Text className="text-muted">
                Sé claro y respetuoso en tu mensaje
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCerrarModal}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={
                creando ||
                !nuevoForo.titulo.trim() ||
                !nuevoForo.contenido.trim()
              }
            >
              {creando ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Publicando...
                </>
              ) : (
                <>
                  <FaPlus className="me-2" />
                  Publicar
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Foros;