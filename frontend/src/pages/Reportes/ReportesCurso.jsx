// frontend/src/pages/Reportes/ReportesCurso.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Table,
  Badge,
  Button,
  Form,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { obtenerReporteCurso } from "../../services/reporteService";
import GraficoRendimiento from "../../components/Reportes/GraficoRendimiento";
import TablaCalificaciones from "../../components/Reportes/TablaCalificaciones";
import ExportarReporte from "../../components/Reportes/ExportarReporte";
import {
  FaBookOpen,
  FaUsers,
  FaTasks,
  FaChartLine,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const ReportesCurso = () => {
  const { cursoId } = useParams();
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    cargarReporte();
  }, [cursoId, filtroEstado]);

  const cargarReporte = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEstado !== "todos") {
        params.estado = filtroEstado;
      }
      const data = await obtenerReporteCurso(cursoId, params);
      setReporte(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al cargar reporte");
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
        <p className="mt-3">Cargando reporte del curso...</p>
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

  if (!reporte) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">No se encontró el reporte</Alert>
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
                <FaBookOpen className="me-2" />
                Reporte del Curso
              </h2>
              <p className="text-muted mb-0">
                {reporte.curso?.nombre || "Curso"}
              </p>
            </div>
            <ExportarReporte
              datos={reporte}
              nombreArchivo={`reporte-${reporte.curso?.nombre || "curso"}`}
            />
          </div>
        </Col>
      </Row>

      {/* Tarjetas de Resumen */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm border-primary">
            <Card.Body>
              <FaUsers size={40} className="text-primary mb-2" />
              <h3>{reporte.totalAlumnos || 0}</h3>
              <p className="text-muted mb-0">Total Alumnos</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow-sm border-success">
            <Card.Body>
              <FaCheckCircle size={40} className="text-success mb-2" />
              <h3>
                {reporte.promedioGeneral
                  ? reporte.promedioGeneral.toFixed(2)
                  : "N/A"}
              </h3>
              <p className="text-muted mb-0">Promedio del Curso</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow-sm border-warning">
            <Card.Body>
              <FaTasks size={40} className="text-warning mb-2" />
              <h3>{reporte.tareasTotal || 0}</h3>
              <p className="text-muted mb-0">Tareas Asignadas</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center shadow-sm border-info">
            <Card.Body>
              <FaChartLine size={40} className="text-info mb-2" />
              <h3>{reporte.examenesTotal || 0}</h3>
              <p className="text-muted mb-0">Exámenes Realizados</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filtrar por Estado</Form.Label>
                <Form.Select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los alumnos</option>
                  <option value="aprobados">Aprobados</option>
                  <option value="reprobados">Reprobados</option>
                  <option value="pendientes">Pendientes</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs con diferentes vistas */}
      <Tabs defaultActiveKey="alumnos" className="mb-4">
        {/* Tab Alumnos */}
        <Tab eventKey="alumnos" title="👥 Alumnos">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Lista de Alumnos y Rendimiento</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Alumno</th>
                      <th className="text-center">Promedio</th>
                      <th className="text-center">Tareas</th>
                      <th className="text-center">Exámenes</th>
                      <th className="text-center">Estado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.alumnos?.map((alumno, index) => (
                      <tr key={alumno._id}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{alumno.nombre}</strong>
                          <br />
                          <small className="text-muted">{alumno.email}</small>
                        </td>
                        <td className="text-center">
                          <Badge
                            bg={obtenerColorPromedio(alumno.promedio)}
                            className="fs-6 px-3 py-2"
                          >
                            {alumno.promedio?.toFixed(2) || "N/A"}
                          </Badge>
                        </td>
                        <td className="text-center">
                          {alumno.tareasEntregadas || 0} /{" "}
                          {reporte.tareasTotal || 0}
                        </td>
                        <td className="text-center">
                          {alumno.examenesRealizados || 0} /{" "}
                          {reporte.examenesTotal || 0}
                        </td>
                        <td className="text-center">
                          {alumno.promedio >= 60 ? (
                            <Badge bg="success">
                              <FaCheckCircle className="me-1" />
                              Aprobado
                            </Badge>
                          ) : (
                            <Badge bg="danger">
                              <FaTimesCircle className="me-1" />
                              Reprobado
                            </Badge>
                          )}
                        </td>
                        <td className="text-center">
                          <Link to={`/dashboard/reportes/alumno/${alumno._id}`}>
                            <Button variant="outline-primary" size="sm">
                              <FaEye className="me-1" />
                              Ver Detalle
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        {/* Tab Gráficos */}
        <Tab eventKey="graficos" title="📊 Gráficos">
          <Row className="mb-4">
            <Col md={6}>
              <GraficoRendimiento
                datos={reporte.distribucionNotas || []}
                tipo="torta"
                titulo="Distribución de Calificaciones"
              />
            </Col>
            <Col md={6}>
              <GraficoRendimiento
                datos={reporte.rendimientoPorEvaluacion || []}
                tipo="barras"
                titulo="Rendimiento por Evaluación"
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <GraficoRendimiento
                datos={reporte.evolucionTemporal || []}
                tipo="linea"
                titulo="Evolución del Rendimiento"
              />
            </Col>
          </Row>
        </Tab>

        {/* Tab Evaluaciones */}
        <Tab eventKey="evaluaciones" title="📝 Evaluaciones">
          <TablaCalificaciones
            calificaciones={reporte.evaluaciones || []}
            mostrarPromedio={false}
          />
        </Tab>

        {/* Tab Estadísticas */}
        <Tab eventKey="estadisticas" title="📈 Estadísticas">
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header className="bg-success text-white">
                  <h6 className="mb-0">✅ Rendimiento General</h6>
                </Card.Header>
                <Card.Body>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td>Promedio más alto:</td>
                        <td className="text-end">
                          <strong>
                            {reporte.promedioMasAlto?.toFixed(2) || "N/A"}
                          </strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Promedio más bajo:</td>
                        <td className="text-end">
                          <strong>
                            {reporte.promedioMasBajo?.toFixed(2) || "N/A"}
                          </strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Tasa de aprobación:</td>
                        <td className="text-end">
                          <Badge bg="success">
                            {reporte.tasaAprobacion?.toFixed(1) || 0}%
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>Tasa de reprobación:</td>
                        <td className="text-end">
                          <Badge bg="danger">
                            {reporte.tasaReprobacion?.toFixed(1) || 0}%
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">📚 Actividades</h6>
                </Card.Header>
                <Card.Body>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td>Tareas entregadas a tiempo:</td>
                        <td className="text-end">
                          <strong>
                            {reporte.tareasATiempo || 0} /{" "}
                            {reporte.tareasTotal || 0}
                          </strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Tareas con retraso:</td>
                        <td className="text-end">
                          <strong>{reporte.tareasRetrasadas || 0}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Participación en foros:</td>
                        <td className="text-end">
                          <Badge bg="primary">
                            {reporte.participacionForos || 0}%
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>Asistencia promedio:</td>
                        <td className="text-end">
                          <Badge bg="success">
                            {reporte.asistenciaPromedio?.toFixed(1) || 0}%
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ReportesCurso;