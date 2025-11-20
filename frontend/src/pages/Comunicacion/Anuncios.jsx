// frontend/src/pages/Comunicacion/Anuncios.jsx
import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Spinner,
  Alert,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  obtenerAnunciosPorCurso,
  eliminarAnuncio,
  marcarAnuncioLeido,
} from "../../services/anuncioService";
import FormAnuncio from "../../components/Comunicacion/FormAnuncio";
import { FaBullhorn, FaPlus, FaTrash, FaEdit, FaThumbtack } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const Anuncios = () => {
  const { cursoId } = useParams();
  const { usuario } = useContext(AuthContext);
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [anuncioEditar, setAnuncioEditar] = useState(null);

  useEffect(() => {
    cargarAnuncios();
  }, [cursoId]);

  const cargarAnuncios = async () => {
    try {
      setLoading(true);
      const data = await obtenerAnunciosPorCurso(cursoId);
      setAnuncios(data.anuncios || data);
    } catch (err) {
      setError(err.msg || "Error al cargar anuncios");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este anuncio?")) return;

    try {
      await eliminarAnuncio(id);
      setAnuncios(anuncios.filter((a) => a._id !== id));
    } catch (err) {
      alert("Error al eliminar anuncio");
    }
  };

  const handleMarcarLeido = async (id) => {
    try {
      await marcarAnuncioLeido(id);
      setAnuncios(
        anuncios.map((a) => (a._id === id ? { ...a, leido: true } : a))
      );
    } catch (err) {
      console.error("Error al marcar como leído:", err);
    }
  };

  const handleEditar = (anuncio) => {
    setAnuncioEditar(anuncio);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setAnuncioEditar(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    cargarAnuncios();
  };

  const obtenerColorPrioridad = (prioridad) => {
    switch (prioridad) {
      case "urgente":
        return "danger";
      case "alta":
        return "warning";
      case "normal":
        return "primary";
      case "baja":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando anuncios...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              <FaBullhorn className="me-2" />
              Anuncios del Curso
            </h2>
            {usuario.rol === "docente" && (
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <FaPlus className="me-2" />
                Nuevo Anuncio
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Lista de Anuncios */}
      {anuncios.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <FaBullhorn size={60} className="text-muted mb-3" />
            <h5>No hay anuncios</h5>
            <p className="text-muted">Aún no se han publicado anuncios en este curso</p>
          </Card.Body>
        </Card>
      ) : (
        <ListGroup>
          {anuncios.map((anuncio) => (
            <ListGroup.Item
              key={anuncio._id}
              className={`mb-3 shadow-sm ${
                anuncio.fijado ? "border-start border-warning border-3" : ""
              }`}
            >
              <Row>
                <Col md={12}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        {anuncio.fijado && (
                          <FaThumbtack className="text-warning" />
                        )}
                        <h5 className="mb-0">{anuncio.titulo}</h5>
                        <Badge bg={obtenerColorPrioridad(anuncio.prioridad)}>
                          {anuncio.prioridad}
                        </Badge>
                        {!anuncio.leido && usuario.rol === "alumno" && (
                          <Badge bg="primary">Nuevo</Badge>
                        )}
                      </div>
                      <p className="mb-2">{anuncio.contenido}</p>
                      <div className="text-muted small">
                        <span className="me-3">
                          👤 {anuncio.autor?.nombre || "Docente"}
                        </span>
                        <span>
                          🕒{" "}
                          {formatDistanceToNow(new Date(anuncio.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                    {usuario.rol === "docente" && (
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditar(anuncio)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEliminar(anuncio._id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    )}
                  </div>
                  {!anuncio.leido && usuario.rol === "alumno" && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleMarcarLeido(anuncio._id)}
                    >
                      Marcar como leído
                    </Button>
                  )}
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Modal Crear/Editar */}
      <Modal
        show={showModal}
        onHide={handleModalClose}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {anuncioEditar ? "Editar Anuncio" : "Nuevo Anuncio"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormAnuncio
            cursoId={cursoId}
            anuncioEditar={anuncioEditar}
            onSuccess={handleSuccess}
            onCancel={handleModalClose}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Anuncios;