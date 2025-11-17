// frontend/src/pages/Examenes/DetalleExamen.jsx
import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Table,
  ListGroup,
  Modal,
  ProgressBar,
  Tabs,
  Tab
} from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { obtenerExamen, eliminarExamen } from "../../services/examenService";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaChartBar,
  FaPlay,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaQuestionCircle,
  FaBook,
  FaCalendarAlt,
  FaUsers,
  FaTrophy
} from "react-icons/fa";

const DetalleExamen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  const [examen, setExamen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    cargarExamen();
  }, [id]);

  const cargarExamen = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerExamen(id);
      console.log("📊 Examen cargado:", data);
      setExamen(data);
    } catch (err) {
      console.error("❌ Error al cargar examen:", err);
      setError(err.response?.data?.msg || "Error al cargar el examen");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    try {
      setDeleting(true);
      await eliminarExamen(id);
      navigate("/dashboard/examenes", {
        state: { mensaje: "Examen eliminado correctamente" }
      });
    } catch (err) {
      alert(err.response?.data?.msg || "Error al eliminar examen");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const estaDisponible = () => {
    if (!examen) return false;
    const ahora = new Date();
    const apertura = new Date(examen.fechaApertura);
    const cierre = new Date(examen.fechaCierre);
    return ahora >= apertura && ahora <= cierre && examen.estado === "publicado";
  };

  const getBadgeEstado = (estado) => {
    const badges = {
      borrador: { bg: "secondary", texto: "Borrador" },
      publicado: { bg: "success", texto: "Publicado" },
      cerrado: { bg: "danger", texto: "Cerrado" },
    };
    return badges[estado] || { bg: "secondary", texto: estado };
  };

  const getEstadoIntento = (intento) => {
    if (intento.estado === "en_progreso") {
      return { bg: "warning", texto: "En progreso", icono: <FaClock /> };
    }
    if (intento.estado === "completado") {
      return { bg: "info", texto: "Pendiente calificación", icono: <FaQuestionCircle /> };
    }
    if (intento.estado === "calificado") {
      const aprobado = intento.porcentaje >= examen.configuracion.notaAprobacion;
      return {
        bg: aprobado ? "success" : "danger",
        texto: aprobado ? "Aprobado" : "Reprobado",
        icono: aprobado ? <FaCheckCircle /> : <FaTimesCircle />
      };
    }
    return { bg: "secondary", texto: "Desconocido", icono: <FaQuestionCircle /> };
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando examen...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h5>Error</h5>
          <p>{error}</p>
          <Button variant="danger" onClick={() => navigate("/dashboard/examenes")}>
            Volver a Exámenes
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!examen) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <p>Examen no encontrado</p>
          <Button variant="warning" onClick={() => navigate("/dashboard/examenes")}>
            Volver a Exámenes
          </Button>
        </Alert>
      </Container>
    );
  }

  const esDocente = usuario.rol === "docente" || usuario.rol === "admin";
  const disponible = estaDisponible();
  const intentosRestantes = examen.configuracion.intentosPermitidos - (examen.misIntentos?.length || 0);
  const tieneIntentoEnProgreso = examen.misIntentos?.some(i => i.estado === "en_progreso");
  const estadoBadge = getBadgeEstado(examen.estado);

  // ==================== VISTA PARA ALUMNOS ====================
  if (!esDocente) {
    return (
      <Container className="mt-4 mb-5">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate("/dashboard/examenes")}
              className="mb-3"
            >
              <FaArrowLeft className="me-2" />
              Volver a Exámenes
            </Button>
            <h2>{examen.titulo}</h2>
            <Badge bg={estadoBadge.bg} className="me-2">
              {estadoBadge.texto}
            </Badge>
            {disponible && <Badge bg="success">📍 Disponible</Badge>}
          </Col>
        </Row>

        {/* Información General */}
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FaBook className="me-2" />
                  Información del Examen
                </h5>
              </Card.Header>
              <Card.Body>
                {examen.descripcion && (
                  <p className="lead">{examen.descripcion}</p>
                )}
                
                <hr />

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>📚 Curso:</strong>
                      <p className="mb-0">{examen.curso?.titulo || examen.curso?.nombre}</p>
                    </div>
                    <div className="mb-3">
                      <strong>📝 Total de Preguntas:</strong>
                      <p className="mb-0">{examen.preguntas?.length || 0} preguntas</p>
                    </div>
                    <div className="mb-3">
                      <strong>🎯 Puntaje Total:</strong>
                      <p className="mb-0">{examen.puntajeTotal} puntos</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>⏱️ Duración:</strong>
                      <p className="mb-0">{examen.configuracion?.duracionMinutos} minutos</p>
                    </div>
                    <div className="mb-3">
                      <strong>✅ Nota Aprobación:</strong>
                      <p className="mb-0">{examen.configuracion?.notaAprobacion}%</p>
                    </div>
                    <div className="mb-3">
                      <strong>🔄 Intentos Permitidos:</strong>
                      <p className="mb-0">{examen.configuracion?.intentosPermitidos}</p>
                    </div>
                  </Col>
                </Row>

                <hr />

                <div className="mb-2">
                  <strong>📅 Fecha de Apertura:</strong>
                  <p className="mb-0">{formatearFecha(examen.fechaApertura)}</p>
                </div>
                <div>
                  <strong>🔒 Fecha de Cierre:</strong>
                  <p className="mb-0">{formatearFecha(examen.fechaCierre)}</p>
                </div>

                {examen.configuracion?.mostrarRespuestas && (
                  <Alert variant="info" className="mt-3 mb-0">
                    <FaCheckCircle className="me-2" />
                    <strong>Nota:</strong> Podrás ver las respuestas correctas después de completar el examen.
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Mis Intentos */}
            {examen.misIntentos && examen.misIntentos.length > 0 && (
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">
                    <FaTrophy className="me-2" />
                    Mis Intentos
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table striped hover responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Intento</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Calificación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examen.misIntentos.map((intento) => {
                        const estado = getEstadoIntento(intento);
                        return (
                          <tr key={intento._id}>
                            <td>
                              <Badge bg="secondary">#{intento.intentoNumero}</Badge>
                            </td>
                            <td>
                              {intento.fechaEntrega
                                ? formatearFecha(intento.fechaEntrega)
                                : "En progreso"}
                            </td>
                            <td>
                              <Badge bg={estado.bg}>
                                {estado.icono} {estado.texto}
                              </Badge>
                            </td>
                            <td>
                              {intento.estado === "calificado" ? (
                                <Badge
                                  bg={
                                    intento.porcentaje >= examen.configuracion.notaAprobacion
                                      ? "success"
                                      : "danger"
                                  }
                                  style={{ fontSize: "1em" }}
                                >
                                  {intento.puntuacionTotal} / {examen.puntajeTotal} ({intento.porcentaje}%)
                                </Badge>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {intento.estado === "en_progreso" ? (
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/examenes/${id}/realizar`)}
                                >
                                  Continuar
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/examenes/${id}/intento/${intento._id}/ver`)}
                                >
                                  Ver
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Estado y Acciones */}
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Acciones</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Intentos Restantes:</strong>
                  <ProgressBar
                    now={(intentosRestantes / examen.configuracion.intentosPermitidos) * 100}
                    label={`${intentosRestantes} de ${examen.configuracion.intentosPermitidos}`}
                    variant={intentosRestantes > 0 ? "success" : "danger"}
                    className="mt-2"
                  />
                </div>

                <hr />

                {disponible && intentosRestantes > 0 ? (
                  <div className="d-grid gap-2">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={() => navigate(`/dashboard/examenes/${id}/realizar`)}
                    >
                      <FaPlay className="me-2" />
                      {tieneIntentoEnProgreso ? "Continuar Examen" : "Iniciar Examen"}
                    </Button>
                  </div>
                ) : !disponible ? (
                  <Alert variant="warning" className="mb-0">
                    <strong>⚠️ No disponible</strong>
                    <p className="mb-0 small mt-2">
                      {new Date() < new Date(examen.fechaApertura)
                        ? "El examen aún no ha sido abierto"
                        : "El examen ya fue cerrado"}
                    </p>
                  </Alert>
                ) : (
                  <Alert variant="danger" className="mb-0">
                    <strong>❌ Sin intentos</strong>
                    <p className="mb-0 small mt-2">
                      Ya has usado todos tus intentos permitidos
                    </p>
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Resumen de Desempeño */}
            {examen.misIntentos && examen.misIntentos.length > 0 && (
              <Card className="shadow-sm">
                <Card.Header className="bg-dark text-white">
                  <h5 className="mb-0">Mi Desempeño</h5>
                </Card.Header>
                <Card.Body>
                  {(() => {
                    const intentosCalificados = examen.misIntentos.filter(i => i.estado === "calificado");
                    if (intentosCalificados.length === 0) {
                      return <p className="text-muted mb-0">Aún no tienes intentos calificados</p>;
                    }
                    
                    const mejorNota = Math.max(...intentosCalificados.map(i => i.porcentaje));
                    const ultimaNota = intentosCalificados[intentosCalificados.length - 1]?.porcentaje;
                    const promedio = (intentosCalificados.reduce((sum, i) => sum + i.porcentaje, 0) / intentosCalificados.length).toFixed(1);

                    return (
                      <>
                        <div className="mb-3 text-center">
                          <h3 className="mb-0">{mejorNota}%</h3>
                          <small className="text-muted">Mejor Nota</small>
                        </div>
                        <div className="mb-2">
                          <strong>Última Nota:</strong> {ultimaNota}%
                        </div>
                        <div className="mb-2">
                          <strong>Promedio:</strong> {promedio}%
                        </div>
                        <div>
                          <strong>Intentos Calificados:</strong> {intentosCalificados.length}
                        </div>
                      </>
                    );
                  })()}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    );
  }

  // ==================== VISTA PARA DOCENTES ====================
  return (
    <Container className="mt-4 mb-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate("/dashboard/examenes")}
            className="mb-3"
          >
            <FaArrowLeft className="me-2" />
            Volver a Exámenes
          </Button>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2>{examen.titulo}</h2>
              <Badge bg={estadoBadge.bg} className="me-2">
                {estadoBadge.texto}
              </Badge>
              <Badge bg="info">{examen.curso?.titulo || examen.curso?.nombre}</Badge>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={() => navigate(`/dashboard/examenes/${id}/editar`)}
              >
                <FaEdit className="me-2" />
                Editar
              </Button>
              <Button
                variant="success"
                onClick={() => navigate(`/dashboard/examenes/${id}/estadisticas`)}
              >
                <FaChartBar className="me-2" />
                Estadísticas
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
              >
                <FaTrash className="me-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Tabs defaultActiveKey="general" className="mb-4">
        {/* Tab: Información General */}
        <Tab eventKey="general" title="📋 General">
          <Row>
            <Col lg={8}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Información del Examen</h5>
                </Card.Header>
                <Card.Body>
                  {examen.descripcion && (
                    <>
                      <p className="lead">{examen.descripcion}</p>
                      <hr />
                    </>
                  )}

                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>📚 Curso:</strong>
                        <p className="mb-0">{examen.curso?.titulo || examen.curso?.nombre}</p>
                      </div>
                      <div className="mb-3">
                        <strong>📅 Fecha Apertura:</strong>
                        <p className="mb-0">{formatearFecha(examen.fechaApertura)}</p>
                      </div>
                      <div className="mb-3">
                        <strong>🔒 Fecha Cierre:</strong>
                        <p className="mb-0">{formatearFecha(examen.fechaCierre)}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>⏱️ Duración:</strong>
                        <p className="mb-0">{examen.configuracion?.duracionMinutos} minutos</p>
                      </div>
                      <div className="mb-3">
                        <strong>🎯 Puntaje Total:</strong>
                        <p className="mb-0">{examen.puntajeTotal} puntos</p>
                      </div>
                      <div className="mb-3">
                        <strong>✅ Nota Aprobación:</strong>
                        <p className="mb-0">{examen.configuracion?.notaAprobacion}%</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Configuración */}
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">Configuración</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Intentos Permitidos:</strong> {examen.configuracion?.intentosPermitidos}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Mezclar Preguntas:</strong>{" "}
                          {examen.configuracion?.mezclarPreguntas ? "✅ Sí" : "❌ No"}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Mezclar Opciones:</strong>{" "}
                          {examen.configuracion?.mezclarOpciones ? "✅ Sí" : "❌ No"}
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                    <Col md={6}>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Mostrar Respuestas:</strong>{" "}
                          {examen.configuracion?.mostrarRespuestas ? "✅ Sí" : "❌ No"}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Estado:</strong>{" "}
                          <Badge bg={estadoBadge.bg}>{estadoBadge.texto}</Badge>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Creado:</strong>{" "}
                          {formatearFecha(examen.createdAt)}
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Sidebar Estadísticas */}
            <Col lg={4}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Estadísticas Rápidas</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3 text-center">
                    <h2 className="mb-0">{examen.intentos?.length || 0}</h2>
                    <small className="text-muted">Total Intentos</small>
                  </div>
                  <hr />
                  <div className="mb-2">
                    <strong>Preguntas:</strong> {examen.preguntas?.length || 0}
                  </div>
                  <div className="mb-2">
                    <strong>Puntaje Total:</strong> {examen.puntajeTotal} pts
                  </div>
                  <div>
                    <strong>Duración:</strong> {examen.configuracion?.duracionMinutos} min
                  </div>
                </Card.Body>
              </Card>

              <Card className="shadow-sm">
                <Card.Header className="bg-dark text-white">
                  <h5 className="mb-0">Acceso Rápido</h5>
                </Card.Header>
                <Card.Body className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/dashboard/examenes/${id}/editar`)}
                  >
                    <FaEdit className="me-2" />
                    Editar Examen
                  </Button>
                  <Button
                    variant="outline-success"
                    onClick={() => navigate(`/dashboard/examenes/${id}/estadisticas`)}
                  >
                    <FaChartBar className="me-2" />
                    Ver Estadísticas
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Tab: Preguntas */}
        <Tab eventKey="preguntas" title={`❓ Preguntas (${examen.preguntas?.length || 0})`}>
          <Card className="shadow-sm">
            <Card.Body>
              {examen.preguntas && examen.preguntas.length > 0 ? (
                examen.preguntas.map((pregunta, index) => (
                  <Card key={pregunta._id} className="mb-3 border">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Badge bg="primary" className="me-2">
                            Pregunta {index + 1}
                          </Badge>
                          <Badge bg="info">{pregunta.tipo}</Badge>
                        </div>
                        <Badge bg="dark">{pregunta.puntaje} pts</Badge>
                      </div>
                      
                      <h6 className="mt-2 mb-3">{pregunta.pregunta}</h6>

                      {/* Opciones Múltiples */}
                      {pregunta.tipo === "multiple" && pregunta.opciones && (
                        <ListGroup variant="flush">
                          {pregunta.opciones.map((opcion, idx) => (
                            <ListGroup.Item
                              key={idx}
                              className={opcion.esCorrecta ? "bg-success bg-opacity-10 border-success" : ""}
                            >
                              <div className="d-flex align-items-center">
                                <span className="me-2">{String.fromCharCode(65 + idx)})</span>
                                <span>{opcion.texto}</span>
                                {opcion.esCorrecta && (
                                  <FaCheckCircle className="text-success ms-auto" />
                                )}
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}

                      {/* Verdadero/Falso */}
                      {pregunta.tipo === "verdadero_falso" && (
                        <Alert variant="info" className="mb-0">
                          <strong>Respuesta correcta:</strong> {pregunta.respuestaCorrecta}
                        </Alert>
                      )}

                      {/* Respuesta Corta */}
                      {pregunta.tipo === "corta" && (
                        <Alert variant="info" className="mb-0">
                          Requiere calificación manual
                        </Alert>
                      )}

                      {/* Desarrollo */}
                      {pregunta.tipo === "desarrollo" && (
                        <Alert variant="warning" className="mb-0">
                          Pregunta de desarrollo - Requiere calificación manual
                        </Alert>
                      )}
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <Alert variant="warning">No hay preguntas en este examen</Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Tab: Intentos */}
        <Tab eventKey="intentos" title={`👥 Intentos (${examen.intentos?.length || 0})`}>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              {examen.intentos && examen.intentos.length > 0 ? (
                <Table striped hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Alumno</th>
                      <th>Intento</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Calificación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examen.intentos.slice(0, 10).map((intento) => {
                      const estado = getEstadoIntento(intento);
                      return (
                        <tr key={intento._id}>
                          <td>
                            <strong>{intento.alumno?.nombre}</strong>
                            <br />
                            <small className="text-muted">{intento.alumno?.email}</small>
                          </td>
                          <td>
                            <Badge bg="secondary">#{intento.intentoNumero}</Badge>
                          </td>
                          <td>
                            {intento.fechaEntrega
                              ? formatearFecha(intento.fechaEntrega)
                              : "En progreso"}
                          </td>
                          <td>
                            <Badge bg={estado.bg}>
                              {estado.icono} {estado.texto}
                            </Badge>
                          </td>
                          <td>
                            {intento.estado === "calificado" ? (
                              <Badge
                                bg={
                                  intento.porcentaje >= examen.configuracion.notaAprobacion
                                    ? "success"
                                    : "danger"
                                }
                              >
                                {intento.porcentaje}%
                              </Badge>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => navigate(`/dashboard/examenes/${id}/intento/${intento._id}/ver`)}
                              >
                                Ver
                              </Button>
                              {intento.estado === "completado" && (
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/examenes/${id}/intento/${intento._id}/calificar`)}
                                >
                                  Calificar
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center p-5">
                  <FaUsers className="text-muted mb-3" size={50} />
                  <p className="text-muted">Aún no hay intentos de alumnos</p>
                </div>
              )}
              
              {examen.intentos && examen.intentos.length > 10 && (
                <div className="p-3 text-center">
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/dashboard/examenes/${id}/estadisticas`)}
                  >
                    Ver Todos ({examen.intentos.length})
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro que deseas eliminar el examen <strong>{examen.titulo}</strong>?</p>
          <Alert variant="danger">
            <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer y se eliminarán todos los intentos de los alumnos.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleEliminar}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DetalleExamen;