// frontend/src/pages/Notas/MisNotas.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Table,
  Badge,
  Spinner,
  Alert,
  ProgressBar,
  Accordion,
  Button,
  OverlayTrigger,
  Tooltip,
  Nav,
  Tab
} from "react-bootstrap";
import {
  FaGraduationCap,
  FaClipboardList,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartLine,
  FaTrophy,
  FaExclamationTriangle,
  FaEye,
  FaBook
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { toast } from "react-toastify";

const MisNotas = () => {
  const [notas, setNotas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [notasCurso, setNotasCurso] = useState(null);
  const [loadingCurso, setLoadingCurso] = useState(false);

  useEffect(() => {
    cargarNotas();
  }, []);

  const cargarNotas = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/notas-alumno/todas");
      setNotas(data);
      
      // Seleccionar el primer curso automáticamente si hay cursos
      if (data.cursos && data.cursos.length > 0) {
        setCursoSeleccionado(data.cursos[0]._id);
        cargarNotasCurso(data.cursos[0]._id);
      }
    } catch (error) {
      console.error("Error al cargar notas:", error);
      toast.error("Error al cargar las notas");
    } finally {
      setLoading(false);
    }
  };

  const cargarNotasCurso = async (cursoId) => {
    try {
      setLoadingCurso(true);
      const { data } = await API.get(`/notas-alumno/curso/${cursoId}`);
      setNotasCurso(data);
    } catch (error) {
      console.error("Error al cargar notas del curso:", error);
      toast.error("Error al cargar las notas del curso");
    } finally {
      setLoadingCurso(false);
    }
  };

  const handleSelectCurso = (cursoId) => {
    setCursoSeleccionado(cursoId);
    cargarNotasCurso(cursoId);
  };

  // Función para obtener el color según la nota
  const getNotaColor = (nota) => {
    if (nota === null) return "secondary";
    if (nota >= 80) return "success";
    if (nota >= 60) return "primary";
    if (nota >= 40) return "warning";
    return "danger";
  };

  // Función para obtener el ícono según el estado
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "calificado":
      case "calificada":
        return <FaCheckCircle className="text-success" />;
      case "entregada":
      case "en_revision":
      case "completado":
        return <FaClock className="text-warning" />;
      case "pendiente":
        return <FaExclamationTriangle className="text-secondary" />;
      default:
        return <FaTimesCircle className="text-secondary" />;
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando tus notas...</p>
      </Container>
    );
  }

  if (!notas || notas.cursos.length === 0) {
    return (
      <Container className="py-4">
        <Alert variant="info" className="text-center">
          <FaGraduationCap size={40} className="mb-3" />
          <h5>No estás inscrito en ningún curso</h5>
          <p className="mb-0">
            Cuando te inscribas en cursos, podrás ver tus calificaciones aquí.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-primary fw-bold mb-1">
            <FaGraduationCap className="me-2" />
            Mis Notas
          </h2>
          <p className="text-muted mb-0">
            Consulta tus calificaciones en todos tus cursos
          </p>
        </div>
      </div>

      {/* Resumen General de Cursos */}
      <Row className="mb-4 g-3">
        {notas.cursos.map((curso) => (
          <Col key={curso._id} xs={12} md={6} lg={4}>
            <Card 
              className={`shadow-sm border-0 h-100 cursor-pointer ${
                cursoSeleccionado === curso._id ? "border-primary border-2" : ""
              }`}
              onClick={() => handleSelectCurso(curso._id)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="fw-bold mb-1">{curso.titulo}</h6>
                    <small className="text-muted">{curso.codigo}</small>
                  </div>
                  <Badge 
                    bg={getNotaColor(parseFloat(curso.promedio))} 
                    className="fs-6 px-3 py-2"
                  >
                    {curso.promedio !== null ? `${curso.promedio}%` : "S/N"}
                  </Badge>
                </div>
                
                <div className="mb-2">
                  <small className="text-muted d-block mb-1">Progreso del curso</small>
                  <ProgressBar 
                    now={curso.actividades.length > 0 
                      ? (curso.actividades.filter(a => a.nota !== null).length / curso.actividades.length) * 100 
                      : 0
                    }
                    variant={getNotaColor(parseFloat(curso.promedio))}
                    style={{ height: "8px" }}
                  />
                </div>
                
                <div className="d-flex justify-content-between text-muted small">
                  <span>
                    <FaBook className="me-1" />
                    {curso.docente}
                  </span>
                  <span>
                    {curso.actividades.filter(a => a.nota !== null).length}/{curso.actividades.length} completadas
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Detalle del Curso Seleccionado */}
      {cursoSeleccionado && (
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-primary text-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaChartLine className="me-2" />
                Detalle de Calificaciones
              </h5>
              {notasCurso && (
                <Badge bg="light" text="dark" className="fs-6">
                  Promedio: {notasCurso.estadisticas.promedioCurso || "S/N"}%
                </Badge>
              )}
            </div>
          </Card.Header>
          
          <Card.Body>
            {loadingCurso ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" size="sm" />
                <span className="ms-2">Cargando...</span>
              </div>
            ) : notasCurso ? (
              <Tab.Container defaultActiveKey="examenes">
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="examenes">
                      <FaClipboardList className="me-2" />
                      Exámenes ({notasCurso.examenes.length})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="tareas">
                      <FaFileAlt className="me-2" />
                      Tareas ({notasCurso.tareas.length})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  {/* Tab de Exámenes */}
                  <Tab.Pane eventKey="examenes">
                    {notasCurso.examenes.length === 0 ? (
                      <Alert variant="light" className="text-center">
                        No hay exámenes en este curso
                      </Alert>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Examen</th>
                              <th className="text-center">Intentos</th>
                              <th className="text-center">Mejor Nota</th>
                              <th className="text-center">Estado</th>
                              <th className="text-center">Fecha Límite</th>
                              <th className="text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {notasCurso.examenes.map((examen) => (
                              <tr key={examen._id}>
                                <td>
                                  <div>
                                    <strong>{examen.titulo}</strong>
                                    {examen.descripcion && (
                                      <small className="text-muted d-block">
                                        {examen.descripcion.substring(0, 50)}...
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td className="text-center">
                                  <Badge bg="secondary">
                                    {examen.intentosUsados}/{examen.intentosPermitidos}
                                  </Badge>
                                </td>
                                <td className="text-center">
                                  {examen.mejorNota !== null ? (
                                    <span className={`fw-bold text-${getNotaColor(examen.mejorNota)}`}>
                                      {examen.mejorNota.toFixed(1)}%
                                    </span>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                                <td className="text-center">
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>{examen.estado}</Tooltip>}
                                  >
                                    <span>{getEstadoIcon(examen.estado)}</span>
                                  </OverlayTrigger>
                                </td>
                                <td className="text-center">
                                  <small className={new Date(examen.fechaCierre) < new Date() ? "text-danger" : ""}>
                                    {formatearFecha(examen.fechaCierre)}
                                  </small>
                                </td>
                                <td className="text-center">
                                  {examen.puedeIntentar ? (
                                    <Link 
                                      to={`/dashboard/examenes/${examen._id}/realizar`}
                                      className="btn btn-sm btn-primary"
                                    >
                                      Realizar
                                    </Link>
                                  ) : examen.intentosUsados > 0 ? (
                                    <Link 
                                      to={`/dashboard/examenes/${examen._id}`}
                                      className="btn btn-sm btn-outline-primary"
                                    >
                                      <FaEye className="me-1" />
                                      Ver
                                    </Link>
                                  ) : (
                                    <Badge bg="secondary">Cerrado</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}

                    {/* Historial de intentos */}
                    {notasCurso.examenes.some(e => e.intentos.length > 0) && (
                      <Accordion className="mt-3">
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>
                            <FaChartLine className="me-2" />
                            Ver historial de intentos
                          </Accordion.Header>
                          <Accordion.Body>
                            {notasCurso.examenes
                              .filter(e => e.intentos.length > 0)
                              .map(examen => (
                                <div key={examen._id} className="mb-3">
                                  <h6 className="fw-bold">{examen.titulo}</h6>
                                  <Table size="sm" bordered>
                                    <thead className="table-light">
                                      <tr>
                                        <th>Intento</th>
                                        <th>Nota</th>
                                        <th>Fecha</th>
                                        <th>Tiempo</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {examen.intentos.map((intento, idx) => (
                                        <tr key={idx}>
                                          <td>#{intento.intentoNumero}</td>
                                          <td className={`text-${getNotaColor(intento.porcentaje)}`}>
                                            {intento.porcentaje?.toFixed(1)}%
                                          </td>
                                          <td>{formatearFecha(intento.fecha)}</td>
                                          <td>{intento.tiempoUsado} min</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </div>
                              ))}
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    )}
                  </Tab.Pane>

                  {/* Tab de Tareas */}
                  <Tab.Pane eventKey="tareas">
                    {notasCurso.tareas.length === 0 ? (
                      <Alert variant="light" className="text-center">
                        No hay tareas en este curso
                      </Alert>
                    ) : (
                      <div className="table-responsive">
                        <Table hover className="align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Tarea</th>
                              <th className="text-center">Calificación</th>
                              <th className="text-center">Estado</th>
                              <th className="text-center">Fecha Límite</th>
                              <th className="text-center">Entrega</th>
                              <th className="text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {notasCurso.tareas.map((tarea) => (
                              <tr key={tarea._id}>
                                <td>
                                  <div>
                                    <strong>{tarea.titulo}</strong>
                                    {tarea.descripcion && (
                                      <small className="text-muted d-block">
                                        {tarea.descripcion.substring(0, 50)}...
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td className="text-center">
                                  {tarea.entrega?.calificacion != null ? (
                                    <div>
                                      <span className={`fw-bold text-${getNotaColor(parseFloat(tarea.entrega.porcentaje))}`}>
                                        {tarea.entrega.porcentaje}%
                                      </span>
                                      <small className="text-muted d-block">
                                        {tarea.entrega.calificacion}/{tarea.puntajeMaximo}
                                      </small>
                                    </div>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                                <td className="text-center">
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>{tarea.estado}</Tooltip>}
                                  >
                                    <span>{getEstadoIcon(tarea.estado)}</span>
                                  </OverlayTrigger>
                                </td>
                                <td className="text-center">
                                  <small className={new Date(tarea.fechaCierre) < new Date() ? "text-danger" : ""}>
                                    {formatearFecha(tarea.fechaCierre)}
                                  </small>
                                </td>
                                <td className="text-center">
                                  {tarea.entrega ? (
                                    <div>
                                      <small className="text-muted">
                                        {formatearFecha(tarea.entrega.fechaEntrega)}
                                      </small>
                                      {tarea.entrega.entregadaTarde && (
                                        <Badge bg="warning" text="dark" className="ms-1" size="sm">
                                          Tarde
                                        </Badge>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                                <td className="text-center">
                                  <Link 
                                    to={`/dashboard/tareas/${tarea._id}`}
                                    className="btn btn-sm btn-outline-primary"
                                  >
                                    <FaEye className="me-1" />
                                    Ver
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}

                    {/* Retroalimentación de tareas calificadas */}
                    {notasCurso.tareas.some(t => t.entrega?.comentarios) && (
                      <Accordion className="mt-3">
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>
                            <FaFileAlt className="me-2" />
                            Ver retroalimentación del docente
                          </Accordion.Header>
                          <Accordion.Body>
                            {notasCurso.tareas
                              .filter(t => t.entrega?.comentarios)
                              .map(tarea => (
                                <div key={tarea._id} className="mb-3 p-3 bg-light rounded">
                                  <h6 className="fw-bold">{tarea.titulo}</h6>
                                  <p className="mb-0 text-muted">
                                    "{tarea.entrega.comentarios}"
                                  </p>
                                </div>
                              ))}
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    )}
                  </Tab.Pane>
                </Tab.Content>

                {/* Estadísticas del curso */}
                <Row className="mt-4 g-3">
                  <Col xs={6} md={3}>
                    <Card className="border-0 bg-light text-center">
                      <Card.Body className="py-3">
                        <FaClipboardList className="text-primary mb-2" size={24} />
                        <h5 className="mb-0">{notasCurso.estadisticas.examenesCompletados}/{notasCurso.estadisticas.totalExamenes}</h5>
                        <small className="text-muted">Exámenes</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6} md={3}>
                    <Card className="border-0 bg-light text-center">
                      <Card.Body className="py-3">
                        <FaFileAlt className="text-warning mb-2" size={24} />
                        <h5 className="mb-0">{notasCurso.estadisticas.tareasEntregadas}/{notasCurso.estadisticas.totalTareas}</h5>
                        <small className="text-muted">Tareas Entregadas</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6} md={3}>
                    <Card className="border-0 bg-light text-center">
                      <Card.Body className="py-3">
                        <FaCheckCircle className="text-success mb-2" size={24} />
                        <h5 className="mb-0">{notasCurso.estadisticas.tareasCalificadas}</h5>
                        <small className="text-muted">Calificadas</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6} md={3}>
                    <Card className="border-0 bg-light text-center">
                      <Card.Body className="py-3">
                        <FaTrophy className={`mb-2 text-${getNotaColor(parseFloat(notasCurso.estadisticas.promedioCurso))}`} size={24} />
                        <h5 className="mb-0">{notasCurso.estadisticas.promedioCurso || "-"}%</h5>
                        <small className="text-muted">Promedio</small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Container>
            ) : null}
          </Card.Body>
        </Card>
      )}

      <style>{`
        .cursor-pointer {
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cursor-pointer:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default MisNotas;