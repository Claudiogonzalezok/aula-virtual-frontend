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
  Modal,
} from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import {
  obtenerConversaciones,
  obtenerMensajes,
  enviarMensaje,
  marcarComoLeido,
} from "../../services/mensajeService";
import API from "../../services/api";
import TarjetaMensaje from "../../components/Comunicacion/TarjetaMensaje";
import { FaPaperPlane, FaSearch, FaUser, FaPlus } from "react-icons/fa";
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

  // ✅ NUEVO: Estado para modal de nuevo mensaje
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [busquedaUsuarios, setBusquedaUsuarios] = useState("");
  const [mensajeNuevo, setMensajeNuevo] = useState("");

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

  // ✅ NUEVO: Cargar usuarios para nuevo mensaje
  const cargarUsuarios = async () => {
    try {
      console.log("🔍 Intentando cargar usuarios para mensajería...");
      console.log("👤 Usuario actual:", usuario);
      
      const { data } = await API.get("/usuarios/mensajeria");
      console.log("📦 Respuesta del servidor:", data);
      console.log("📊 Usuarios recibidos:", data.usuarios?.length || 0);
      
      // Filtrar el usuario actual
      const usuariosFiltrados = (data.usuarios || data).filter(
        (u) => u._id !== usuario._id
      );
      console.log("✅ Usuarios filtrados (sin usuario actual):", usuariosFiltrados.length);
      
      setUsuarios(usuariosFiltrados);
    } catch (err) {
      console.error("❌ Error al cargar usuarios:", err);
      console.error("📄 Detalles del error:", err.response?.data);
      console.error("🔢 Status code:", err.response?.status);
      
      // Mostrar alerta al usuario
      alert(`Error al cargar usuarios: ${err.response?.data?.msg || err.message}`);
    }
  };

  // ✅ NUEVO: Abrir modal de nuevo mensaje
  const handleNuevoMensaje = () => {
    setShowModalNuevo(true);
    cargarUsuarios();
  };

  // ✅ NUEVO: Enviar primer mensaje
  const handleEnviarPrimerMensaje = async () => {
    if (!usuarioSeleccionado || !mensajeNuevo.trim()) {
      alert("Selecciona un usuario y escribe un mensaje");
      return;
    }

    try {
      setEnviando(true);
      await enviarMensaje(usuarioSeleccionado._id, mensajeNuevo);
      
      // Cerrar modal
      setShowModalNuevo(false);
      setUsuarioSeleccionado(null);
      setMensajeNuevo("");
      setBusquedaUsuarios("");
      
      // Recargar conversaciones y seleccionar la nueva
      await cargarConversaciones();
      
      // Buscar y seleccionar la conversación nueva
      const conversacionNueva = conversaciones.find(
        (c) => c._id === usuarioSeleccionado._id
      );
      if (conversacionNueva) {
        setConversacionActiva(conversacionNueva);
      } else {
        // Si no está en la lista, crear objeto temporal
        setConversacionActiva({
          _id: usuarioSeleccionado._id,
          nombre: usuarioSeleccionado.nombre,
          rol: usuarioSeleccionado.rol,
        });
      }
    } catch (err) {
      alert("Error al enviar mensaje");
    } finally {
      setEnviando(false);
    }
  };

  // ✅ Filtrar conversaciones
  const conversacionesFiltradas = conversaciones.filter((conv) =>
    conv.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ✅ Filtrar usuarios
  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre?.toLowerCase().includes(busquedaUsuarios.toLowerCase())
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>💬 Mensajes</h2>
            {/* ✅ NUEVO: Botón para nuevo mensaje */}
            <Button variant="primary" onClick={handleNuevoMensaje}>
              <FaPlus className="me-2" />
              Nuevo Mensaje
            </Button>
          </div>
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
                  <FaUser size={50} className="mb-3" />
                  <p>No hay conversaciones</p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleNuevoMensaje}
                  >
                    Iniciar conversación
                  </Button>
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
                            {conv.ultimoMensaje?.substring(0, 40)}
                            {conv.ultimoMensaje?.length > 40 ? "..." : ""}
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
                  <Button variant="primary" onClick={handleNuevoMensaje}>
                    <FaPlus className="me-2" />
                    Iniciar Nueva Conversación
                  </Button>
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
                        : conversacionActiva.rol === "admin"
                        ? "Administrador"
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

      {/* ✅ NUEVO: Modal para Nuevo Mensaje */}
      <Modal
        show={showModalNuevo}
        onHide={() => setShowModalNuevo(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Mensaje</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Búsqueda de usuarios */}
          <Form.Group className="mb-3">
            <Form.Label>Buscar usuario</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Escribe el nombre del usuario..."
                value={busquedaUsuarios}
                onChange={(e) => setBusquedaUsuarios(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          {/* Lista de usuarios */}
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #dee2e6",
              borderRadius: "5px",
            }}
          >
            {usuariosFiltrados.length === 0 ? (
              <div className="text-center text-muted py-4">
                No se encontraron usuarios
              </div>
            ) : (
              <ListGroup variant="flush">
                {usuariosFiltrados.map((u) => (
                  <ListGroup.Item
                    key={u._id}
                    action
                    active={usuarioSeleccionado?._id === u._id}
                    onClick={() => setUsuarioSeleccionado(u)}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <FaUser />
                      </div>
                      <div>
                        <strong>{u.nombre}</strong>
                        <br />
                        <small className="text-muted">
                          {u.email} •{" "}
                          {u.rol === "docente"
                            ? "Docente"
                            : u.rol === "admin"
                            ? "Administrador"
                            : "Alumno"}
                        </small>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>

          {/* Mensaje */}
          {usuarioSeleccionado && (
            <Form.Group className="mt-3">
              <Form.Label>
                Mensaje para <strong>{usuarioSeleccionado.nombre}</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Escribe tu mensaje..."
                value={mensajeNuevo}
                onChange={(e) => setMensajeNuevo(e.target.value)}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModalNuevo(false);
              setUsuarioSeleccionado(null);
              setMensajeNuevo("");
              setBusquedaUsuarios("");
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleEnviarPrimerMensaje}
            disabled={!usuarioSeleccionado || !mensajeNuevo.trim() || enviando}
          >
            {enviando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Enviando...
              </>
            ) : (
              <>
                <FaPaperPlane className="me-2" />
                Enviar Mensaje
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Mensajes;