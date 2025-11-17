// frontend/src/pages/Tareas/CalificarEntrega.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Alert,
  Spinner,
  ListGroup,
  Tabs,
  Tab
} from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { obtenerTarea } from "../../services/tareaService";
import {
  obtenerEntregasPorTarea,
  calificarEntrega,
  devolverEntrega
} from "../../services/entregaService";

const CalificarEntrega = () => {
  const { id: tareaId } = useParams();
  const navigate = useNavigate();

  const [tarea, setTarea] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [alumnosSinEntregar, setAlumnosSinEntregar] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Modal de calificación
  const [showModal, setShowModal] = useState(false);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
  const [calificacion, setCalificacion] = useState("");
  const [comentario, setComentario] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Tabs
  const [tabActiva, setTabActiva] = useState("entregadas");

  useEffect(() => {
    cargarDatos();
  }, [tareaId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [tareaData, entregasData] = await Promise.all([
        obtenerTarea(tareaId),
        obtenerEntregasPorTarea(tareaId)
      ]);

      console.log("📊 Datos de tarea:", tareaData);
      console.log("📊 Datos de entregas:", entregasData);

      setTarea(tareaData);
      setEntregas(entregasData.entregas || []);
      setAlumnosSinEntregar(entregasData.alumnosSinEntregar || []);
      setEstadisticas(entregasData.estadisticas || {});
    } catch (err) {
      console.error("❌ Error al cargar datos:", err);
      setError(err.response?.data?.msg || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCalificacion = (entrega) => {
    setEntregaSeleccionada(entrega);
    setCalificacion(entrega.calificacion || "");
    setComentario(entrega.comentarioDocente || "");
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEntregaSeleccionada(null);
    setCalificacion("");
    setComentario("");
  };

  const handleCalificar = async (e) => {
    e.preventDefault();
    setProcesando(true);

    try {
      const formData = new FormData();
      formData.append("calificacion", calificacion);
      formData.append("comentarioDocente", comentario);

      await calificarEntrega(entregaSeleccionada._id, formData);

      setMensaje({
        tipo: "success",
        texto: "Entrega calificada correctamente"
      });

      cerrarModal();
      cargarDatos();
    } catch (err) {
      console.error("❌ Error al calificar:", err);
      setMensaje({
        tipo: "danger",
        texto: err.response?.data?.msg || "Error al calificar"
      });
    } finally {
      setProcesando(false);
    }
  };

  const handleDevolver = async (entregaId) => {
    const motivo = prompt("Escribe el motivo por el cual devuelves esta entrega:");
    if (!motivo) return;

    try {
      await devolverEntrega(entregaId, motivo);
      setMensaje({
        tipo: "success",
        texto: "Entrega devuelta al alumno"
      });
      cargarDatos();
    } catch (err) {
      setMensaje({
        tipo: "danger",
        texto: err.response?.data?.msg || "Error al devolver entrega"
      });
    }
  };

  const obtenerBadgeEstado = (estado) => {
    switch (estado) {
      case "entregada":
        return <Badge bg="info">📤 Entregada</Badge>;
      case "calificada":
        return <Badge bg="success">✅ Calificada</Badge>;
      case "devuelta":
        return <Badge bg="warning">🔄 Devuelta</Badge>;
      default:
        return <Badge bg="secondary">⏳ Pendiente</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando entregas...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h5>Error</h5>
          <p>{error}</p>
          <Link to="/dashboard/tareas">
            <Button variant="danger">Volver a Tareas</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2>📝 Calificar Entregas</h2>
              <h4 className="text-muted">{tarea?.titulo}</h4>
              <p className="text-muted mb-0">
                📚 {tarea?.curso?.titulo || tarea?.curso?.nombre}
              </p>
            </div>
            <Link to={`/dashboard/tareas/${tareaId}`}>
              <Button variant="secondary">← Volver</Button>
            </Link>
          </div>
        </Col>
      </Row>

      {/* Mensajes */}
      {mensaje && (
        <Alert
          variant={mensaje.tipo}
          dismissible
          onClose={() => setMensaje(null)}
        >
          {mensaje.texto}
        </Alert>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3>{estadisticas.total || 0}</h3>
                <p className="text-muted mb-0">Total Inscritos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-info">
              <Card.Body>
                <h3 className="text-info">{estadisticas.entregadas || 0}</h3>
                <p className="text-muted mb-0">Entregadas</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-success">
              <Card.Body>
                <h3 className="text-success">{estadisticas.calificadas || 0}</h3>
                <p className="text-muted mb-0">Calificadas</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-warning">
              <Card.Body>
                <h3 className="text-warning">{estadisticas.sinEntregar || 0}</h3>
                <p className="text-muted mb-0">Sin Entregar</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs */}
      <Tabs
        activeKey={tabActiva}
        onSelect={(k) => setTabActiva(k)}
        className="mb-4"
      >
        {/* Tab: Entregadas */}
        <Tab
          eventKey="entregadas"
          title={`📤 Entregadas (${entregas.filter(e => e.estado === "entregada").length})`}
        >
          <Card>
            <Card.Body>
              {entregas.filter(e => e.estado === "entregada").length === 0 ? (
                <Alert variant="info">
                  No hay entregas pendientes de calificación
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Fecha Entrega</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregas
                      .filter(e => e.estado === "entregada")
                      .map((entrega) => (
                        <tr key={entrega._id}>
                          <td>
                            <strong>{entrega.alumno?.nombre}</strong>
                            <br />
                            <small className="text-muted">
                              {entrega.alumno?.email}
                            </small>
                          </td>
                          <td>
                            {new Date(entrega.fechaEntrega).toLocaleString()}
                            {entrega.entregadaTarde && (
                              <>
                                <br />
                                <Badge bg="warning">⚠️ Tardía</Badge>
                              </>
                            )}
                          </td>
                          <td>{obtenerBadgeEstado(entrega.estado)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => abrirModalCalificacion(entrega)}
                              >
                                ✅ Calificar
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleDevolver(entrega._id)}
                              >
                                🔄 Devolver
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Tab: Calificadas */}
        <Tab
          eventKey="calificadas"
          title={`✅ Calificadas (${entregas.filter(e => e.estado === "calificada").length})`}
        >
          <Card>
            <Card.Body>
              {entregas.filter(e => e.estado === "calificada").length === 0 ? (
                <Alert variant="info">
                  No hay entregas calificadas todavía
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Fecha Entrega</th>
                      <th>Calificación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregas
                      .filter(e => e.estado === "calificada")
                      .map((entrega) => (
                        <tr key={entrega._id}>
                          <td>
                            <strong>{entrega.alumno?.nombre}</strong>
                            <br />
                            <small className="text-muted">
                              {entrega.alumno?.email}
                            </small>
                          </td>
                          <td>
                            {new Date(entrega.fechaEntrega).toLocaleString()}
                            {entrega.entregadaTarde && (
                              <>
                                <br />
                                <Badge bg="warning">⚠️ Tardía</Badge>
                              </>
                            )}
                          </td>
                          <td>
                            <Badge bg="success" style={{ fontSize: "1.1em" }}>
                              {entrega.calificacion} / {tarea?.puntajeMaximo}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => abrirModalCalificacion(entrega)}
                            >
                              👁️ Ver / Editar
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Tab: Sin Entregar */}
        <Tab
          eventKey="sinEntregar"
          title={`⚠️ Sin Entregar (${alumnosSinEntregar.length})`}
        >
          <Card>
            <Card.Body>
              {alumnosSinEntregar.length === 0 ? (
                <Alert variant="success">
                  ¡Todos los alumnos han entregado! 🎉
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnosSinEntregar.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{item.alumno?.nombre}</strong>
                          <br />
                          <small className="text-muted">
                            {item.alumno?.email}
                          </small>
                        </td>
                        <td>
                          <Badge bg="warning">⚠️ Sin entregar</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Tab: Todas */}
        <Tab eventKey="todas" title={`📚 Todas (${entregas.length})`}>
          <Card>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Fecha Entrega</th>
                    <th>Estado</th>
                    <th>Calificación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {entregas.map((entrega) => (
                    <tr key={entrega._id}>
                      <td>
                        <strong>{entrega.alumno?.nombre}</strong>
                        <br />
                        <small className="text-muted">
                          {entrega.alumno?.email}
                        </small>
                      </td>
                      <td>
                        {entrega.fechaEntrega
                          ? new Date(entrega.fechaEntrega).toLocaleString()
                          : "-"}
                        {entrega.entregadaTarde && (
                          <>
                            <br />
                            <Badge bg="warning">⚠️ Tardía</Badge>
                          </>
                        )}
                      </td>
                      <td>{obtenerBadgeEstado(entrega.estado)}</td>
                      <td>
                        {entrega.calificacion !== null &&
                        entrega.calificacion !== undefined ? (
                          <Badge bg="success">
                            {entrega.calificacion} / {tarea?.puntajeMaximo}
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {entrega.estado === "entregada" ? (
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => abrirModalCalificacion(entrega)}
                            >
                              ✅ Calificar
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleDevolver(entrega._id)}
                            >
                              🔄 Devolver
                            </Button>
                          </div>
                        ) : entrega.estado === "calificada" ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => abrirModalCalificacion(entrega)}
                          >
                            👁️ Ver / Editar
                          </Button>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Modal de Calificación */}
      <Modal show={showModal} onHide={cerrarModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            📝 Calificar Entrega - {entregaSeleccionada?.alumno?.nombre}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {entregaSeleccionada && (
            <>
              {/* Info de la entrega */}
              <Card className="mb-3">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p className="mb-1">
                        <strong>Fecha de entrega:</strong>{" "}
                        {new Date(
                          entregaSeleccionada.fechaEntrega
                        ).toLocaleString()}
                      </p>
                      <p className="mb-1">
                        <strong>Estado:</strong>{" "}
                        {obtenerBadgeEstado(entregaSeleccionada.estado)}
                      </p>
                    </Col>
                    <Col md={6}>
                      {entregaSeleccionada.entregadaTarde && (
                        <Alert variant="warning" className="mb-0">
                          <strong>⚠️ Entrega tardía</strong>
                          <br />
                          Se aplicará {tarea?.penalizacionTarde}% de penalización
                        </Alert>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Comentario del alumno */}
              {entregaSeleccionada.comentarioAlumno && (
                <Card className="mb-3">
                  <Card.Header>💬 Comentario del Alumno</Card.Header>
                  <Card.Body>
                    <p className="mb-0">
                      {entregaSeleccionada.comentarioAlumno}
                    </p>
                  </Card.Body>
                </Card>
              )}

              {/* Archivos entregados */}
              {entregaSeleccionada.archivosEntregados &&
                entregaSeleccionada.archivosEntregados.length > 0 && (
                  <Card className="mb-3">
                    <Card.Header>📎 Archivos Entregados</Card.Header>
                    <ListGroup variant="flush">
                      {entregaSeleccionada.archivosEntregados.map(
                        (archivo, index) => (
                          <ListGroup.Item key={index}>
                            <a
                              href={`${import.meta.env.VITE_API_URL}/${archivo.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              📄 {archivo.nombre}
                            </a>
                            <span className="text-muted small ms-2">
                              ({(archivo.tamano / 1024).toFixed(1)} KB)
                            </span>
                          </ListGroup.Item>
                        )
                      )}
                    </ListGroup>
                  </Card>
                )}

              {/* Formulario de calificación */}
              <Form onSubmit={handleCalificar}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Calificación (máx: {tarea?.puntajeMaximo})</strong>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max={tarea?.puntajeMaximo}
                    step="0.1"
                    value={calificacion}
                    onChange={(e) => setCalificacion(e.target.value)}
                    required
                    placeholder={`0 - ${tarea?.puntajeMaximo}`}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <strong>Comentario / Retroalimentación</strong>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Escribe tu comentario para el alumno..."
                  />
                </Form.Group>

                <div className="d-flex gap-2 justify-content-end">
                  <Button variant="secondary" onClick={cerrarModal}>
                    Cancelar
                  </Button>
                  <Button
                    variant="success"
                    type="submit"
                    disabled={procesando}
                  >
                    {procesando ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      "✅ Guardar Calificación"
                    )}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CalificarEntrega;