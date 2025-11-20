// frontend/src/pages/Comunicacion/ForoDetalle.jsx
import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { obtenerForo, responderForo, eliminarForo } from "../../services/foroService";
import { FaUser, FaClock, FaReply, FaArrowLeft, FaTrash } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const ForoDetalle = () => {
  const { foroId } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const [foro, setForo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarForo();
  }, [foroId]);

  const cargarForo = async () => {
    try {
      setLoading(true);
      const data = await obtenerForo(foroId);
      setForo(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al cargar el foro");
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async (e) => {
    e.preventDefault();
    if (!respuesta.trim()) return;

    try {
      setEnviando(true);
      await responderForo(foroId, respuesta);
      setRespuesta("");
      cargarForo();
    } catch (err) {
      alert("Error al enviar respuesta");
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async () => {
    if (!window.confirm("¿Eliminar este foro? Esta acción no se puede deshacer."))
      return;

    try {
      await eliminarForo(foroId);
      navigate(-1);
    } catch (err) {
      alert("Error al eliminar foro");
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando foro...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Container>
    );
  }

  if (!foro) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Foro no encontrado</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" />
              Volver
            </Button>
            {(usuario._id === foro.autor?._id || usuario.rol === "docente") && (
              <Button variant="outline-danger" onClick={handleEliminar}>
                <FaTrash className="me-2" />
                Eliminar Foro
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Tema Principal */}
      <Card className="mb-4 shadow">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">{foro.titulo}</h4>
        </Card.Header>
        <Card.Body>
          <p className="mb-3" style={{ whiteSpace: "pre-wrap" }}>
            {foro.contenido}
          </p>
          <div className="d-flex gap-3 text-muted small border-top pt-3">
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
            <Badge bg="primary" pill>
              {foro.respuestas?.length || 0} respuestas
            </Badge>
          </div>
        </Card.Body>
      </Card>

      {/* Respuestas */}
      <h5 className="mb-3">
        <FaReply className="me-2" />
        Respuestas ({foro.respuestas?.length || 0})
      </h5>

      {foro.respuestas && foro.respuestas.length > 0 ? (
        <ListGroup className="mb-4">
          {foro.respuestas.map((resp, index) => (
            <ListGroup.Item key={resp._id || index} className="shadow-sm mb-2">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <FaUser />
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong>{resp.autor?.nombre || "Usuario"}</strong>
                      {resp.autor?.rol === "docente" && (
                        <Badge bg="success" className="ms-2">
                          Docente
                        </Badge>
                      )}
                    </div>
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(resp.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </small>
                  </div>
                  <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {resp.mensaje}
                  </p>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Card className="mb-4">
          <Card.Body className="text-center text-muted py-4">
            No hay respuestas aún. ¡Sé el primero en responder!
          </Card.Body>
        </Card>
      )}

      {/* Formulario de Respuesta */}
      <Card className="shadow">
        <Card.Header>
          <h6 className="mb-0">
            <FaReply className="me-2" />
            Escribir Respuesta
          </h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleResponder}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={4}
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={enviando}>
              {enviando ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <FaReply className="me-2" />
                  Publicar Respuesta
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForoDetalle;