// frontend/src/pages/Clases/MisClases.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import {
  Table,
  Button,
  Spinner,
  Badge,
  Card,
  Row,
  Col,
  Tabs,
  Tab,
  Form,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import {
  FaClock,
  FaVideo,
  FaMapMarkerAlt,
  FaUsers,
  FaPlay,
  FaCalendarDay,
  FaExclamationTriangle,
  FaBook,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaEye,
} from "react-icons/fa";

moment.locale("es");
const localizer = momentLocalizer(moment);

const MisClases = () => {
  const { usuario } = useContext(AuthContext);
  const [clases, setClases] = useState([]);
  const [clasesFiltradas, setClasesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [filtroCurso, setFiltroCurso] = useState("todos");
  const [cursos, setCursos] = useState([]);
  const [ahora, setAhora] = useState(new Date());

  const esDocente = usuario?.rol === "docente";
  const esAlumno = usuario?.rol === "alumno";
  const esAdmin = usuario?.rol === "admin";

  // Actualizar "ahora" cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setAhora(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    cargarClases();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtroEstado, filtroCurso, clases]);

  const cargarClases = async () => {
    setLoading(true);
    try {
      // El endpoint /cursos ya filtra según el rol del usuario
      const { data: cursosData } = await API.get("/cursos");
      setCursos(cursosData);

      if (cursosData.length === 0) {
        setClases([]);
        setLoading(false);
        return;
      }

      const promesasClases = cursosData.map((curso) =>
        API.get(`/clases/curso/${curso._id}`).catch((err) => {
          console.error(`Error al cargar clases del curso ${curso._id}:`, err);
          return { data: [] };
        })
      );

      const respuestasClases = await Promise.all(promesasClases);
      const todasLasClases = respuestasClases.flatMap((res) => res.data);

      setClases(todasLasClases);
    } catch (error) {
      console.error("Error al cargar clases:", error);
      toast.error("Error al cargar las clases");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPERS PARA TIEMPO Y ESTADO
  // ============================================

  const obtenerFechaHora = (clase, tipo) => {
    const fecha = new Date(clase.fecha);
    const [horas, minutos] = (
      tipo === "inicio" ? clase.horaInicio : clase.horaFin
    ).split(":");
    fecha.setHours(parseInt(horas), parseInt(minutos), 0, 0);
    return fecha;
  };

  const calcularEstadoTiempo = (clase) => {
    const fechaInicio = obtenerFechaHora(clase, "inicio");
    const fechaFin = obtenerFechaHora(clase, "fin");
    const diferencia = fechaInicio - ahora;
    const minutosRestantes = Math.floor(diferencia / (1000 * 60));

    if (clase.estado === "cancelada") {
      return { tipo: "cancelada", minutosRestantes: null };
    }

    if (ahora > fechaFin) {
      return { tipo: "finalizada", minutosRestantes: null };
    }

    if (ahora >= fechaInicio && ahora <= fechaFin) {
      const minutosTranscurridos = Math.floor(
        (ahora - fechaInicio) / (1000 * 60)
      );
      const duracionTotal = Math.floor((fechaFin - fechaInicio) / (1000 * 60));
      return {
        tipo: "en_curso",
        minutosRestantes: duracionTotal - minutosTranscurridos,
        progreso: (minutosTranscurridos / duracionTotal) * 100,
      };
    }

    if (minutosRestantes > 0 && minutosRestantes <= 30) {
      return { tipo: "proxima", minutosRestantes };
    }

    const hoy = new Date();
    if (
      fechaInicio.toDateString() === hoy.toDateString() &&
      minutosRestantes > 30
    ) {
      return { tipo: "hoy", minutosRestantes };
    }

    return { tipo: "programada", minutosRestantes: null };
  };

  const esHoy = (fecha) => {
    const hoy = new Date();
    const fechaClase = new Date(fecha);
    return fechaClase.toDateString() === hoy.toDateString();
  };

  // ============================================
  // CLASES AGRUPADAS
  // ============================================

  const clasesEnCurso = useMemo(() => {
    return clases.filter((clase) => {
      const estado = calcularEstadoTiempo(clase);
      return estado.tipo === "en_curso";
    });
  }, [clases, ahora]);

  const clasesProximas = useMemo(() => {
    return clases
      .filter((clase) => {
        const estado = calcularEstadoTiempo(clase);
        return estado.tipo === "proxima";
      })
      .sort(
        (a, b) => obtenerFechaHora(a, "inicio") - obtenerFechaHora(b, "inicio")
      );
  }, [clases, ahora]);

  const clasesDeHoy = useMemo(() => {
    return clases
      .filter((clase) => {
        const estado = calcularEstadoTiempo(clase);
        return (
          esHoy(clase.fecha) &&
          estado.tipo !== "cancelada" &&
          estado.tipo !== "finalizada"
        );
      })
      .sort(
        (a, b) => obtenerFechaHora(a, "inicio") - obtenerFechaHora(b, "inicio")
      );
  }, [clases, ahora]);

  // ============================================
  // FILTROS
  // ============================================

  const aplicarFiltros = () => {
    let resultado = [...clases];

    if (filtroEstado !== "todas") {
      resultado = resultado.filter((clase) => clase.estado === filtroEstado);
    }

    if (filtroCurso !== "todos") {
      resultado = resultado.filter((clase) => clase.curso._id === filtroCurso);
    }

    setClasesFiltradas(resultado);
  };

  // ============================================
  // FORMATEO
  // ============================================

  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getBadgeEstado = (estado) => {
    const badges = {
      programada: "primary",
      en_curso: "success",
      finalizada: "secondary",
      cancelada: "danger",
    };
    return badges[estado] || "secondary";
  };

  const getTipoIcono = (tipo) => {
    switch (tipo) {
      case "virtual":
        return <FaVideo className="me-1" />;
      case "presencial":
        return <FaMapMarkerAlt className="me-1" />;
      case "hibrida":
        return <FaUsers className="me-1" />;
      default:
        return null;
    }
  };

  // ============================================
  // CALENDARIO
  // ============================================

  const eventosCalendario = clasesFiltradas.map((clase) => {
    const inicio = obtenerFechaHora(clase, "inicio");
    const fin = obtenerFechaHora(clase, "fin");

    return {
      id: clase._id,
      title: `${clase.curso.codigo || clase.curso.titulo} - ${clase.titulo}`,
      start: inicio,
      end: fin,
      resource: clase,
    };
  });

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad";
    const estadoTiempo = calcularEstadoTiempo(event.resource);

    if (estadoTiempo.tipo === "en_curso") {
      backgroundColor = "#198754";
    } else if (estadoTiempo.tipo === "proxima") {
      backgroundColor = "#fd7e14";
    } else {
      switch (event.resource.estado) {
        case "programada":
          backgroundColor = "#0d6efd";
          break;
        case "en_curso":
          backgroundColor = "#198754";
          break;
        case "finalizada":
          backgroundColor = "#6c757d";
          break;
        case "cancelada":
          backgroundColor = "#dc3545";
          break;
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const mensajesCalendario = {
    allDay: "Todo el día",
    previous: "Anterior",
    next: "Siguiente",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Clase",
    noEventsInRange: "No hay clases en este rango",
    showMore: (total) => `+ Ver más (${total})`,
  };

  // ============================================
  // COMPONENTES DE TARJETAS
  // ============================================

  const TarjetaClaseEnCurso = ({ clase }) => {
    const estado = calcularEstadoTiempo(clase);

    return (
      <Card className="border-success shadow clase-en-curso-card h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Badge bg="success" className="pulso">
              <FaPlay className="me-1" /> EN CURSO
            </Badge>
            <small className="text-muted">
              {estado.minutosRestantes} min restantes
            </small>
          </div>

          <h5 className="mb-1">{clase.titulo}</h5>
          <p className="text-muted small mb-2">
            📚 {clase.curso.codigo} - {clase.curso.titulo}
          </p>

          {/* Info del docente para alumnos */}
          {esAlumno && clase.curso.docente && (
            <p className="text-muted small mb-2">
              <FaChalkboardTeacher className="me-1" />
              {clase.curso.docente.nombre}
            </p>
          )}

          <div className="mb-2">
            <small>
              <FaClock className="me-1 text-success" />
              {clase.horaInicio} - {clase.horaFin}
            </small>
            <br />
            <small>
              {getTipoIcono(clase.tipo)}
              {clase.tipo}
            </small>
          </div>

          {/* Barra de progreso */}
          <div className="progress mb-3" style={{ height: "8px" }}>
            <div
              className="progress-bar bg-success progress-bar-striped progress-bar-animated"
              style={{ width: `${estado.progreso}%` }}
            />
          </div>

          <div className="d-flex gap-2 flex-wrap">
            {clase.tipo === "virtual" && clase.enlaceReunion && (
              <Button
                variant="success"
                size="sm"
                href={clase.enlaceReunion}
                target="_blank"
              >
                <FaVideo className="me-1" /> Unirse a la clase
              </Button>
            )}
            <Link to={`/dashboard/clases/${clase._id}`}>
              <Button variant="outline-primary" size="sm">
                <FaEye className="me-1" /> Ver Detalles
              </Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const TarjetaClaseProxima = ({ clase }) => {
    const estado = calcularEstadoTiempo(clase);

    return (
      <Card className="border-warning shadow-sm h-100 clase-proxima-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Badge bg="warning" text="dark" className="pulso-suave">
              <FaClock className="me-1" /> PRÓXIMA
            </Badge>
            <Badge bg="light" text="dark">
              en {estado.minutosRestantes} min
            </Badge>
          </div>

          <h6 className="mb-1">{clase.titulo}</h6>
          <p className="text-muted small mb-2">
            📚 {clase.curso.codigo} - {clase.curso.titulo}
          </p>

          {/* Info del docente para alumnos */}
          {esAlumno && clase.curso.docente && (
            <p className="text-muted small mb-2">
              <FaChalkboardTeacher className="me-1" />
              {clase.curso.docente.nombre}
            </p>
          )}

          <div className="mb-2">
            <small className="text-muted">
              <FaClock className="me-1" />
              {clase.horaInicio} - {clase.horaFin}
            </small>
            <br />
            <small className="text-muted">
              {getTipoIcono(clase.tipo)}
              {clase.tipo}
            </small>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            {clase.tipo === "virtual" && clase.enlaceReunion && (
              <Button
                variant="warning"
                size="sm"
                href={clase.enlaceReunion}
                target="_blank"
              >
                <FaVideo className="me-1" /> Preparar enlace
              </Button>
            )}
            <Link to={`/dashboard/clases/${clase._id}`}>
              <Button variant="outline-secondary" size="sm">
                <FaEye className="me-1" /> Ver
              </Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const TarjetaClaseHoy = ({ clase }) => {
    const estado = calcularEstadoTiempo(clase);

    return (
      <Card className="shadow-sm h-100">
        <Card.Body className="py-2">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0">{clase.titulo}</h6>
              <small className="text-muted">
                {clase.curso.codigo} • {clase.horaInicio} - {clase.horaFin}
              </small>
              {esAlumno && clase.curso.docente && (
                <small className="text-muted d-block">
                  <FaChalkboardTeacher className="me-1" size={10} />
                  {clase.curso.docente.nombre}
                </small>
              )}
            </div>
            <div className="text-end">
              <Badge
                bg={estado.tipo === "proxima" ? "warning" : "info"}
                text={estado.tipo === "proxima" ? "dark" : "white"}
              >
                {estado.tipo === "proxima"
                  ? `en ${estado.minutosRestantes} min`
                  : clase.horaInicio}
              </Badge>
              <br />
              <small>
                {getTipoIcono(clase.tipo)}
                {clase.tipo}
              </small>
              <br />
              <Link to={`/dashboard/clases/${clase._id}`}>
                <Button variant="link" size="sm" className="p-0 mt-1">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando clases...</p>
      </div>
    );
  }

  // Mensaje cuando no hay cursos
  if (cursos.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <h2 className="fw-bold">
            {esAlumno ? (
              <>
                <FaUserGraduate className="me-2" /> Mis Clases
              </>
            ) : (
              <>📚 Mis Clases</>
            )}
          </h2>
        </div>
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="text-muted">
              {esAlumno ? (
                <>
                  <FaUserGraduate size={50} className="mb-3 text-secondary" />
                  <h5>No estás inscrito en ningún curso</h5>
                  <p>
                    Inscríbete en un curso para ver las clases programadas.
                  </p>
                  <Link to="/dashboard/cursos-disponibles">
                    <Button variant="primary">Ver Cursos Disponibles</Button>
                  </Link>
                </>
              ) : (
                <>
                  <FaChalkboardTeacher
                    size={50}
                    className="mb-3 text-secondary"
                  />
                  <h5>No tienes cursos asignados</h5>
                  <p>Crea un curso para comenzar a programar clases.</p>
                  <Link to="/dashboard/cursos">
                    <Button variant="primary">Ir a Cursos</Button>
                  </Link>
                </>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold">
          {esAlumno ? (
            <>
              <FaUserGraduate className="me-2" /> Mis Clases
            </>
          ) : (
            <>📚 Mis Clases</>
          )}
        </h2>
        <p className="text-muted">
          {esAlumno
            ? "Visualiza las clases de tus cursos y accede a las sesiones virtuales"
            : "Visualiza y gestiona todas tus clases programadas"}
        </p>
      </div>

      {/* ============================================ */}
      {/* ALERTAS DE CLASES EN CURSO Y PRÓXIMAS */}
      {/* ============================================ */}

      {clasesEnCurso.length > 0 && (
        <Alert variant="success" className="d-flex align-items-center mb-4">
          <FaPlay className="me-2 fs-4" />
          <div>
            <strong>
              {clasesEnCurso.length === 1
                ? "¡Tienes una clase en curso!"
                : `¡Tienes ${clasesEnCurso.length} clases en curso!`}
            </strong>
            <span className="ms-2">
              {clasesEnCurso.map((c) => c.titulo).join(", ")}
            </span>
          </div>
        </Alert>
      )}

      {clasesProximas.length > 0 && clasesEnCurso.length === 0 && (
        <Alert variant="warning" className="d-flex align-items-center mb-4">
          <FaExclamationTriangle className="me-2 fs-4" />
          <div>
            <strong>
              {clasesProximas.length === 1
                ? "¡Tienes una clase por comenzar!"
                : `¡Tienes ${clasesProximas.length} clases próximas!`}
            </strong>
            <span className="ms-2">
              {clasesProximas[0].titulo} comienza en{" "}
              {calcularEstadoTiempo(clasesProximas[0]).minutosRestantes} minutos
            </span>
          </div>
        </Alert>
      )}

      {/* ============================================ */}
      {/* CLASES EN CURSO */}
      {/* ============================================ */}

      {clasesEnCurso.length > 0 && (
        <Card className="shadow-sm mb-4 border-success">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">
              <FaPlay className="me-2" />
              {esAlumno ? "Clases en Curso - ¡Únete ahora!" : "Clases en Curso"}{" "}
              ({clasesEnCurso.length})
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {clasesEnCurso.map((clase) => (
                <Col key={clase._id} md={6} lg={4} className="mb-3">
                  <TarjetaClaseEnCurso clase={clase} />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* ============================================ */}
      {/* CLASES PRÓXIMAS (30 min) */}
      {/* ============================================ */}

      {clasesProximas.length > 0 && (
        <Card className="shadow-sm mb-4 border-warning">
          <Card.Header className="bg-warning text-dark">
            <h5 className="mb-0">
              <FaClock className="me-2" />
              Próximas a Iniciar ({clasesProximas.length})
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {clasesProximas.map((clase) => (
                <Col key={clase._id} md={6} lg={4} className="mb-3">
                  <TarjetaClaseProxima clase={clase} />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* ============================================ */}
      {/* CLASES DE HOY */}
      {/* ============================================ */}

      {clasesDeHoy.length > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">
              <FaCalendarDay className="me-2" />
              Agenda de Hoy ({clasesDeHoy.length} clases)
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {clasesDeHoy.map((clase) => (
                <Col key={clase._id} md={6} className="mb-2">
                  <TarjetaClaseHoy clase={clase} />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* ============================================ */}
      {/* FILTROS */}
      {/* ============================================ */}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="fw-bold small">
                Filtrar por Estado
              </Form.Label>
              <Form.Select
                size="sm"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todas">Todas</option>
                <option value="programada">Programadas</option>
                <option value="en_curso">En Curso</option>
                <option value="finalizada">Finalizadas</option>
                <option value="cancelada">Canceladas</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label className="fw-bold small">
                Filtrar por Curso
              </Form.Label>
              <Form.Select
                size="sm"
                value={filtroCurso}
                onChange={(e) => setFiltroCurso(e.target.value)}
              >
                <option value="todos">Todos los cursos</option>
                {cursos.map((curso) => (
                  <option key={curso._id} value={curso._id}>
                    {curso.codigo} - {curso.titulo}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <div className="w-100">
                <div className="text-muted small">
                  <strong>Total:</strong> {clasesFiltradas.length} clase(s)
                  {esAlumno && (
                    <span className="ms-2">
                      | <strong>Cursos:</strong> {cursos.length}
                    </span>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ============================================ */}
      {/* TABS PRINCIPALES */}
      {/* ============================================ */}

      <Tabs defaultActiveKey="tabla" className="mb-3">
        {/* Vista de Tabla */}
        <Tab eventKey="tabla" title="📋 Vista de Tabla">
          {clasesFiltradas.length === 0 ? (
            <Card className="shadow-sm">
              <Card.Body className="text-center text-muted py-5">
                <h5>No hay clases que coincidan con los filtros</h5>
                <p>Prueba ajustando los filtros</p>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <Table striped bordered hover responsive className="mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>Estado</th>
                    <th>Curso</th>
                    <th>Clase</th>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clasesFiltradas.map((clase) => {
                    const estadoTiempo = calcularEstadoTiempo(clase);
                    const esEnCurso = estadoTiempo.tipo === "en_curso";
                    const esProxima = estadoTiempo.tipo === "proxima";

                    return (
                      <tr
                        key={clase._id}
                        className={
                          esEnCurso
                            ? "table-success"
                            : esProxima
                            ? "table-warning"
                            : ""
                        }
                      >
                        <td>
                          {esEnCurso ? (
                            <Badge bg="success" className="pulso">
                              <FaPlay className="me-1" /> En Curso
                            </Badge>
                          ) : esProxima ? (
                            <Badge
                              bg="warning"
                              text="dark"
                              className="pulso-suave"
                            >
                              <FaClock className="me-1" /> en{" "}
                              {estadoTiempo.minutosRestantes}m
                            </Badge>
                          ) : (
                            <Badge bg={getBadgeEstado(clase.estado)}>
                              {clase.estado?.replace("_", " ")}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <strong>{clase.curso.codigo}</strong>
                          <br />
                          <small className="text-muted">
                            {clase.curso.titulo}
                          </small>
                          {esAlumno && clase.curso.docente && (
                            <>
                              <br />
                              <small className="text-primary">
                                <FaChalkboardTeacher
                                  className="me-1"
                                  size={10}
                                />
                                {clase.curso.docente.nombre}
                              </small>
                            </>
                          )}
                        </td>
                        <td>
                          <strong>{clase.titulo}</strong>
                          {clase.descripcion && (
                            <>
                              <br />
                              <small className="text-muted">
                                {clase.descripcion.substring(0, 50)}
                                {clase.descripcion.length > 50 && "..."}
                              </small>
                            </>
                          )}
                        </td>
                        <td>
                          {esHoy(clase.fecha) ? (
                            <Badge bg="info">Hoy</Badge>
                          ) : (
                            formatearFechaCorta(clase.fecha)
                          )}
                        </td>
                        <td>
                          {clase.horaInicio} - {clase.horaFin}
                        </td>
                        <td>
                          {getTipoIcono(clase.tipo)}
                          <Badge bg="info">{clase.tipo}</Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            {(esEnCurso || esProxima) &&
                              clase.tipo === "virtual" &&
                              clase.enlaceReunion && (
                                <Button
                                  variant={esEnCurso ? "success" : "warning"}
                                  size="sm"
                                  href={clase.enlaceReunion}
                                  target="_blank"
                                  title="Unirse a la clase"
                                >
                                  <FaVideo />
                                </Button>
                              )}
                            <Link to={`/dashboard/clases/${clase._id}`}>
                              <Button
                                variant="primary"
                                size="sm"
                                title="Ver detalles"
                              >
                                <FaEye />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          )}
        </Tab>

        {/* Vista de Calendario */}
        <Tab eventKey="calendario" title="📅 Vista de Calendario">
          <Card className="shadow-sm">
            <Card.Body style={{ height: "700px" }}>
              {clasesFiltradas.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <h5>No hay clases que coincidan con los filtros</h5>
                </div>
              ) : (
                <Calendar
                  localizer={localizer}
                  events={eventosCalendario}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  messages={mensajesCalendario}
                  eventPropGetter={eventStyleGetter}
                  views={["month", "week", "day", "agenda"]}
                  defaultView="month"
                  onSelectEvent={(event) => {
                    // Navegar al detalle de la clase
                    window.location.href = `/dashboard/clases/${event.resource._id}`;
                  }}
                  popup
                />
              )}
            </Card.Body>
          </Card>

          {/* Leyenda */}
          <Card className="shadow-sm mt-3">
            <Card.Body>
              <Row className="g-2">
                <Col xs={12}>
                  <strong>Leyenda:</strong>
                  <small className="text-muted ms-2">
                    (Haz clic en una clase para ver sus detalles)
                  </small>
                </Col>
                <Col xs={6} md={2}>
                  <Badge bg="success" className="me-2">
                    ⬤
                  </Badge>
                  En Curso
                </Col>
                <Col xs={6} md={2}>
                  <Badge bg="warning" className="me-2">
                    ⬤
                  </Badge>
                  Próxima
                </Col>
                <Col xs={6} md={2}>
                  <Badge bg="primary" className="me-2">
                    ⬤
                  </Badge>
                  Programada
                </Col>
                <Col xs={6} md={2}>
                  <Badge bg="secondary" className="me-2">
                    ⬤
                  </Badge>
                  Finalizada
                </Col>
                <Col xs={6} md={2}>
                  <Badge bg="danger" className="me-2">
                    ⬤
                  </Badge>
                  Cancelada
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* Vista por Curso */}
        <Tab eventKey="lista" title="📑 Vista por Curso">
          {cursos.length === 0 ? (
            <Card className="shadow-sm">
              <Card.Body className="text-center text-muted py-5">
                <h5>
                  {esAlumno
                    ? "No estás inscrito en ningún curso"
                    : "No tienes cursos asignados"}
                </h5>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {cursos.map((curso) => {
                const clasesCurso = clasesFiltradas.filter(
                  (clase) => clase.curso._id === curso._id
                );

                if (filtroCurso !== "todos" && filtroCurso !== curso._id)
                  return null;

                const clasesEnCursoCurso = clasesCurso.filter(
                  (c) => calcularEstadoTiempo(c).tipo === "en_curso"
                );

                const clasesProximasCurso = clasesCurso.filter(
                  (c) => calcularEstadoTiempo(c).tipo === "proxima"
                );

                return (
                  <Col key={curso._id} xs={12} className="mb-4">
                    <Card
                      className={`shadow-sm ${
                        clasesEnCursoCurso.length > 0
                          ? "border-success"
                          : clasesProximasCurso.length > 0
                          ? "border-warning"
                          : ""
                      }`}
                    >
                      <Card.Header
                        className={`${
                          clasesEnCursoCurso.length > 0
                            ? "bg-success"
                            : clasesProximasCurso.length > 0
                            ? "bg-warning text-dark"
                            : "bg-primary"
                        } text-white`}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-0">
                              {clasesEnCursoCurso.length > 0 && (
                                <FaPlay className="me-2" />
                              )}
                              {clasesProximasCurso.length > 0 &&
                                clasesEnCursoCurso.length === 0 && (
                                  <FaClock className="me-2" />
                                )}
                              {curso.titulo}
                            </h5>
                            <small>{curso.codigo}</small>
                            {esAlumno && curso.docente && (
                              <small className="d-block">
                                <FaChalkboardTeacher className="me-1" />
                                {curso.docente.nombre}
                              </small>
                            )}
                          </div>
                          <div>
                            {clasesEnCursoCurso.length > 0 && (
                              <Badge bg="light" text="success" className="me-2">
                                {clasesEnCursoCurso.length} en curso
                              </Badge>
                            )}
                            {clasesProximasCurso.length > 0 && (
                              <Badge bg="light" text="warning" className="me-2">
                                {clasesProximasCurso.length} próxima(s)
                              </Badge>
                            )}
                            <Badge bg="light" text="dark">
                              {clasesCurso.length} clase(s)
                            </Badge>
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        {clasesCurso.length === 0 ? (
                          <div className="text-center text-muted py-3">
                            No hay clases que coincidan con los filtros
                          </div>
                        ) : (
                          <Table striped hover responsive size="sm">
                            <thead>
                              <tr>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Clase</th>
                                <th>Horario</th>
                                <th>Tipo</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clasesCurso.map((clase) => {
                                const estadoTiempo =
                                  calcularEstadoTiempo(clase);
                                const esEnCurso =
                                  estadoTiempo.tipo === "en_curso";
                                const esProxima =
                                  estadoTiempo.tipo === "proxima";

                                return (
                                  <tr
                                    key={clase._id}
                                    className={
                                      esEnCurso
                                        ? "table-success"
                                        : esProxima
                                        ? "table-warning"
                                        : ""
                                    }
                                  >
                                    <td>
                                      {esEnCurso ? (
                                        <Badge bg="success" className="pulso">
                                          <FaPlay size={10} /> En Curso
                                        </Badge>
                                      ) : esProxima ? (
                                        <Badge bg="warning" text="dark">
                                          en {estadoTiempo.minutosRestantes}m
                                        </Badge>
                                      ) : (
                                        <Badge
                                          bg={getBadgeEstado(clase.estado)}
                                        >
                                          {clase.estado?.replace("_", " ")}
                                        </Badge>
                                      )}
                                    </td>
                                    <td>
                                      {esHoy(clase.fecha) ? (
                                        <Badge bg="info">Hoy</Badge>
                                      ) : (
                                        formatearFechaCorta(clase.fecha)
                                      )}
                                    </td>
                                    <td>
                                      <strong>{clase.titulo}</strong>
                                    </td>
                                    <td>
                                      {clase.horaInicio} - {clase.horaFin}
                                    </td>
                                    <td>
                                      {getTipoIcono(clase.tipo)}
                                      <Badge bg="info" className="text-white">
                                        {clase.tipo}
                                      </Badge>
                                    </td>
                                    <td>
                                      <div className="d-flex gap-1">
                                        {(esEnCurso || esProxima) &&
                                          clase.tipo === "virtual" &&
                                          clase.enlaceReunion && (
                                            <Button
                                              variant={
                                                esEnCurso
                                                  ? "success"
                                                  : "outline-warning"
                                              }
                                              size="sm"
                                              href={clase.enlaceReunion}
                                              target="_blank"
                                              title="Unirse"
                                            >
                                              <FaVideo />
                                            </Button>
                                          )}
                                        <Link
                                          to={`/dashboard/clases/${clase._id}`}
                                        >
                                          <Button
                                            variant="outline-primary"
                                            size="sm"
                                            title="Ver detalles"
                                          >
                                            <FaEye />
                                          </Button>
                                        </Link>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        )}
                      </Card.Body>
                      <Card.Footer className="bg-white text-center">
                        <Link
                          to={`/dashboard/cursos/${curso._id}`}
                          className="text-decoration-none"
                        >
                          Ver detalles del curso →
                        </Link>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Tab>
      </Tabs>

      {/* ============================================ */}
      {/* CSS PERSONALIZADO */}
      {/* ============================================ */}
      <style>{`
        .pulso {
          animation: pulso 1.5s infinite;
        }

        @keyframes pulso {
          0% {
            box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(25, 135, 84, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(25, 135, 84, 0);
          }
        }

        .pulso-suave {
          animation: pulso-suave 2s infinite;
        }

        @keyframes pulso-suave {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }

        .clase-en-curso-card {
          border-width: 2px;
          background: linear-gradient(135deg, #f8fff8 0%, #e8f5e9 100%);
        }

        .clase-proxima-card {
          border-width: 2px;
          background: linear-gradient(135deg, #fffbf0 0%, #fff3e0 100%);
        }

        .rbc-calendar {
          font-family: inherit;
        }

        .rbc-toolbar button {
          color: #495057;
          border: 1px solid #dee2e6;
        }

        .rbc-toolbar button:active,
        .rbc-toolbar button.rbc-active {
          background-color: #0d6efd;
          color: white;
          border-color: #0d6efd;
        }

        .rbc-toolbar button:hover {
          background-color: #e9ecef;
        }

        .rbc-event {
          padding: 2px 5px;
          font-size: 0.85em;
        }

        .rbc-today {
          background-color: #fff3cd;
        }

        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
        }

        .table-success {
          --bs-table-bg: #d1e7dd;
        }

        .table-warning {
          --bs-table-bg: #fff3cd;
        }
      `}</style>
    </div>
  );
};

export default MisClases;