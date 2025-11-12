import { useState, useEffect, useContext } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Row,
  Col,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { FaArrowLeft, FaEdit, FaEye, FaCheckCircle, FaClock } from "react-icons/fa";

const EstadisticasExamen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const [examen, setExamen] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [examenRes, estadisticasRes] = await Promise.all([
        API.get(`/examenes/${id}`),
        API.get(`/examenes/${id}/estadisticas`),
      ]);
      setExamen(examenRes.data);
      setEstadisticas(estadisticasRes.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert(error.response?.data?.msg || "Error al cargar estadísticas");
      navigate("/dashboard/examenes");
    } finally {
      setLoading(false);
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

  const getBadgeEstado = (intento) => {
    if (intento.estado === "en_progreso") return { bg: "warning", texto: "En Progreso" };
    if (intento.estado === "completado") return { bg: "info", texto: "Pendiente Calificación" };
    
    const aprobado = intento.porcentaje >= examen.configuracion.notaAprobacion;
    return {
      bg: aprobado ? "success" : "danger",
      texto: aprobado ? "Aprobado" : "Reprobado",
    };
  };

  const calcularDistribucion = () => {
    if (!estadisticas || estadisticas.intentosCalificados === 0) return [];

    const rangos = [
      { label: "0-20%", min: 0, max: 20, count: 0 },
      { label: "21-40%", min: 21, max: 40, count: 0 },
      { label: "41-60%", min: 41, max: 60, count: 0 },
      { label: "61-80%", min: 61, max: 80, count: 0 },
      { label: "81-100%", min: 81, max: 100, count: 0 },
    ];

    estadisticas.intentosDetalle.forEach((intento) => {
      rangos.forEach((rango) => {
        if (intento.porcentaje >= rango.min && intento.porcentaje <= rango.max) {
          rango.count++;
        }
      });
    });

    return rangos;
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!examen || !estadisticas) {
    return <Alert variant="danger">Error al cargar datos</Alert>;
  }

  const distribucion = calcularDistribucion();

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate("/dashboard/examenes")}
        >
          <FaArrowLeft className="me-2" />
          Volver
        </Button>
      </div>

      {/* Información del examen */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">{examen.titulo}</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>Curso:</strong> {examen.curso.titulo}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <Badge bg={examen.estado === "publicado" ? "success" : "secondary"}>
                  {examen.estado}
                </Badge>
              </p>
              <p>
                <strong>Preguntas:</strong> {examen.preguntas.length}
              </p>
              <p>
                <strong>Puntaje Total:</strong> {examen.puntajeTotal} pts
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Duración:</strong> {examen.configuracion.duracionMinutos} min
              </p>
              <p>
                <strong>Nota de Aprobación:</strong> {examen.configuracion.notaAprobacion}%
              </p>
              <p>
                <strong>Intentos Permitidos:</strong> {examen.configuracion.intentosPermitidos}
              </p>
              <p>
                <strong>Fecha Apertura:</strong> {formatearFecha(examen.fechaApertura)}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Estadísticas generales */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h2 className="text-primary mb-0">{estadisticas.totalIntentos}</h2>
              <small className="text-muted">Total Intentos</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h2 className="text-success mb-0">{estadisticas.intentosCalificados}</h2>
              <small className="text-muted">Calificados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h2 className="text-info mb-0">{estadisticas.intentosPendientes}</h2>
              <small className="text-muted">Pendientes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h2 className="text-warning mb-0">{estadisticas.promedioGeneral}%</h2>
              <small className="text-muted">Promedio</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Aprobados vs Reprobados */}
      {estadisticas.intentosCalificados > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">Rendimiento General</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Aprobados</span>
                    <strong className="text-success">{estadisticas.alumnosAprobados}</strong>
                  </div>
                  <ProgressBar
                    now={(estadisticas.alumnosAprobados / estadisticas.intentosCalificados) * 100}
                    variant="success"
                  />
                </div>
                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Reprobados</span>
                    <strong className="text-danger">{estadisticas.alumnosReprobados}</strong>
                  </div>
                  <ProgressBar
                    now={(estadisticas.alumnosReprobados / estadisticas.intentosCalificados) * 100}
                    variant="danger"
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Mejor Nota:</strong>{" "}
                  <Badge bg="success">{estadisticas.mejorNota}%</Badge>
                </div>
                <div>
                  <strong>Peor Nota:</strong>{" "}
                  <Badge bg="danger">{estadisticas.peorNota}%</Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Distribución de notas */}
      {estadisticas.intentosCalificados > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">Distribución de Notas</h5>
          </Card.Header>
          <Card.Body>
            {distribucion.map((rango) => (
              <div key={rango.label} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>{rango.label}</span>
                  <strong>{rango.count} alumno(s)</strong>
                </div>
                <ProgressBar
                  now={(rango.count / estadisticas.intentosCalificados) * 100}
                  label={`${((rango.count / estadisticas.intentosCalificados) * 100).toFixed(0)}%`}
                  variant="info"
                />
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Lista de intentos */}
      <Card className="shadow-sm">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">Intentos de Alumnos</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {examen.intentos && examen.intentos.length > 0 ? (
            <Table striped hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Alumno</th>
                  <th>Intento #</th>
                  <th>Estado</th>
                  <th>Puntuación</th>
                  <th>Porcentaje</th>
                  <th>Fecha Entrega</th>
                  <th>Tiempo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {examen.intentos.map((intento) => {
                  const badge = getBadgeEstado(intento);
                  return (
                    <tr key={intento._id}>
                      <td>
                        <strong>{intento.alumno.nombre}</strong>
                        <br />
                        <small className="text-muted">{intento.alumno.email}</small>
                      </td>
                      <td className="text-center">
                        <Badge bg="secondary">{intento.intentoNumero}</Badge>
                      </td>
                      <td>
                        <Badge bg={badge.bg}>{badge.texto}</Badge>
                      </td>
                      <td className="text-center">
                        {intento.estado === "en_progreso" ? (
                          <FaClock className="text-warning" />
                        ) : (
                          <>
                            {intento.puntuacionTotal} / {examen.puntajeTotal}
                          </>
                        )}
                      </td>
                      <td className="text-center">
                        {intento.estado === "en_progreso" ? (
                          "-"
                        ) : (
                          <Badge
                            bg={
                              intento.porcentaje >= examen.configuracion.notaAprobacion
                                ? "success"
                                : "danger"
                            }
                          >
                            {intento.porcentaje}%
                          </Badge>
                        )}
                      </td>
                      <td>
                        {intento.fechaEntrega
                          ? formatearFecha(intento.fechaEntrega)
                          : "En progreso"}
                      </td>
                      <td className="text-center">
                        {intento.tiempoTranscurrido
                          ? `${intento.tiempoTranscurrido} min`
                          : "-"}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="info"
                            size="sm"
                            title="Ver respuestas"
                            onClick={() =>
                              navigate(
                                `/dashboard/examenes/${id}/intento/${intento._id}/ver`
                              )
                            }
                          >
                            <FaEye />
                          </Button>
                          {intento.estado === "completado" && (
                            <Button
                              variant="warning"
                              size="sm"
                              title="Calificar"
                              onClick={() =>
                                navigate(
                                  `/dashboard/examenes/${id}/intento/${intento._id}/calificar`
                                )
                              }
                            >
                              <FaEdit />
                            </Button>
                          )}
                          {intento.estado === "calificado" && (
                            <FaCheckCircle className="text-success" size={20} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted p-5">
              Aún no hay intentos de alumnos
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default EstadisticasExamen;