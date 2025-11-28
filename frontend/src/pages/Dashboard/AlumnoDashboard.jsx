// frontend/src/pages/Dashboard/AlumnoDashboard.jsx
import { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Badge, ListGroup, Alert, ProgressBar } from "react-bootstrap";
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
  FaArrowRight
} from "react-icons/fa";
import API from "../../services/api";

const AlumnoDashboard = ({ usuario }) => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
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

  // Función para obtener el color según la nota
  const getNotaColor = (nota) => {
    if (nota === null) return "secondary";
    const numNota = parseFloat(nota);
    if (numNota >= 80) return "success";
    if (numNota >= 60) return "primary";
    if (numNota >= 40) return "warning";
    return "danger";
  };

  // Función para formatear fecha relativa
  const formatearFechaRelativa = (fecha) => {
    const ahora = new Date();
    const fechaObj = new Date(fecha);
    const diff = fechaObj - ahora;
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (dias < 0) return "Vencido";
    if (dias === 0) return "Hoy";
    if (dias === 1) return "Mañana";
    if (dias <= 7) return `En ${dias} días`;
    return fechaObj.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  };

  // Función para obtener el ícono del tipo de actividad
  const getTipoIcon = (tipo) => {
    return tipo === "examen" 
      ? <FaClipboardList className="text-primary" />
      : <FaFileAlt className="text-warning" />;
  };

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
      {/* Header de bienvenida */}
      <div className="mb-4">
        <h2 className="text-primary fw-bold">¡Hola, {usuario.nombre}! 👋</h2>
        <p className="text-muted mb-0">
          Bienvenido a tu panel de estudiante. Aquí encontrarás un resumen de tus actividades.
        </p>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <Row className="mb-4 g-3">
        <Col xs={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-primary text-white">
            <Card.Body className="text-center py-4">
              <FaTrophy size={32} className="mb-2 opacity-75" />
              <h2 className="mb-0 fw-bold">
                {stats.promedioGeneral ? `${stats.promedioGeneral}%` : "-"}
              </h2>
              <small className="opacity-75">Promedio General</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-success text-white">
            <Card.Body className="text-center py-4">
              <FaBookOpen size={32} className="mb-2 opacity-75" />
              <h2 className="mb-0 fw-bold">{stats.cursosInscritos || 0}</h2>
              <small className="opacity-75">Cursos Inscritos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-info text-white">
            <Card.Body className="text-center py-4">
              <FaCheckCircle size={32} className="mb-2 opacity-75" />
              <h2 className="mb-0 fw-bold">
                {(stats.tareasCompletadas || 0) + (stats.examenesRealizados || 0)}
              </h2>
              <small className="opacity-75">Actividades Completadas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} lg={3}>
          <Card className="shadow-sm border-0 h-100 bg-warning text-dark">
            <Card.Body className="text-center py-4">
              <FaExclamationTriangle size={32} className="mb-2 opacity-75" />
              <h2 className="mb-0 fw-bold">
                {(stats.tareasPendientes || 0) + (stats.examenesPendientes || 0)}
              </h2>
              <small className="opacity-75">Pendientes</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Columna izquierda */}
        <Col lg={8}>
          {/* Próximas entregas */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <FaClock className="me-2 text-danger" />
                  Próximas Entregas
                </h5>
                <Link to="/dashboard/mis-tareas" className="text-decoration-none small">
                  Ver todas <FaArrowRight size={12} />
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {datos?.proximasEntregas?.length > 0 ? (
                <ListGroup variant="flush">
                  {datos.proximasEntregas.map((item, index) => (
                    <ListGroup.Item 
                      key={index} 
                      className="d-flex justify-content-between align-items-center py-3"
                    >
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          {getTipoIcon(item.tipo)}
                        </div>
                        <div>
                          <h6 className="mb-0">{item.titulo}</h6>
                          <small className="text-muted">{item.curso}</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <Badge 
                          bg={
                            new Date(item.fechaLimite) - new Date() < 86400000 * 2 
                              ? "danger" 
                              : "secondary"
                          }
                          className="mb-1"
                        >
                          {formatearFechaRelativa(item.fechaLimite)}
                        </Badge>
                        <small className="text-muted d-block">
                          {new Date(item.fechaLimite).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </small>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <FaCheckCircle size={40} className="text-success mb-2" />
                  <p className="text-muted mb-0">¡No tienes entregas pendientes próximas!</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Mis Cursos con Progreso */}
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
                <div>
                  {datos.cursos.map((curso) => (
                    <div key={curso._id} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <h6 className="mb-0">{curso.titulo}</h6>
                          <small className="text-muted">{curso.codigo} • {curso.docente}</small>
                        </div>
                        <Badge bg={getNotaColor(curso.promedio)} className="px-3 py-2">
                          {curso.promedio ? `${curso.promedio}%` : "Sin notas"}
                        </Badge>
                      </div>
                      <ProgressBar className="mb-1" style={{ height: "10px" }}>
                        <ProgressBar 
                          variant={getNotaColor(curso.promedio)}
                          now={curso.totalActividades > 0 
                            ? (curso.actividadesCompletadas / curso.totalActividades) * 100 
                            : 0
                          }
                        />
                      </ProgressBar>
                      <small className="text-muted">
                        {curso.actividadesCompletadas} de {curso.totalActividades} actividades completadas
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="mb-0">
                  <FaBookOpen className="me-2" />
                  No estás inscrito en ningún curso aún.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Columna derecha - Accesos rápidos */}
        <Col lg={4}>
          {/* Accesos Rápidos */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">
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
                  <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                    <FaClipboardList className="text-primary" size={20} />
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
                    <small className="text-muted">Comunicación</small>
                  </div>
                </ListGroup.Item>

                <ListGroup.Item 
                  action 
                  as={Link} 
                  to="/dashboard/notificaciones"
                  className="d-flex align-items-center py-3"
                >
                  <div className="bg-danger bg-opacity-10 p-2 rounded me-3">
                    <FaBell className="text-danger" size={20} />
                  </div>
                  <div>
                    <h6 className="mb-0">Notificaciones</h6>
                    <small className="text-muted">Avisos importantes</small>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Resumen de Actividad */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold">
                <FaChartLine className="me-2 text-info" />
                Resumen de Actividad
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col xs={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <FaClipboardList className="text-primary mb-2" size={24} />
                    <h4 className="mb-0">{stats.examenesRealizados || 0}</h4>
                    <small className="text-muted">Exámenes realizados</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <FaClock className="text-warning mb-2" size={24} />
                    <h4 className="mb-0">{stats.examenesPendientes || 0}</h4>
                    <small className="text-muted">Exámenes pendientes</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <FaCheckCircle className="text-success mb-2" size={24} />
                    <h4 className="mb-0">{stats.tareasCompletadas || 0}</h4>
                    <small className="text-muted">Tareas entregadas</small>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-3 bg-light rounded">
                    <FaExclamationTriangle className="text-danger mb-2" size={24} />
                    <h4 className="mb-0">{stats.tareasPendientes || 0}</h4>
                    <small className="text-muted">Tareas pendientes</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AlumnoDashboard;