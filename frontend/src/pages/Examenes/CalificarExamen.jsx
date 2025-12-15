import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Alert,
  Badge,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { FaArrowLeft, FaSave, FaCheckCircle } from "react-icons/fa";
import { formatearFechaHoraCompleta } from "../../utils/dateUtils";

const CalificarExamen = () => {
  const { id, intentoId } = useParams();
  const navigate = useNavigate();
  const [examen, setExamen] = useState(null);
  const [intento, setIntento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [retroalimentacion, setRetroalimentacion] = useState("");
  const [calificaciones, setCalificaciones] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/examenes/${id}`);
      setExamen(data);

      const intentoEncontrado = data.intentos.find((i) => i._id === intentoId);
      if (!intentoEncontrado) {
        alert("Intento no encontrado");
        navigate(`/dashboard/examenes/${id}/estadisticas`);
        return;
      }

      setIntento(intentoEncontrado);
      setRetroalimentacion(intentoEncontrado.retroalimentacion || "");

      // Inicializar calificaciones
      const califs = {};
      intentoEncontrado.respuestas.forEach((resp) => {
        const pregunta = data.preguntas.find((p) => p._id.toString() === resp.pregunta.toString());
        if (pregunta && (pregunta.tipo === "corta" || pregunta.tipo === "desarrollo")) {
          califs[resp.pregunta] = {
            puntaje: resp.puntajeObtenido || 0,
            comentario: resp.comentarioDocente || "",
            puntajeMaximo: pregunta.puntaje,
          };
        }
      });
      setCalificaciones(califs);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar el examen");
      navigate("/dashboard/examenes");
    } finally {
      setLoading(false);
    }
  };

  const actualizarCalificacion = (preguntaId, campo, valor) => {
    setCalificaciones({
      ...calificaciones,
      [preguntaId]: {
        ...calificaciones[preguntaId],
        [campo]: valor,
      },
    });
  };

  const guardarCalificaciones = async () => {
    setGuardando(true);
    try {
      const calificacionesArray = Object.entries(calificaciones).map(
        ([preguntaId, datos]) => ({
          preguntaId,
          puntaje: parseFloat(datos.puntaje),
          comentario: datos.comentario,
        })
      );

      await API.post(`/examenes/${id}/calificar`, {
        intentoId,
        calificaciones: calificacionesArray,
        retroalimentacion,
      });

      alert("Calificación guardada exitosamente");
      navigate(`/dashboard/examenes/${id}/estadisticas`);
    } catch (error) {
      console.error("Error al guardar calificación:", error);
      alert(error.response?.data?.msg || "Error al guardar calificación");
    } finally {
      setGuardando(false);
    }
  };

  const calcularPuntajeTotal = () => {
    let total = 0;

    // Sumar puntajes automáticos
    intento.respuestas.forEach((resp) => {
      const pregunta = examen.preguntas.find(
        (p) => p._id.toString() === resp.pregunta.toString()
      );
      if (pregunta && pregunta.tipo !== "corta" && pregunta.tipo !== "desarrollo") {
        total += resp.puntajeObtenido || 0;
      }
    });

    // Sumar calificaciones manuales
    Object.values(calificaciones).forEach((cal) => {
      total += parseFloat(cal.puntaje) || 0;
    });

    return total.toFixed(2);
  };

  const calcularPorcentaje = () => {
    const puntaje = parseFloat(calcularPuntajeTotal());
    return ((puntaje / examen.puntajeTotal) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!examen || !intento) {
    return <Alert variant="danger">Error al cargar datos</Alert>;
  }

  const preguntasAbiertas = examen.preguntas.filter(
    (p) => p.tipo === "corta" || p.tipo === "desarrollo"
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(`/dashboard/examenes/${id}/estadisticas`)}
        >
          <FaArrowLeft className="me-2" />
          Volver a Estadísticas
        </Button>
      </div>

      {/* Información del intento */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Calificar Intento</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>Examen:</strong> {examen.titulo}
              </p>
              <p>
                <strong>Alumno:</strong> {intento.alumno.nombre}
              </p>
              <p>
                <strong>Email:</strong> {intento.alumno.email}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Intento #:</strong> {intento.intentoNumero}
              </p>
              <p>
                <strong>Fecha de Entrega:</strong>{" "}
                {formatearFechaHoraCompleta(intento.fechaEntrega)}
              </p>
              <p>
                <strong>Tiempo Transcurrido:</strong> {intento.tiempoTranscurrido} minutos
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Resumen de calificación automática */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-success text-white">
          <h5 className="mb-0">
            <FaCheckCircle className="me-2" />
            Preguntas Calificadas Automáticamente
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {intento.respuestas.map((resp) => {
              const pregunta = examen.preguntas.find(
                (p) => p._id.toString() === resp.pregunta.toString()
              );
              if (!pregunta || pregunta.tipo === "corta" || pregunta.tipo === "desarrollo")
                return null;

              return (
                <Col md={6} key={resp.pregunta} className="mb-3">
                  <Card className={resp.esCorrecta ? "border-success" : "border-danger"}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="info">{pregunta.tipo}</Badge>
                        <Badge bg={resp.esCorrecta ? "success" : "danger"}>
                          {resp.puntajeObtenido} / {pregunta.puntaje} pts
                        </Badge>
                      </div>
                      <p className="mb-2">
                        <strong>{pregunta.pregunta}</strong>
                      </p>
                      <p className="mb-0 small text-muted">
                        {resp.esCorrecta ? "✓ Correcta" : "✗ Incorrecta"}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card.Body>
      </Card>

      {/* Preguntas para calificar manualmente */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-warning text-dark">
          <h5 className="mb-0">Preguntas para Calificar Manualmente</h5>
        </Card.Header>
        <Card.Body>
          {preguntasAbiertas.length === 0 ? (
            <Alert variant="info">No hay preguntas que requieran calificación manual</Alert>
          ) : (
            preguntasAbiertas.map((pregunta, index) => {
              const respuesta = intento.respuestas.find(
                (r) => r.pregunta.toString() === pregunta._id.toString()
              );

              return (
                <Card key={pregunta._id} className="mb-4 border">
                  <Card.Body>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Badge bg="secondary" className="me-2">
                            Pregunta {index + 1}
                          </Badge>
                          <Badge bg="info">{pregunta.tipo}</Badge>
                        </div>
                        <Badge bg="dark">{pregunta.puntaje} pts disponibles</Badge>
                      </div>
                      <h6 className="mt-2">{pregunta.pregunta}</h6>
                    </div>

                    <Alert variant="light" className="mb-3">
                      <strong>Respuesta del alumno:</strong>
                      <p className="mb-0 mt-2">
                        {respuesta?.respuesta || (
                          <em className="text-muted">Sin respuesta</em>
                        )}
                      </p>
                    </Alert>

                    <Row>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>
                            Puntaje <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            max={pregunta.puntaje}
                            step="0.5"
                            value={calificaciones[pregunta._id]?.puntaje || 0}
                            onChange={(e) =>
                              actualizarCalificacion(pregunta._id, "puntaje", e.target.value)
                            }
                          />
                          <Form.Text className="text-muted">
                            Máximo: {pregunta.puntaje} pts
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={9}>
                        <Form.Group>
                          <Form.Label>Comentario para el alumno</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Escribe un comentario sobre la respuesta..."
                            value={calificaciones[pregunta._id]?.comentario || ""}
                            onChange={(e) =>
                              actualizarCalificacion(pregunta._id, "comentario", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })
          )}
        </Card.Body>
      </Card>

      {/* Retroalimentación general */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0">Retroalimentación General</h5>
        </Card.Header>
        <Card.Body>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Escribe una retroalimentación general para el alumno sobre su desempeño en el examen..."
              value={retroalimentacion}
              onChange={(e) => setRetroalimentacion(e.target.value)}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Resumen y botón de guardar */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">Resumen de Calificación</h5>
        </Card.Header>
        <Card.Body>
          <Row className="text-center">
            <Col md={4}>
              <h3 className="text-primary">{calcularPuntajeTotal()}</h3>
              <small className="text-muted">Puntaje Total / {examen.puntajeTotal}</small>
            </Col>
            <Col md={4}>
              <h3
                className={
                  parseFloat(calcularPorcentaje()) >= examen.configuracion.notaAprobacion
                    ? "text-success"
                    : "text-danger"
                }
              >
                {calcularPorcentaje()}%
              </h3>
              <small className="text-muted">Porcentaje</small>
            </Col>
            <Col md={4}>
              <h3
                className={
                  parseFloat(calcularPorcentaje()) >= examen.configuracion.notaAprobacion
                    ? "text-success"
                    : "text-danger"
                }
              >
                {parseFloat(calcularPorcentaje()) >= examen.configuracion.notaAprobacion
                  ? "APROBADO"
                  : "REPROBADO"}
              </h3>
              <small className="text-muted">
                Nota mínima: {examen.configuracion.notaAprobacion}%
              </small>
            </Col>
          </Row>

          <hr />

          <div className="d-grid gap-2">
            <Button
              variant="success"
              size="lg"
              onClick={guardarCalificaciones}
              disabled={guardando}
            >
              <FaSave className="me-2" />
              {guardando ? "Guardando..." : "Guardar Calificación"}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => navigate(`/dashboard/examenes/${id}/estadisticas`)}
            >
              Cancelar
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CalificarExamen;
