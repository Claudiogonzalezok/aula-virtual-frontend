// frontend/src/pages/Comunicacion/Mensajes.jsx
import { useState, useEffect, useContext, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Spinner,
  Alert,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import {
  obtenerConversaciones,
  obtenerMensajes,
  enviarMensaje,
  marcarComoLeido,
} from "../../services/mensajeService";
import TarjetaMensaje from "../../components/Comunicacion/TarjetaMensaje";
import { FaPaperPlane, FaSearch, FaUser } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const Mensajes = () => {
  const { usuario } = useContext(AuthContext);
  const [conversaciones, setConversaciones] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    cargarConversaciones();
  }, []);

  useEffect(() => {
    if (conversacionActiva) {
      cargarMensajes(conversacionActiva._id);
    }
  }, [conversacionActiva]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const cargarConversaciones = async () => {
    try {
      setLoading(true);
      const data = await obtenerConversaciones();
      setConversaciones(data.conversaciones || data);
    } catch (err) {
      console.error("Error al cargar conversaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarMensajes = async (usuarioId) => {
    try {
      const data = await obtenerMensajes(usuarioId);
      setMensajes(data.mensajes || data);

      // Marcar mensajes como leídos
      const mensajesNoLeidos = (data.mensajes || data).filter(
        (m) => !m.leido && m.remitente._id !== usuario._id
      );
      for (const mensaje of mensajesNoLeidos) {
        await marcarComoLeido(mensaje._id);
      }
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
    }
  };

  const handleSeleccionarConversacion = (conv) => {
    setConversacionActiva(conv);
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !conversacionActiva) return;

    try {
      setEnviando(true);
      await enviarMensaje(conversacionActiva._id, nuevoMensaje);
      setNuevoMensaje("");
      cargarMensajes(conversacionActiva._id);
      cargarConversaciones();
    } catch (err) {
      alert("Error al enviar mensaje");
    } finally {
      setEnviando(false);
    }
  };

  const conversacionesFiltradas = conversaciones.filter((conv) =>
    conv.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando mensajes...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4 mb-5">
      <Row>
        <Col>
          <h2 className="mb-4">💬 Mensajes</h2>
        </Col>
      </Row>

      <Row style={{ height: "calc(100vh - 200px)" }}>
        {/* Lista de Conversaciones */}
        <Col md={4} className="border-end">
          <Card className="h-100">
            <Card.Header>
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar conversación..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Card.Header>
            <Card.Body className="p-0" style={{ overflowY: "auto" }}>
              {conversacionesFiltradas.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>No hay conversaciones</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {conversacionesFiltradas.map((conv) => (
                    <ListGroup.Item
                      key={conv._id}
                      action
                      active={conversacionActiva?._id === conv._id}
                      onClick={() => handleSeleccionarConversacion(conv)}
                      className="border-bottom"
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <FaUser />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <strong>{conv.nombre}</strong>
                            {conv.noLeidos > 0 && (
                              <Badge bg="danger" pill>
                                {conv.noLeidos}
                              </Badge>
                            )}
                          </div>
                          <small className="text-muted">
                            {conv.ultimoMensaje?.substring(0, 40)}...
                          </small>
                          <br />
                          <small className="text-muted">
                            {conv.fecha &&
                              formatDistanceToNow(new Date(conv.fecha), {
                                addSuffix: true,
                                locale: es,
                              })}
                          </small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Área de Mensajes */}
        <Col md={8}>
          {!conversacionActiva ? (
            <Card className="h-100">
              <Card.Body className="d-flex align-items-center justify-content-center">
                <div className="text-center text-muted">
                  <FaPaperPlane size={60} className="mb-3" />
                  <h5>Selecciona una conversación</h5>
                  <p>Elige un contacto para comenzar a chatear</p>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className="h-100 d-flex flex-column">
              {/* Header */}
              <Card.Header className="bg-primary text-white">
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-3"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <FaUser />
                  </div>
                  <div>
                    <strong>{conversacionActiva.nombre}</strong>
                    <br />
                    <small>
                      {conversacionActiva.rol === "docente"
                        ? "Docente"
                        : "Alumno"}
                    </small>
                  </div>
                </div>
              </Card.Header>

              {/* Mensajes */}
              <Card.Body
                className="flex-grow-1"
                style={{ overflowY: "auto", maxHeight: "calc(100vh - 400px)" }}
              >
                {mensajes.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <p>No hay mensajes. ¡Inicia la conversación!</p>
                  </div>
                ) : (
                  <>
                    {mensajes.map((mensaje) => (
                      <TarjetaMensaje
                        key={mensaje._id}
                        mensaje={mensaje}
                        esPropio={mensaje.remitente._id === usuario._id}
                      />
                    ))}
                    <div ref={mensajesEndRef} />
                  </>
                )}
              </Card.Body>

              {/* Formulario de Envío */}
              <Card.Footer>
                <Form onSubmit={handleEnviarMensaje}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Escribe un mensaje..."
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      disabled={enviando}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={enviando || !nuevoMensaje.trim()}
                    >
                      {enviando ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaPaperPlane />
                      )}
                    </Button>
                  </InputGroup>
                </Form>
              </Card.Footer>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Mensajes;