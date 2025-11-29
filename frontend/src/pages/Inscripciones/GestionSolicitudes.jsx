// frontend/src/pages/Inscripciones/GestionSolicitudes.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Table,
  Button,
  Spinner,
  Badge,
  Form,
  Modal,
  InputGroup,
  Pagination,
  Alert,
  Dropdown
} from "react-bootstrap";
import {
  FaClipboardList,
  FaSearch,
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter,
  FaCheckDouble,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaBook,
  FaCalendarAlt,
  FaEnvelope,
  FaIdCard,
  FaExclamationTriangle,
  FaSyncAlt
} from "react-icons/fa";
import API from "../../services/api";
import { toast } from "react-toastify";

const GestionSolicitudes = () => {
  // Estados principales
  const [solicitudes, setSolicitudes] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [paginas, setPaginas] = useState(1);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [busqueda, setBusqueda] = useState("");

  // Selección múltiple
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [procesandoMultiples, setProcesandoMultiples] = useState(false);

  // Modal de detalle
  const [showModalDetalle, setShowModalDetalle] = useState(false);
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);

  // Modal de rechazo
  const [showModalRechazo, setShowModalRechazo] = useState(false);
  const [solicitudRechazo, setSolicitudRechazo] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarResumen();
  }, []);

  useEffect(() => {
    cargarSolicitudes();
    setSeleccionados(new Set());
  }, [filtroEstado, pagina]);

  const cargarResumen = async () => {
    try {
      const { data } = await API.get("/solicitudes-inscripcion/resumen");
      setResumen(data);
    } catch (error) {
      console.error("Error al cargar resumen:", error);
    }
  };

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        estado: filtroEstado === "todas" ? "" : filtroEstado,
        page: pagina,
        limit: 15
      });

      const { data } = await API.get(`/solicitudes-inscripcion/todas?${params}`);
      setSolicitudes(data.solicitudes);
      setTotal(data.total);
      setPaginas(data.paginas);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      toast.error("Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  // Aprobar solicitud individual
  const handleAprobar = async (solicitudId) => {
    try {
      setProcesando(true);
      await API.put(`/solicitudes-inscripcion/aprobar/${solicitudId}`);
      toast.success("Solicitud aprobada correctamente");
      cargarSolicitudes();
      cargarResumen();
      setShowModalDetalle(false);
    } catch (error) {
      console.error("Error al aprobar:", error);
      toast.error(error.response?.data?.msg || "Error al aprobar solicitud");
    } finally {
      setProcesando(false);
    }
  };

  // Abrir modal de rechazo
  const handleAbrirRechazo = (solicitud) => {
    setSolicitudRechazo(solicitud);
    setMotivoRechazo("");
    setShowModalRechazo(true);
    setShowModalDetalle(false);
  };

  // Rechazar solicitud
  const handleRechazar = async () => {
    if (!motivoRechazo.trim() || motivoRechazo.trim().length < 5) {
      toast.error("El motivo debe tener al menos 5 caracteres");
      return;
    }

    try {
      setProcesando(true);
      await API.put(`/solicitudes-inscripcion/rechazar/${solicitudRechazo._id}`, {
        motivoRechazo: motivoRechazo.trim()
      });
      toast.success("Solicitud rechazada correctamente");
      setShowModalRechazo(false);
      cargarSolicitudes();
      cargarResumen();
    } catch (error) {
      console.error("Error al rechazar:", error);
      toast.error(error.response?.data?.msg || "Error al rechazar solicitud");
    } finally {
      setProcesando(false);
    }
  };

  // Aprobar múltiples
  const handleAprobarMultiples = async () => {
    if (seleccionados.size === 0) {
      toast.warning("Selecciona al menos una solicitud");
      return;
    }

    if (!window.confirm(`¿Aprobar ${seleccionados.size} solicitudes seleccionadas?`)) return;

    try {
      setProcesandoMultiples(true);
      const { data } = await API.put("/solicitudes-inscripcion/aprobar-multiples", {
        solicitudIds: Array.from(seleccionados)
      });
      
      toast.success(data.msg);
      setSeleccionados(new Set());
      cargarSolicitudes();
      cargarResumen();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar solicitudes");
    } finally {
      setProcesandoMultiples(false);
    }
  };

  // Toggle selección
  const toggleSeleccion = (id) => {
    const nuevaSeleccion = new Set(seleccionados);
    if (nuevaSeleccion.has(id)) {
      nuevaSeleccion.delete(id);
    } else {
      nuevaSeleccion.add(id);
    }
    setSeleccionados(nuevaSeleccion);
  };

  // Seleccionar todos
  const toggleSeleccionarTodos = () => {
    if (seleccionados.size === solicitudes.filter(s => s.estado === "pendiente").length) {
      setSeleccionados(new Set());
    } else {
      const pendientes = solicitudes
        .filter(s => s.estado === "pendiente")
        .map(s => s._id);
      setSeleccionados(new Set(pendientes));
    }
  };

  // Ver detalle
  const handleVerDetalle = (solicitud) => {
    setSolicitudDetalle(solicitud);
    setShowModalDetalle(true);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Badge de estado
  const getBadgeEstado = (estado) => {
    const config = {
      pendiente: { bg: "warning", text: "Pendiente" },
      aprobada: { bg: "success", text: "Aprobada" },
      rechazada: { bg: "danger", text: "Rechazada" },
      cancelada: { bg: "secondary", text: "Cancelada" }
    };
    const { bg, text } = config[estado] || config.pendiente;
    return <Badge bg={bg}>{text}</Badge>;
  };

  // Filtrar solicitudes por búsqueda
  const solicitudesFiltradas = solicitudes.filter(sol => {
    if (!busqueda) return true;
    const termino = busqueda.toLowerCase();
    return (
      sol.alumno?.nombre?.toLowerCase().includes(termino) ||
      sol.alumno?.email?.toLowerCase().includes(termino) ||
      sol.alumno?.legajo?.toLowerCase().includes(termino) ||
      sol.curso?.titulo?.toLowerCase().includes(termino) ||
      sol.curso?.codigo?.toLowerCase().includes(termino)
    );
  });

  return (
    <Container fluid className="py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">
            <FaClipboardList className="me-2" />
            Solicitudes de Inscripción
          </h2>
          <p className="text-muted mb-0">Gestiona las solicitudes de los alumnos</p>
        </div>
        <Button variant="outline-primary" onClick={() => { cargarSolicitudes(); cargarResumen(); }}>
          <FaSyncAlt className="me-2" />
          Actualizar
        </Button>
      </div>

      {/* Resumen */}
      {resumen && (
        <Row className="g-3 mb-4">
          <Col sm={6} md={3}>
            <Card 
              className={`border-0 shadow-sm cursor-pointer ${filtroEstado === "pendiente" ? "border-warning border-2" : ""}`}
              onClick={() => { setFiltroEstado("pendiente"); setPagina(1); }}
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="text-center">
                <FaHourglassHalf className="text-warning mb-2" size={24} />
                <h3 className="mb-0 text-warning">{resumen.pendientes}</h3>
                <small className="text-muted">Pendientes</small>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} md={3}>
            <Card 
              className={`border-0 shadow-sm ${filtroEstado === "aprobada" ? "border-success border-2" : ""}`}
              onClick={() => { setFiltroEstado("aprobada"); setPagina(1); }}
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="text-center">
                <FaCheckCircle className="text-success mb-2" size={24} />
                <h3 className="mb-0 text-success">{resumen.aprobadas}</h3>
                <small className="text-muted">Aprobadas</small>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} md={3}>
            <Card 
              className={`border-0 shadow-sm ${filtroEstado === "rechazada" ? "border-danger border-2" : ""}`}
              onClick={() => { setFiltroEstado("rechazada"); setPagina(1); }}
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="text-center">
                <FaTimesCircle className="text-danger mb-2" size={24} />
                <h3 className="mb-0 text-danger">{resumen.rechazadas}</h3>
                <small className="text-muted">Rechazadas</small>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={6} md={3}>
            <Card 
              className={`border-0 shadow-sm ${filtroEstado === "todas" ? "border-primary border-2" : ""}`}
              onClick={() => { setFiltroEstado("todas"); setPagina(1); }}
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="text-center">
                <FaClipboardList className="text-primary mb-2" size={24} />
                <h3 className="mb-0 text-primary">{resumen.pendientes + resumen.aprobadas + resumen.rechazadas}</h3>
                <small className="text-muted">Total</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabla de Solicitudes */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white py-3">
          <Row className="align-items-center g-2">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por alumno, email, legajo o curso..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-md-end">
              {filtroEstado === "pendiente" && seleccionados.size > 0 && (
                <Button
                  variant="success"
                  onClick={handleAprobarMultiples}
                  disabled={procesandoMultiples}
                  className="me-2"
                >
                  {procesandoMultiples ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <FaCheckDouble className="me-2" />
                  )}
                  Aprobar Seleccionados ({seleccionados.size})
                </Button>
              )}
              <Badge bg="secondary" className="py-2 px-3">
                {total} solicitudes
              </Badge>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando solicitudes...</p>
            </div>
          ) : solicitudesFiltradas.length === 0 ? (
            <Alert variant="info" className="m-4 text-center">
              <FaClipboardList className="me-2" />
              No hay solicitudes {filtroEstado !== "todas" ? filtroEstado + "s" : ""} para mostrar
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    {filtroEstado === "pendiente" && (
                      <th style={{ width: "40px" }}>
                        <Form.Check
                          type="checkbox"
                          checked={seleccionados.size === solicitudesFiltradas.filter(s => s.estado === "pendiente").length && seleccionados.size > 0}
                          onChange={toggleSeleccionarTodos}
                        />
                      </th>
                    )}
                    <th>Alumno</th>
                    <th>Curso</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Cupo</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map(solicitud => (
                    <tr key={solicitud._id}>
                      {filtroEstado === "pendiente" && (
                        <td>
                          {solicitud.estado === "pendiente" && (
                            <Form.Check
                              type="checkbox"
                              checked={seleccionados.has(solicitud._id)}
                              onChange={() => toggleSeleccion(solicitud._id)}
                            />
                          )}
                        </td>
                      )}
                      <td>
                        <div className="d-flex align-items-center">
                          {solicitud.alumno?.imagen ? (
                            <img
                              src={solicitud.alumno.imagen}
                              alt=""
                              className="rounded-circle me-2"
                              style={{ width: "36px", height: "36px", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                              style={{ width: "36px", height: "36px", fontSize: "0.8rem" }}
                            >
                              {solicitud.alumno?.nombre?.charAt(0) || "?"}
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold">{solicitud.alumno?.nombre}</div>
                            <small className="text-muted">{solicitud.alumno?.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <Badge bg="secondary" className="me-2">{solicitud.curso?.codigo}</Badge>
                          {solicitud.curso?.titulo}
                        </div>
                      </td>
                      <td>
                        <small>{formatearFecha(solicitud.fechaSolicitud)}</small>
                      </td>
                      <td>{getBadgeEstado(solicitud.estado)}</td>
                      <td>
                        <small>
                          {solicitud.curso?.cupoDisponible !== undefined 
                            ? `${solicitud.curso.inscritos}/${solicitud.curso.cupoMaximo || "∞"}`
                            : "-"}
                        </small>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleVerDetalle(solicitud)}
                          title="Ver detalle"
                        >
                          <FaEye />
                        </Button>
                        {solicitud.estado === "pendiente" && (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-1"
                              onClick={() => handleAprobar(solicitud._id)}
                              title="Aprobar"
                            >
                              <FaCheck />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleAbrirRechazo(solicitud)}
                              title="Rechazar"
                            >
                              <FaTimes />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        {/* Paginación */}
        {paginas > 1 && (
          <Card.Footer className="bg-white d-flex justify-content-center">
            <Pagination className="mb-0">
              <Pagination.First onClick={() => setPagina(1)} disabled={pagina === 1} />
              <Pagination.Prev onClick={() => setPagina(p => p - 1)} disabled={pagina === 1} />
              
              {[...Array(paginas)].map((_, i) => {
                const num = i + 1;
                if (num === 1 || num === paginas || (num >= pagina - 1 && num <= pagina + 1)) {
                  return (
                    <Pagination.Item
                      key={num}
                      active={pagina === num}
                      onClick={() => setPagina(num)}
                    >
                      {num}
                    </Pagination.Item>
                  );
                }
                if (num === pagina - 2 || num === pagina + 2) {
                  return <Pagination.Ellipsis key={num} />;
                }
                return null;
              })}

              <Pagination.Next onClick={() => setPagina(p => p + 1)} disabled={pagina === paginas} />
              <Pagination.Last onClick={() => setPagina(paginas)} disabled={pagina === paginas} />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Modal de Detalle */}
      <Modal show={showModalDetalle} onHide={() => setShowModalDetalle(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalle de Solicitud</Modal.Title>
        </Modal.Header>
        {solicitudDetalle && (
          <Modal.Body>
            <Row className="g-4">
              {/* Info del Alumno */}
              <Col md={6}>
                <Card className="h-100 border">
                  <Card.Header className="bg-light">
                    <FaUser className="me-2" />
                    Información del Alumno
                  </Card.Header>
                  <Card.Body>
                    <div className="text-center mb-3">
                      {solicitudDetalle.alumno?.imagen ? (
                        <img
                          src={solicitudDetalle.alumno.imagen}
                          alt=""
                          className="rounded-circle"
                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                          style={{ width: "80px", height: "80px", fontSize: "2rem" }}
                        >
                          {solicitudDetalle.alumno?.nombre?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h5 className="text-center mb-3">{solicitudDetalle.alumno?.nombre}</h5>
                    <div className="small">
                      <div className="d-flex align-items-center mb-2">
                        <FaEnvelope className="text-muted me-2" />
                        {solicitudDetalle.alumno?.email}
                      </div>
                      {solicitudDetalle.alumno?.legajo && (
                        <div className="d-flex align-items-center">
                          <FaIdCard className="text-muted me-2" />
                          Legajo: {solicitudDetalle.alumno.legajo}
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Info del Curso */}
              <Col md={6}>
                <Card className="h-100 border">
                  <Card.Header className="bg-light">
                    <FaBook className="me-2" />
                    Información del Curso
                  </Card.Header>
                  <Card.Body>
                    <h5 className="mb-1">{solicitudDetalle.curso?.titulo}</h5>
                    <Badge bg="secondary" className="mb-3">{solicitudDetalle.curso?.codigo}</Badge>
                    <div className="small">
                      <div className="d-flex align-items-center mb-2">
                        <FaCalendarAlt className="text-muted me-2" />
                        Inicio: {formatearFecha(solicitudDetalle.curso?.fechaInicio)}
                      </div>
                      <div className="d-flex align-items-center">
                        <FaUser className="text-muted me-2" />
                        Inscritos: {solicitudDetalle.curso?.inscritos || 0} / {solicitudDetalle.curso?.cupoMaximo || "∞"}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Info de la Solicitud */}
              <Col xs={12}>
                <Card className="border">
                  <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <span>
                      <FaClipboardList className="me-2" />
                      Datos de la Solicitud
                    </span>
                    {getBadgeEstado(solicitudDetalle.estado)}
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <small className="text-muted">Fecha de solicitud</small>
                        <div>{formatearFecha(solicitudDetalle.fechaSolicitud)}</div>
                      </Col>
                      {solicitudDetalle.fechaProcesamiento && (
                        <Col md={6}>
                          <small className="text-muted">Fecha de procesamiento</small>
                          <div>{formatearFecha(solicitudDetalle.fechaProcesamiento)}</div>
                        </Col>
                      )}
                    </Row>
                    
                    {solicitudDetalle.mensaje && (
                      <div className="mt-3">
                        <small className="text-muted">Mensaje del alumno</small>
                        <div className="bg-light p-2 rounded">{solicitudDetalle.mensaje}</div>
                      </div>
                    )}

                    {solicitudDetalle.estado === "rechazada" && solicitudDetalle.motivoRechazo && (
                      <Alert variant="danger" className="mt-3 mb-0">
                        <strong>Motivo de rechazo:</strong> {solicitudDetalle.motivoRechazo}
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDetalle(false)}>
            Cerrar
          </Button>
          {solicitudDetalle?.estado === "pendiente" && (
            <>
              <Button
                variant="danger"
                onClick={() => handleAbrirRechazo(solicitudDetalle)}
              >
                <FaTimes className="me-2" />
                Rechazar
              </Button>
              <Button
                variant="success"
                onClick={() => handleAprobar(solicitudDetalle._id)}
                disabled={procesando}
              >
                {procesando ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaCheck className="me-2" />
                )}
                Aprobar
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal de Rechazo */}
      <Modal show={showModalRechazo} onHide={() => setShowModalRechazo(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FaExclamationTriangle className="me-2" />
            Rechazar Solicitud
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {solicitudRechazo && (
            <>
              <div className="mb-3 p-3 bg-light rounded">
                <strong>Alumno:</strong> {solicitudRechazo.alumno?.nombre}<br />
                <strong>Curso:</strong> {solicitudRechazo.curso?.titulo}
              </div>
              
              <Form.Group>
                <Form.Label>Motivo del rechazo <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Explica al alumno por qué se rechaza su solicitud..."
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  isInvalid={motivoRechazo.length > 0 && motivoRechazo.length < 5}
                />
                <Form.Control.Feedback type="invalid">
                  El motivo debe tener al menos 5 caracteres
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Este mensaje será enviado al alumno como notificación
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalRechazo(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleRechazar}
            disabled={procesando || motivoRechazo.trim().length < 5}
          >
            {procesando ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <FaTimes className="me-2" />
            )}
            Confirmar Rechazo
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GestionSolicitudes;