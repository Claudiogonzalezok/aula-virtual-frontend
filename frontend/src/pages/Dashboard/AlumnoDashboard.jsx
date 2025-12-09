// frontend/src/pages/Dashboard/AlumnoDashboard.jsx
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Spinner,
  Badge,
  ListGroup,
  Alert,
  ProgressBar,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaClipboardList,
  FaFileAlt,
  FaGraduationCap,
  FaBell,
  FaEnvelope,
  FaCalendarAlt,
  FaClock,
  FaChartLine,
  FaTrophy,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
  FaVideo,
  FaPlay,
  FaChalkboardTeacher,
} from "react-icons/fa";
import API from "../../services/api";

const AlumnoDashboard = ({ usuario }) => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clases, setClases] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);

  useEffect(() => {
    cargarDatos();
    cargarClases();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/notas-alumno/resumen");
      setDatos(data);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarClases = async () => {
    try {
      setLoadingClases(true);
      const { data: cursos } = await API.get("/cursos");

      if (cursos.length === 0) {
        setClases([]);
        return;
      }

      const promesas = cursos.map((curso) =>
        API.get(`/clases/curso/${curso._id}`).catch(() => ({ data: [] }))
      );
      const respuestas = await Promise.all(promesas);
      const todasLasClases = respuestas.flatMap((res) => res.data);

      setClases(todasLasClases);
    } catch (error) {
      console.error("Error al cargar clases:", error);
    } finally {
      setLoadingClases(false);
    }
  };

  // ========================================================
  // FUNCIONES AUXILIARES
  // ========================================================

  const obtenerFechaHora = (clase, tipo) => {
    const fecha = new Date(clase.fecha);
    const [h, m] = (tipo === "inicio" ? clase.horaInicio : clase.horaFin).split(":");
    fecha.setHours(parseInt(h), parseInt(m), 0, 0);
    return fecha;
  };

  const calcularEstadoClase = (clase) => {
    const ahora = new Date();
    const inicio = obtenerFechaHora(clase, "inicio");
    const fin = obtenerFechaHora(clase, "fin");

    if (clase.estado === "cancelada") return "cancelada";
    if (ahora > fin) return "finalizada";
    if (ahora >= inicio && ahora <= fin) return "en_curso";

    const diffMin = Math.floor((inicio - ahora) / 60000);
    if (diffMin > 0 && diffMin <= 30) return "proxima";
    if (inicio.toDateString() === ahora.toDateString()) return "hoy";

    return "programada";
  };

  const getMinutosRestantes = (clase) => {
    const ahora = new Date();
    const inicio = obtenerFechaHora(clase, "inicio");
    return Math.floor((inicio - ahora) / 60000);
  };

  const getNotaColor = (nota) => {
    if (nota === null) return "secondary";
    const n = parseFloat(nota);
    if (n >= 80) return "success";
    if (n >= 60) return "primary";
    if (n >= 40) return "warning";
    return "danger";
  };

  const formatearFechaRelativa = (fecha) => {
    const ahora = new Date();
    const f = new Date(fecha);
    const diff = f - ahora;
    const dias = Math.ceil(diff / 86400000);

    if (dias < 0) return "Vencido";
    if (dias === 0) return "Hoy";
    if (dias === 1) return "Mañana";
    if (dias <= 7) return `En ${dias} días`;

    return f.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  };

  const getTipoIcon = (tipo) =>
    tipo === "examen" ? (
      <FaClipboardList className="text-primary" />
    ) : (
      <FaFileAlt className="text-warning" />
    );

  // ========================================================
  // CLASIFICACIÓN DE CLASES
  // ========================================================

  const clasesEnCurso = clases.filter((c) => calcularEstadoClase(c) === "en_curso");

  const clasesProximas = clases
    .filter((c) => calcularEstadoClase(c) === "proxima")
    .sort((a, b) => obtenerFechaHora(a, "inicio") - obtenerFechaHora(b, "inicio"));

  const clasesDeHoy = clases
    .filter((c) => ["hoy", "proxima", "en_curso"].includes(calcularEstadoClase(c)))
    .sort((a, b) => obtenerFechaHora(a, "inicio") - obtenerFechaHora(b, "inicio"));

  // ========================================================
  // RENDER
  // ========================================================

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando tu panel...</p>
      </div>
    );
  }

  const stats = datos?.estadisticasGenerales || {};

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-primary fw-bold">¡Hola, {usuario.nombre}! 👋</h2>
        <p className="text-muted">Bienvenido a tu panel de estudiante.</p>
      </div>

      {/* ====================================================== */}
      {/* ALERTAS DE CLASE */}
      {/* ====================================================== */}

      {clasesEnCurso.length > 0 && (
        <Alert variant="success" className="mb-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaPlay className="me-3 fs-4" />
              <div>
                <strong>¡Tienes una clase en curso!</strong>
                <p className="mb-0 small">
                  {clasesEnCurso[0].titulo} —{" "}
                  {clasesEnCurso[0].curso?.titulo || clasesEnCurso[0].curso?.codigo}
                </p>
              </div>
            </div>

            {clasesEnCurso[0].tipo === "virtual" && clasesEnCurso[0].enlaceReunion && (
              <Button
                variant="success"
                href={clasesEnCurso[0].enlaceReunion}
                target="_blank"
              >
                <FaVideo className="me-2" /> Unirse ahora
              </Button>
            )}
          </div>
        </Alert>
      )}

      {clasesProximas.length > 0 && clasesEnCurso.length === 0 && (
        <Alert variant="warning" className="mb-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaClock className="me-3 fs-4" />
              <div>
                <strong>¡Clase por comenzar!</strong>
                <p className="mb-0 small">
                  {clasesProximas[0].titulo} comienza en{" "}
                  {getMinutosRestantes(clasesProximas[0])} minutos
                </p>
              </div>
            </div>

            {clasesProximas[0].tipo === "virtual" &&
              clasesProximas[0].enlaceReunion && (
                <Button
                  variant="warning"
                  href={clasesProximas[0].enlaceReunion}
                  target="_blank"
                >
                  <FaVideo className="me-2" /> Preparar enlace
                </Button>
              )}
          </div>
        </Alert>
      )}

      <Row className="mb-4 g-3">
        {/* Tarjetas estadísticas */}
        <Col xs={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-primary text-white">
            <Card.Body className="text-center py-4">
              <FaTrophy size={32} className="mb-2 opacity-75" />
              <h2 className="fw-bold">{stats.promedioGeneral || "-"}</h2>
              <small>Promedio General</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-success text-white">
            <Card.Body className="text-center py-4">
              <FaBookOpen size={32} className="mb-2 opacity-75" />
              <h2 className="fw-bold">{stats.cursosInscritos || 0}</h2>
              <small>Cursos Inscritos</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-info text-white">
            <Card.Body className="text-center py-4">
              <FaCheckCircle size={32} className="mb-2 opacity-75" />
              <h2 className="fw-bold">
                {(stats.tareasCompletadas || 0) +
                  (stats.examenesRealizados || 0)}
              </h2>
              <small>Actividades Completadas</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-warning text-dark">
            <Card.Body className="text-center py-4">
              <FaExclamationTriangle size={32} className="mb-2 opacity-75" />
              <h2 className="fw-bold">
                {(stats.tareasPendientes || 0) + (stats.examenesPendientes || 0)}
              </h2>
              <small>Pendientes</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          {/* ==================================== */}
          {/* CLASES DE HOY */}
          {/* ==================================== */}
          {clasesDeHoy.length > 0 && (
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white border-0 py-3">
                <div className="d-flex justify-content-between">
                  <h5 className="fw-bold">
                    <FaChalkboardTeacher className="me-2 text-primary" />
                    Clases de Hoy
                  </h5>

                  <Link to="/dashboard/clases" className="small text-decoration-none">
                    Ver todas <FaArrowRight size={12} />
                  </Link>
                </div>
              </Card.Header>

              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  {clasesDeHoy.slice(0, 4).map((clase) => {
                    const estado = calcularEstadoClase(clase);
                    const enCurso = estado === "en_curso";
                    const proxima = estado === "proxima";

                    return (
                      <ListGroup.Item
                        key={clase._id}
                        className={`d-flex justify-content-between align-items-center py-3 ${
                          enCurso
                            ? "bg-success bg-opacity-10"
                            : proxima
                            ? "bg-warning bg-opacity-10"
                            : ""
                        }`}
                      >
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {enCurso ? (
                              <FaPlay className="text-success" />
                            ) : proxima ? (
                              <FaClock className="text-warning" />
                            ) : (
                              <FaCalendarAlt className="text-muted" />
                            )}
                          </div>

                          <div>
                            <h6 className="mb-0">
                              {clase.titulo}
                              {enCurso && (
                                <Badge bg="success" className="ms-2">
                                  En curso
                                </Badge>
                              )}
                              {proxima && (
                                <Badge bg="warning" text="dark" className="ms-2">
                                  en {getMinutosRestantes(clase)} min
                                </Badge>
                              )}
                            </h6>

                            <small className="text-muted">
                              {clase.curso?.codigo} • {clase.horaInicio} - {clase.horaFin}
                            </small>
                          </div>
                        </div>

                        <div>
                          {(enCurso || proxima) &&
                            clase.tipo === "virtual" &&
                            clase.enlaceReunion && (
                              <Button
                                size="sm"
                                variant={enCurso ? "success" : "outline-warning"}
                                href={clase.enlaceReunion}
                                target="_blank"
                              >
                                <FaVideo className="me-1" />
                                {enCurso ? "Unirse" : "Enlace"}
                              </Button>
                            )}

                          {!enCurso && !proxima && (
                            <Badge bg="light" text="dark">
                              {clase.horaInicio}
                            </Badge>
                          )}
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {/* ==================================== */}
          {/* PROXIMAS ENTREGAS - FIX APLICADO AQUÍ */}
          {/* ==================================== */}

          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <FaClock className="me-2 text-danger" />
                  Próximas Entregas
                </h5>

                <Link to="/dashboard/mis-tareas" className="small text-decoration-none">
                  Ver todas <FaArrowRight size={12} />
                </Link>
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              {datos?.proximasEntregas?.length > 0 ? (
                <ListGroup variant="flush">
                  {datos.proximasEntregas.map((item, index) => {
                    const diffMs = new Date(item.fechaLimite) - new Date();
                    const menosDeDosDias = diffMs <= 2 * 86400000;

                    return (
                      <ListGroup.Item
                        key={index}
                        className="d-flex justify-content-between align-items-center py-3"
                      >
                        <div className="d-flex align-items-center">
                          <div className="me-3">{getTipoIcon(item.tipo)}</div>
                          <div>
                            <h6 className="mb-0">{item.titulo}</h6>
                            <small className="text-muted">{item.curso}</small>
                          </div>
                        </div>

                        <div className="text-end">
                          <Badge bg={menosDeDosDias ? "danger" : "secondary"}>
                            {formatearFechaRelativa(item.fechaLimite)}
                          </Badge>

                          <small className="text-muted d-block">
                            {new Date(item.fechaLimite).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <FaCheckCircle size={40} className="text-success mb-2" />
                  <p className="text-muted mb-0">
                    ¡No tienes entregas pendientes próximas!
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ==================================== */}
          {/* PROGRESO POR CURSO */}
          {/* ==================================== */}

          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <FaChartLine className="me-2 text-success" />
                  Mi Progreso por Curso
                </h5>
                <Link to="/dashboard/notas" className="text-decoration-none small">
                  Ver notas <FaArrowRight size={12} />
                </Link>
              </div>
            </Card.Header>

            <Card.Body>
              {datos?.cursos?.length > 0 ? (
                datos.cursos.map((curso) => (
                  <div key={curso._id} className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <div>
                        <h6 className="mb-0">{curso.titulo}</h6>
                        <small className="text-muted">
                          {curso.codigo} • {curso.docente}
                        </small>
                      </div>

                      <Badge bg={getNotaColor(curso.promedio)} className="px-3 py-2">
                        {curso.promedio ? `${curso.promedio}%` : "Sin notas"}
                      </Badge>
                    </div>

                    <ProgressBar className="mb-1" style={{ height: "10px" }}>
                      <ProgressBar
                        variant={getNotaColor(curso.promedio)}
                        now={
                          curso.totalActividades > 0
                            ? (curso.actividadesCompletadas / curso.totalActividades) *
                              100
                            : 0
                        }
                      />
                    </ProgressBar>

                    <small className="text-muted">
                      {curso.actividadesCompletadas} de {curso.totalActividades} completadas
                    </small>
                  </div>
                ))
              ) : (
                <Alert variant="info">
                  <FaBookOpen className="me-2" />
                  No estás inscrito en ningún curso aún.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ==================================== */}
        {/* ACCESOS RÁPIDOS */}
        {/* ==================================== */}

        <Col lg={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold">
                <FaCalendarAlt className="me-2 text-primary" />
                Accesos Rápidos
              </h5>
            </Card.Header>

            <Card.Body className="p-0">
              <ListGroup variant="flush">
                <ListGroup.Item
                  action
                  as={Link}
                  to="/dashboard/cursos"
                  className="d-flex align-items-center py-3"
                >
                  <div className="bg-success bg-opacity-10 p-2 rounded me-3">
                    <FaBookOpen className="text-success" size={20} />
                  </div>

                  <div>
                    <h6 className="mb-0">Mis Cursos</h6>
                    <small className="text-muted">Ver todos mis cursos</small>
                  </div>
                </ListGroup.Item>

                {/* MIS CLASES */}
                <ListGroup.Item
                  action
                  as={Link}
                  to="/dashboard/clases"
                  className="d-flex align-items-center py-3"
                >
                  <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                    <FaChalkboardTeacher className="text-primary" size={20} />
                  </div>

                  <div className="flex-grow-1">
                    <h6 className="mb-0">Mis Clases</h6>
                    <small className="text-muted">Horarios y sesiones</small>
                  </div>

                  {clasesEnCurso.length > 0 && (
                    <Badge bg="success">{clasesEnCurso.length} en curso</Badge>
                  )}

                  {clasesProximas.length > 0 && clasesEnCurso.length === 0 && (
                    <Badge bg="warning">{clasesProximas.length} próxima(s)</Badge>
                  )}
                </ListGroup.Item>

                <ListGroup.Item
                  action
                  as={Link}
                  to="/dashboard/mis-tareas"
                  className="d-flex align-items-center py-3"
                >
                  <div className="bg-warning bg-opacity-10 p-2 rounded me-3">
                    <FaFileAlt className="text-warning" size={20} />
                  </div>

                  <div>
                    <h6 className="mb-0">Mis Tareas</h6>
                    <small className="text-muted">Entregas y trabajos</small>
                  </div>
                </ListGroup.Item>

                <ListGroup.Item
                  action
                  as={Link}
                  to="/dashboard/examenes"
                  className="d-flex align-items-center py-3"
                >
                  <div className="bg-danger bg-opacity-10 p-2 rounded me-3">
                    <FaClipboardList className="text-danger" size={20} />
                  </div>

                  <div>
                    <h6 className="mb-0">Exámenes</h6>
                    <small className="text-muted">Realizar y ver resultados</small>
                  </div>
                </ListGroup.Item>

                <ListGroup.Item
                  action
                  as={Link}
                  to="/dashboard/notas"
                  className="d-flex align-items-center py-3"
                >
                  <div className="bg-info bg-opacity-10 p-2 rounded me-3">
                    <FaGraduationCap className="text-info" size={20} />
                  </div>

                  <div>
                    <h6 className="mb-0">Mis Notas</h6>
                    <small className="text-muted">Consultar calificaciones</small>
                  </div>
                </ListGroup.Item>

                <ListGroup.Item
                  action
                  as={Link}
                  to="/dashboard/mensajes"
                  className="d-flex align-items-center py-3"
                >
                  <div className="bg-secondary bg-opacity-10 p-2 rounded me-3">
                    <FaEnvelope className="text-secondary" size={20} />
                  </div>

                  <div>
                    <h6 className="mb-0">Mensajes</h6>
                    <small className="text-muted">Contactar docente</small>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AlumnoDashboard;
