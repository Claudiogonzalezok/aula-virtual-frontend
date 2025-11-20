// frontend/src/pages/Reportes/EstadisticasAlumno.jsx
import { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { obtenerReporteAlumno } from "../../services/reporteService";
import GraficoRendimiento from "../../components/Reportes/GraficoRendimiento";
import TablaCalificaciones from "../../components/Reportes/TablaCalificaciones";
import ExportarReporte from "../../components/Reportes/ExportarReporte";
import {
  FaUser,
  FaChartLine,
  FaTrophy,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

const EstadisticasAlumno = () => {
  const { alumnoId } = useParams();
  const { usuario } = useContext(AuthContext);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Si no se pasa alumnoId, usar el usuario actual (para alumnos viendo sus propias estadísticas)
  const idAlumno = alumnoId || usuario._id;

  useEffect(() => {
    cargarEstadisticas();
  }, [idAlumno]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await obtenerReporteAlumno(idAlumno);
      setEstadisticas(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const obtenerColorPromedio = (promedio) => {
    if (promedio >= 90) return "success";
    if (promedio >= 70) return "primary";
    if (promedio >= 60) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando estadísticas...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!estadisticas) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">No se encontraron estadísticas</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FaUser className="me-2" />
                Estadísticas del Alumno
              </h2>
              <p className="text-muted mb-0">
                {estadisticas.alumno?.nombre || "Alumno"}
              </p>
            </div>
            <ExportarReporte
              datos={estadisticas}
              nombreArchivo={`estadisticas-${estadisticas.alumno?.nombre || "alumno"}`}
            />
          </div>
        </Col>
      </Row>

      {/* Tarjetas de Resumen */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm border-primary">
            <Card.Body>
              <FaTrophy size={40} className="text-warning mb-2" />
              <h3>
                {estadisticas.promedioGeneral
                  ? estadisticas.promedioGeneral.toFixed(2)
                  : "N/A"}
              </h3>
              <p className="text-muted mb-0">Promedio General</p>
              <ProgressBar
                now={estadisticas.promedioGeneral || 0}
                variant={obtenerColorPromedio(estadisticas.promedioGeneral)}
                className="mt-2"
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow-sm border-success">
            <Card.Body>
              <FaCheckCircle size={40} className="text-success mb-2" />
              <h3>{estadisticas.evaluacionesAprobadas || 0}</h3>
              <p className="text-muted mb-0">Aprobadas</p>
              <Badge bg="success" className="mt-2">
                {estadisticas.porcentajeAprobadas?.toFixed(1) || 0}%
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow-sm border-warning">
            <Card.Body>
              <FaClock size={40} className="text-warning mb-2" />
              <h3>{estadisticas.evaluacionesPendientes || 0}</h3>
              <p className="text-muted mb-0">Pendientes</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow-sm border-info">
            <Card.Body>
              <FaChartLine size={40} className="text-info mb-2" />
              <h3>{estadisticas.cursosInscritos || 0}</h3>
              <p className="text-muted mb-0">Cursos Inscritos</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="mb-4">
        <Col md={6}>
          <GraficoRendimiento
            datos={estadisticas.rendimientoPorCurso || []}
            tipo="barras"
            titulo="📊 Rendimiento por Curso"
          />
        </Col>
        <Col md={6}>
          <GraficoRendimiento
            datos={estadisticas.evolucionTemporal || []}
            tipo="linea"
            titulo="📈 Evolución Temporal"
          />
        </Col>
      </Row>

      {/* Tabla de Calificaciones */}
      <Row>
        <Col md={12}>
          <TablaCalificaciones
            calificaciones={estadisticas.calificaciones || []}
            mostrarPromedio={true}
          />
        </Col>
      </Row>

      {/* Información Adicional */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">📚 Asistencia</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Clases Asistidas:</span>
                <Badge bg="success">
                  {estadisticas.clasesAsistidas || 0}
                </Badge>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Clases Totales:</span>
                <Badge bg="primary">{estadisticas.clasesTotales || 0}</Badge>
              </div>
              <ProgressBar
                now={estadisticas.porcentajeAsistencia || 0}
                label={`${estadisticas.porcentajeAsistencia?.toFixed(1) || 0}%`}
                variant="success"
                className="mt-3"
              />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h6 className="mb-0">🎯 Participación</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Tareas Entregadas:</span>
                <Badge bg="info">{estadisticas.tareasEntregadas || 0}</Badge>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Foros Participados:</span>
                <Badge bg="warning">
                  {estadisticas.forosParticipados || 0}
                </Badge>
              </div>
              <div className="d-flex justify-content-between">
                <span>Mensajes Enviados:</span>
                <Badge bg="secondary">
                  {estadisticas.mensajesEnviados || 0}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EstadisticasAlumno;