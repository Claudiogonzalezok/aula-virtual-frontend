// frontend/src/pages/Inscripciones/SolicitarInscripcion.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Spinner,
  Badge,
  Form,
  Modal,
  Tab,
  Nav,
  Alert,
  InputGroup
} from "react-bootstrap";
import {
  FaBook,
  FaCalendarAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaPaperPlane,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBan,
  FaInfoCircle,
  FaClipboardList
} from "react-icons/fa";
import API from "../../services/api";
import { toast } from "react-toastify";

const SolicitarInscripcion = () => {
  // Estados principales
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [activeTab, setActiveTab] = useState("cursos");

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    cargarCursosDisponibles();
    cargarMisSolicitudes();
  }, []);

  const cargarCursosDisponibles = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/solicitudes-inscripcion/cursos-disponibles");
      setCursosDisponibles(data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      toast.error("Error al cargar cursos disponibles");
    } finally {
      setLoading(false);
    }
  };

  const cargarMisSolicitudes = async () => {
    try {
      setLoadingSolicitudes(true);
      const { data } = await API.get("/solicitudes-inscripcion/mis-solicitudes");
      setMisSolicitudes(data);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const handleAbrirModal = (curso) => {
    setCursoSeleccionado(curso);
    setMensaje("");
    setShowModal(true);
  };

  const handleEnviarSolicitud = async () => {
    if (!cursoSeleccionado) return;

    try {
      setEnviando(true);
      await API.post("/solicitudes-inscripcion", {
        cursoId: cursoSeleccionado._id,
        mensaje: mensaje.trim()
      });

      toast.success("Solicitud enviada correctamente");
      setShowModal(false);
      
      // Recargar datos
      cargarCursosDisponibles();
      cargarMisSolicitudes();
      setActiveTab("solicitudes");
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      toast.error(error.response?.data?.msg || "Error al enviar solicitud");
    } finally {
      setEnviando(false);
    }
  };

  const handleCancelarSolicitud = async (solicitudId) => {
    if (!window.confirm("¿Estás seguro de cancelar esta solicitud?")) return;

    try {
      await API.put(`/solicitudes-inscripcion/cancelar/${solicitudId}`);
      toast.success("Solicitud cancelada");
      cargarMisSolicitudes();
      cargarCursosDisponibles();
    } catch (error) {
      console.error("Error al cancelar:", error);
      toast.error(error.response?.data?.msg || "Error al cancelar solicitud");
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // Calcular días hasta inicio
  const diasHastaInicio = (fechaInicio) => {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const diffTime = inicio - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filtrar cursos
  const cursosFiltrados = cursosDisponibles.filter(curso => {
    if (!busqueda) return true;
    const termino = busqueda.toLowerCase();
    return (
      curso.titulo?.toLowerCase().includes(termino) ||
      curso.codigo?.toLowerCase().includes(termino) ||
      curso.docente?.nombre?.toLowerCase().includes(termino)
    );
  });

  // Filtrar solicitudes
  const solicitudesFiltradas = misSolicitudes.filter(sol => {
    if (filtroEstado === "todos") return true;
    return sol.estado === filtroEstado;
  });

  // Obtener badge según estado
  const getBadgeEstado = (estado) => {
    const config = {
      pendiente: { bg: "warning", icon: <FaHourglassHalf />, text: "Pendiente" },
      aprobada: { bg: "success", icon: <FaCheckCircle />, text: "Aprobada" },
      rechazada: { bg: "danger", icon: <FaTimesCircle />, text: "Rechazada" },
      cancelada: { bg: "secondary", icon: <FaBan />, text: "Cancelada" }
    };
    const { bg, icon, text } = config[estado] || config.pendiente;
    return (
      <Badge bg={bg} className="d-flex align-items-center gap-1">
        {icon} {text}
      </Badge>
    );
  };

  // Contar solicitudes por estado
  const contarPorEstado = (estado) => {
    return misSolicitudes.filter(s => s.estado === estado).length;
  };

  return (
    <Container fluid className="py-3">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-primary">
          <FaClipboardList className="me-2" />
          Inscripción a Cursos
        </h2>
        <p className="text-muted">Explora los cursos disponibles y solicita tu inscripción</p>
      </div>

      {/* Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white border-bottom">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link eventKey="cursos" className="px-4">
                  <FaBook className="me-2" />
                  Cursos Disponibles
                  {cursosDisponibles.length > 0 && (
                    <Badge bg="primary" className="ms-2">{cursosDisponibles.length}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="solicitudes" className="px-4">
                  <FaHourglassHalf className="me-2" />
                  Mis Solicitudes
                  {contarPorEstado("pendiente") > 0 && (
                    <Badge bg="warning" className="ms-2">{contarPorEstado("pendiente")}</Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body>
            <Tab.Content>
              {/* Tab de Cursos Disponibles */}
              <Tab.Pane eventKey="cursos">
                {/* Buscador */}
                <InputGroup className="mb-4">
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por nombre, código o docente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </InputGroup>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Cargando cursos...</p>
                  </div>
                ) : cursosFiltrados.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    <FaInfoCircle className="me-2" />
                    {busqueda 
                      ? "No se encontraron cursos con ese criterio de búsqueda"
                      : "No hay cursos disponibles para inscripción en este momento"}
                  </Alert>
                ) : (
                  <Row className="g-4">
                    {cursosFiltrados.map(curso => {
                      const dias = diasHastaInicio(curso.fechaInicio);
                      
                      return (
                        <Col md={6} lg={4} key={curso._id}>
                          <Card className="h-100 shadow-sm border-0 hover-shadow">
                            {curso.imagen && (
                              <Card.Img
                                variant="top"
                                src={curso.imagen}
                                style={{ height: "140px", objectFit: "cover" }}
                              />
                            )}
                            <Card.Body className="d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <Badge bg="secondary" className="text-uppercase">
                                  {curso.codigo}
                                </Badge>
                                {dias <= 7 && (
                                  <Badge bg="warning" text="dark">
                                    <FaClock className="me-1" />
                                    {dias === 1 ? "Mañana" : `En ${dias} días`}
                                  </Badge>
                                )}
                              </div>

                              <Card.Title className="h5 mb-2">{curso.titulo}</Card.Title>
                              
                              {curso.descripcion && (
                                <Card.Text className="text-muted small flex-grow-1">
                                  {curso.descripcion.length > 100 
                                    ? curso.descripcion.substring(0, 100) + "..."
                                    : curso.descripcion}
                                </Card.Text>
                              )}

                              <div className="mt-auto">
                                <div className="small text-muted mb-2">
                                  <div className="d-flex align-items-center mb-1">
                                    <FaChalkboardTeacher className="me-2 text-primary" />
                                    {curso.docente?.nombre || "Sin asignar"}
                                  </div>
                                  <div className="d-flex align-items-center mb-1">
                                    <FaCalendarAlt className="me-2 text-success" />
                                    Inicia: {formatearFecha(curso.fechaInicio)}
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <FaUsers className="me-2 text-info" />
                                    {curso.cupoDisponible !== null 
                                      ? `${curso.cupoDisponible} cupos disponibles`
                                      : "Sin límite de cupo"}
                                  </div>
                                </div>

                                {curso.yaSolicitado ? (
                                  <Button variant="outline-warning" disabled className="w-100">
                                    <FaHourglassHalf className="me-2" />
                                    Solicitud Pendiente
                                  </Button>
                                ) : (
                                  <Button
                                    variant="primary"
                                    className="w-100"
                                    onClick={() => handleAbrirModal(curso)}
                                  >
                                    <FaPaperPlane className="me-2" />
                                    Solicitar Inscripción
                                  </Button>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </Tab.Pane>

              {/* Tab de Mis Solicitudes */}
              <Tab.Pane eventKey="solicitudes">
                {/* Filtros */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <Button
                    variant={filtroEstado === "todos" ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => setFiltroEstado("todos")}
                  >
                    Todas ({misSolicitudes.length})
                  </Button>
                  <Button
                    variant={filtroEstado === "pendiente" ? "warning" : "outline-warning"}
                    size="sm"
                    onClick={() => setFiltroEstado("pendiente")}
                  >
                    <FaHourglassHalf className="me-1" />
                    Pendientes ({contarPorEstado("pendiente")})
                  </Button>
                  <Button
                    variant={filtroEstado === "aprobada" ? "success" : "outline-success"}
                    size="sm"
                    onClick={() => setFiltroEstado("aprobada")}
                  >
                    <FaCheckCircle className="me-1" />
                    Aprobadas ({contarPorEstado("aprobada")})
                  </Button>
                  <Button
                    variant={filtroEstado === "rechazada" ? "danger" : "outline-danger"}
                    size="sm"
                    onClick={() => setFiltroEstado("rechazada")}
                  >
                    <FaTimesCircle className="me-1" />
                    Rechazadas ({contarPorEstado("rechazada")})
                  </Button>
                </div>

                {loadingSolicitudes ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : solicitudesFiltradas.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    <FaInfoCircle className="me-2" />
                    {filtroEstado === "todos"
                      ? "No tienes solicitudes de inscripción"
                      : `No tienes solicitudes ${filtroEstado}s`}
                  </Alert>
                ) : (
                  <Row className="g-3">
                    {solicitudesFiltradas.map(solicitud => (
                      <Col md={6} lg={4} key={solicitud._id}>
                        <Card className={`h-100 border-start border-4 border-${
                          solicitud.estado === "aprobada" ? "success" :
                          solicitud.estado === "rechazada" ? "danger" :
                          solicitud.estado === "pendiente" ? "warning" : "secondary"
                        }`}>
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Badge bg="secondary">{solicitud.curso?.codigo}</Badge>
                              {getBadgeEstado(solicitud.estado)}
                            </div>

                            <h6 className="fw-bold mb-2">{solicitud.curso?.titulo}</h6>

                            <div className="small text-muted mb-3">
                              <div>
                                <FaCalendarAlt className="me-2" />
                                Solicitado: {formatearFecha(solicitud.fechaSolicitud)}
                              </div>
                              {solicitud.fechaProcesamiento && (
                                <div>
                                  <FaCheckCircle className="me-2" />
                                  Procesado: {formatearFecha(solicitud.fechaProcesamiento)}
                                </div>
                              )}
                              {solicitud.curso?.fechaInicio && (
                                <div>
                                  <FaBook className="me-2" />
                                  Inicia: {formatearFecha(solicitud.curso.fechaInicio)}
                                </div>
                              )}
                            </div>

                            {solicitud.mensaje && (
                              <div className="bg-light p-2 rounded small mb-3">
                                <strong>Tu mensaje:</strong> {solicitud.mensaje}
                              </div>
                            )}

                            {solicitud.estado === "rechazada" && solicitud.motivoRechazo && (
                              <Alert variant="danger" className="small py-2 mb-3">
                                <strong>Motivo:</strong> {solicitud.motivoRechazo}
                              </Alert>
                            )}

                            {solicitud.estado === "pendiente" && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="w-100"
                                onClick={() => handleCancelarSolicitud(solicitud._id)}
                              >
                                <FaBan className="me-2" />
                                Cancelar Solicitud
                              </Button>
                            )}

                            {solicitud.estado === "aprobada" && (
                              <Button
                                variant="success"
                                size="sm"
                                className="w-100"
                                href={`/dashboard/cursos/${solicitud.curso?._id}`}
                              >
                                <FaBook className="me-2" />
                                Ir al Curso
                              </Button>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>

      {/* Modal de Solicitud */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Solicitar Inscripción</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cursoSeleccionado && (
            <>
              <div className="bg-light p-3 rounded mb-3">
                <h5 className="mb-1">{cursoSeleccionado.titulo}</h5>
                <small className="text-muted">
                  <Badge bg="secondary" className="me-2">{cursoSeleccionado.codigo}</Badge>
                  Docente: {cursoSeleccionado.docente?.nombre}
                </small>
              </div>

              <div className="mb-3">
                <Row>
                  <Col xs={6}>
                    <small className="text-muted">Fecha de inicio</small>
                    <div className="fw-bold">{formatearFecha(cursoSeleccionado.fechaInicio)}</div>
                  </Col>
                  <Col xs={6}>
                    <small className="text-muted">Cupo disponible</small>
                    <div className="fw-bold">
                      {cursoSeleccionado.cupoDisponible !== null 
                        ? `${cursoSeleccionado.cupoDisponible} lugares`
                        : "Sin límite"}
                    </div>
                  </Col>
                </Row>
              </div>

              <Form.Group>
                <Form.Label>Mensaje (opcional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Puedes agregar un mensaje para el administrador..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  maxLength={500}
                />
                <Form.Text className="text-muted">
                  {mensaje.length}/500 caracteres
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleEnviarSolicitud}
            disabled={enviando}
          >
            {enviando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Enviando...
              </>
            ) : (
              <>
                <FaPaperPlane className="me-2" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Estilos */}
      <style>{`
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-2px);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </Container>
  );
};

export default SolicitarInscripcion;