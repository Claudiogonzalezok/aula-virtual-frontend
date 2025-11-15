// frontend/src/pages/tareas/CalificarEntrega.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Modal, Form, ListGroup, Tabs, Tab } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { obtenerTarea } from "../../services/tareaService";
import { obtenerEntregasPorTarea, calificarEntrega, devolverEntrega, exportarCalificaciones } from "../../services/entregaService";

const CalificarEntregas = () => {
  const { id } = useParams(); // ID de la tarea
  
  const [tarea, setTarea] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [alumnosSinEntregar, setAlumnosSinEntregar] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de calificación
  const [showModal, setShowModal] = useState(false);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
  const [calificacion, setCalificacion] = useState("");
  const [comentarioDocente, setComentarioDocente] = useState("");
  const [archivosDevolucion, setArchivosDevolucion] = useState([]);
  const [calificandoRubrica, setCalificandoRubrica] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todas");

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [tareaData, entregasData] = await Promise.all([
        obtenerTarea(id),
        obtenerEntregasPorTarea(id)
      ]);

      setTarea(tareaData);
      setEntregas(entregasData.entregas || []);
      setAlumnosSinEntregar(entregasData.alumnosSinEntregar || []);
      setEstadisticas(entregasData.estadisticas);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al cargar entregas");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCalificar = (entrega) => {
    setEntregaSeleccionada(entrega);
    setCalificacion(entrega.calificacion || "");
    setComentarioDocente(entrega.comentarioDocente || "");
    setArchivosDevolucion([]);
    
    // Inicializar calificación por rúbrica si existe
    if (tarea.rubrica && tarea.rubrica.length > 0) {
      const rubricaInicial = tarea.rubrica.map((criterio, index) => ({
        criterio: criterio.criterio,
        puntajeMaximo: criterio.puntajeMaximo,
        puntajeObtenido: entrega.calificacionRubrica?.[index]?.puntajeObtenido || 0
      }));
      setCalificandoRubrica(rubricaInicial);
    }
    
    setShowModal(true);
  };

  const handleGuardarCalificacion = async () => {
    try {
      setGuardando(true);

      const formData = new FormData();
      formData.append("calificacion", calificacion);
      formData.append("comentarioDocente", comentarioDocente);

      if (calificandoRubrica.length > 0) {
        formData.append("calificacionRubrica", JSON.stringify(calificandoRubrica));
      }

      archivosDevolucion.forEach(archivo => {
        formData.append("archivosDevolucion", archivo);
      });

      await calificarEntrega(entregaSeleccionada._id, formData);
      
      setShowModal(false);
      cargarDatos(); // Recargar para ver cambios
    } catch (err) {
      alert(err.response?.data?.msg || "Error al calificar entrega");
    } finally {
      setGuardando(false);
    }
  };

  const handleDevolver = async (entregaId) => {
    const comentario = prompt("Escribe un comentario explicando por qué se devuelve la entrega:");
    if (!comentario) return;

    try {
      await devolverEntrega(entregaId, comentario);
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.msg || "Error al devolver entrega");
    }
  };

  const handleExportar = async () => {
    try {
      const data = await exportarCalificaciones(id);
      
      // Convertir a CSV
      const csv = data.datos.map(row => 
        Array.isArray(row) ? row.join(",") : Object.values(row).join(",")
      ).join("\n");

      // Descargar
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.nombreArchivo;
      a.click();
    } catch (err) {
      alert(err.response?.data?.msg || "Error al exportar");
    }
  };

  const actualizarRubrica = (index, puntaje) => {
    const nuevaRubrica = [...calificandoRubrica];
    nuevaRubrica[index].puntajeObtenido = Number(puntaje);
    setCalificandoRubrica(nuevaRubrica);

    // Calcular calificación total automáticamente
    const total = nuevaRubrica.reduce((sum, item) => sum + item.puntajeObtenido, 0);
    setCalificacion(total);
  };

  const obtenerBadgeEstado = (estado) => {
    const badges = {
      pendiente: { bg: "secondary", text: "⏳ Pendiente" },
      entregada: { bg: "info", text: "📤 Entregada" },
      calificada: { bg: "success", text: "✅ Calificada" },
      devuelta: { bg: "danger", text: "🔄 Devuelta" }
    };
    return badges[estado] || badges.pendiente;
  };

  const entregasFiltradas = entregas.filter(e => {
    if (filtroEstado === "todas") return true;
    return e.estado === filtroEstado;
  });

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
              <p className="text-muted mb-2">{tarea.titulo}</p>
              <p className="text-muted small">
                📚 {tarea.curso?.nombre} • 📊 Puntaje máximo: {tarea.puntajeMaximo} pts
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-success" onClick={handleExportar}>
                📊 Exportar Calificaciones
              </Button>
              <Link to={`/dashboard/tareas/${id}`}>
                <Button variant="outline-secondary">← Volver</Button>
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      {/* Estadísticas */}
      {estadisticas && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3>{estadisticas.total}</h3>
                <p className="text-muted mb-0">Total Alumnos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">{estadisticas.entregadas}</h3>
                <p className="text-muted mb-0">Entregadas</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">{estadisticas.pendientes}</h3>
                <p className="text-muted mb-0">Pendientes</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">{estadisticas.calificadas}</h3>
                <p className="text-muted mb-0">Calificadas</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filtrar por estado</Form.Label>
                <Form.Select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="entregada">Entregadas</option>
                  <option value="calificada">Calificadas</option>
                  <option value="devuelta">Devueltas</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs defaultActiveKey="entregas" className="mb-4">
        <Tab eventKey="entregas" title={`📤 Entregas (${entregas.length})`}>
          <Card>
            <Card.Body>
              {entregasFiltradas.length === 0 ? (
                <Alert variant="info">No hay entregas con el filtro seleccionado.</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Estado</th>
                      <th>Fecha Entrega</th>
                      <th>Calificación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregasFiltradas.map((entrega) => {
                      const badge = obtenerBadgeEstado(entrega.estado);
                      return (
                        <tr key={entrega._id}>
                          <td>
                            <strong>{entrega.alumno?.nombre}</strong>
                            <br />
                            <small className="text-muted">{entrega.alumno?.email}</small>
                          </td>
                          <td>
                            <Badge bg={badge.bg}>{badge.text}</Badge>
                            {entrega.entregadaTarde && (
                              <><br /><Badge bg="warning" className="mt-1">⚠️ Tarde</Badge></>
                            )}
                          </td>
                          <td>
                            {entrega.fechaEntrega 
                              ? new Date(entrega.fechaEntrega).toLocaleString()
                              : "-"
                            }
                          </td>
                          <td>
                            {entrega.calificacion !== null && entrega.calificacion !== undefined
                              ? <strong>{entrega.calificacion} / {tarea.puntajeMaximo}</strong>
                              : "-"
                            }
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => abrirModalCalificar(entrega)}
                              >
                                {entrega.estado === "calificada" ? "✏️ Ver/Editar" : "📝 Calificar"}
                              </Button>
                              {entrega.estado !== "devuelta" && entrega.estado !== "pendiente" && (
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => handleDevolver(entrega._id)}
                                >
                                  🔄 Devolver
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="sin-entregar" title={`⚠️ Sin Entregar (${alumnosSinEntregar.length})`}>
          <Card>
            <Card.Body>
              {alumnosSinEntregar.length === 0 ? (
                <Alert variant="success">¡Todos los alumnos entregaron la tarea!</Alert>
              ) : (
                <ListGroup>
                  {alumnosSinEntregar.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <strong>{item.alumno?.nombre}</strong> • {item.alumno?.email}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Modal de Calificación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
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
                        <strong>Fecha de entrega:</strong><br />
                        {new Date(entregaSeleccionada.fechaEntrega).toLocaleString()}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p className="mb-1">
                        <strong>Estado:</strong><br />
                        <Badge bg={obtenerBadgeEstado(entregaSeleccionada.estado).bg}>
                          {obtenerBadgeEstado(entregaSeleccionada.estado).text}
                        </Badge>
                        {entregaSeleccionada.entregadaTarde && (
                          <Badge bg="warning" className="ms-2">⚠️ Tarde</Badge>
                        )}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Comentario del alumno */}
              {entregaSeleccionada.comentarioAlumno && (
                <Card className="mb-3">
                  <Card.Header>💬 Comentario del alumno</Card.Header>
                  <Card.Body>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {entregaSeleccionada.comentarioAlumno}
                    </p>
                  </Card.Body>
                </Card>
              )}

              {/* Archivos entregados */}
              {entregaSeleccionada.archivosEntregados?.length > 0 && (
                <Card className="mb-3">
                  <Card.Header>📎 Archivos entregados</Card.Header>
                  <ListGroup variant="flush">
                    {entregaSeleccionada.archivosEntregados.map((archivo, index) => (
                      <ListGroup.Item key={index}>
                        <a 
                          href={`${process.env.REACT_APP_API_URL}/${archivo.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          📄 {archivo.nombre}
                        </a>
                        <span className="text-muted small ms-2">
                          ({(archivo.tamano / 1024).toFixed(1)} KB)
                        </span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card>
              )}

              <hr />

              {/* Formulario de calificación */}
              <h5 className="mb-3">✍️ Calificar</h5>

              {/* Calificación por rúbrica */}
              {tarea.rubrica && tarea.rubrica.length > 0 && (
                <Card className="mb-3">
                  <Card.Header>📐 Calificación por Rúbrica</Card.Header>
                  <Card.Body>
                    {calificandoRubrica.map((item, index) => (
                      <Form.Group key={index} className="mb-3">
                        <Form.Label>
                          <strong>{item.criterio}</strong> (Max: {item.puntajeMaximo} pts)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max={item.puntajeMaximo}
                          value={item.puntajeObtenido}
                          onChange={(e) => actualizarRubrica(index, e.target.value)}
                        />
                      </Form.Group>
                    ))}
                    <Alert variant="info">
                      <strong>Total automático:</strong> {calificacion} / {tarea.puntajeMaximo}
                    </Alert>
                  </Card.Body>
                </Card>
              )}

              {/* Calificación manual */}
              {(!tarea.rubrica || tarea.rubrica.length === 0) && (
                <Form.Group className="mb-3">
                  <Form.Label>Calificación *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max={tarea.puntajeMaximo}
                    value={calificacion}
                    onChange={(e) => setCalificacion(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    Máximo: {tarea.puntajeMaximo} puntos
                    {entregaSeleccionada.entregadaTarde && tarea.penalizacionTarde > 0 && (
                      <> • Se aplicará {tarea.penalizacionTarde}% de penalización</>
                    )}
                  </Form.Text>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Comentario / Feedback</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={comentarioDocente}
                  onChange={(e) => setComentarioDocente(e.target.value)}
                  placeholder="Escribe tu feedback para el alumno..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Archivos de devolución (opcional)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) => setArchivosDevolucion(Array.from(e.target.files))}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleGuardarCalificacion}
            disabled={guardando || !calificacion}
          >
            {guardando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              "💾 Guardar Calificación"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CalificarEntregas;