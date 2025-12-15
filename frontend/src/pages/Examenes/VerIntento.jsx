import { useState, useEffect, useContext } from "react";
import {
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { formatearFechaHoraCompleta } from "../../utils/dateUtils";

const VerIntento = () => {
  const { id, intentoId } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const [examen, setExamen] = useState(null);
  const [intento, setIntento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/examenes/${id}`);
      setExamen(data);

      let intentoEncontrado;
      
      if (usuario.rol === "alumno") {
        // Alumno solo ve sus propios intentos
        intentoEncontrado = data.misIntentos?.find((i) => i._id === intentoId);
      } else {
        // Docente puede ver todos los intentos
        intentoEncontrado = data.intentos?.find((i) => i._id === intentoId);
      }

      if (!intentoEncontrado) {
        alert("Intento no encontrado");
        navigate(-1);
        return;
      }

      setIntento(intentoEncontrado);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar el examen");
      navigate("/dashboard/examenes");
    } finally {
      setLoading(false);
    }
  };

  const getIconoRespuesta = (esCorrecta) => {
    if (esCorrecta === null) return <FaClock className="text-warning" />;
    return esCorrecta ? (
      <FaCheckCircle className="text-success" />
    ) : (
      <FaTimesCircle className="text-danger" />
    );
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

  const mostrarRespuestasCorrectas =
    intento.estado === "calificado" &&
    (examen.configuracion.mostrarRespuestas || usuario.rol !== "alumno");

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" />
          Volver
        </Button>
      </div>

      {/* Información del intento */}
      <Card className="shadow-sm mb-4">
        <Card.Header
          className={
            intento.estado === "calificado"
              ? intento.porcentaje >= examen.configuracion.notaAprobacion
                ? "bg-success text-white"
                : "bg-danger text-white"
              : "bg-primary text-white"
          }
        >
          <h4 className="mb-0">{examen.titulo}</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              {usuario.rol !== "alumno" && (
                <p>
                  <strong>Alumno:</strong> {intento.alumno?.nombre}
                </p>
              )}
              <p>
                <strong>Intento #:</strong> {intento.intentoNumero}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <Badge
                  bg={
                    intento.estado === "calificado"
                      ? intento.porcentaje >= examen.configuracion.notaAprobacion
                        ? "success"
                        : "danger"
                      : intento.estado === "completado"
                      ? "info"
                      : "warning"
                  }
                >
                  {intento.estado === "calificado"
                    ? intento.porcentaje >= examen.configuracion.notaAprobacion
                      ? "APROBADO"
                      : "REPROBADO"
                    : intento.estado === "completado"
                    ? "Pendiente de Calificación"
                    : "En Progreso"}
                </Badge>
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Fecha de Entrega:</strong>{" "}
                {intento.fechaEntrega ? formatearFechaHoraCompleta(intento.fechaEntrega) : "En progreso"}
              </p>
              <p>
                <strong>Tiempo Transcurrido:</strong>{" "}
                {intento.tiempoTranscurrido
                  ? `${intento.tiempoTranscurrido} minutos`
                  : "En progreso"}
              </p>
              {intento.estado === "calificado" && (
                <p>
                  <strong>Calificación:</strong>{" "}
                  <Badge
                    bg={
                      intento.porcentaje >= examen.configuracion.notaAprobacion
                        ? "success"
                        : "danger"
                    }
                    className="fs-5"
                  >
                    {intento.puntuacionTotal} / {examen.puntajeTotal} ({intento.porcentaje}%)
                  </Badge>
                </p>
              )}
            </Col>
          </Row>

          {intento.retroalimentacion && (
            <>
              <hr />
              <Alert variant="info">
                <strong>Retroalimentación del Docente:</strong>
                <p className="mb-0 mt-2">{intento.retroalimentacion}</p>
              </Alert>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Preguntas y respuestas */}
      {examen.preguntas.map((pregunta, index) => {
        const respuesta = intento.respuestas.find(
          (r) => r.pregunta.toString() === pregunta._id.toString()
        );

        return (
          <Card
            key={pregunta._id}
            className={`shadow-sm mb-3 ${
              respuesta?.esCorrecta === true
                ? "border-success"
                : respuesta?.esCorrecta === false
                ? "border-danger"
                : ""
            }`}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Badge bg="secondary" className="me-2">
                    Pregunta {index + 1}
                  </Badge>
                  <Badge bg="info">{pregunta.tipo}</Badge>
                </div>
                <div className="text-end">
                  {getIconoRespuesta(respuesta?.esCorrecta)}
                  {intento.estado === "calificado" && (
                    <div className="mt-1">
                      <Badge bg="dark">
                        {respuesta?.puntajeObtenido || 0} / {pregunta.puntaje} pts
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <h6 className="mb-3">{pregunta.pregunta}</h6>

              {/* Opción Múltiple */}
              {pregunta.tipo === "multiple" && (
                <div>
                  {pregunta.opciones?.map((opcion) => {
                    const esSeleccionada =
                      respuesta?.respuesta === opcion._id?.toString();
                    const esCorrecta = opcion.esCorrecta;

                    return (
                      <div
                        key={opcion._id}
                        className={`p-2 mb-2 rounded border ${
                          mostrarRespuestasCorrectas && esCorrecta
                            ? "border-success bg-success bg-opacity-10"
                            : esSeleccionada
                            ? respuesta?.esCorrecta
                              ? "border-success bg-success bg-opacity-10"
                              : "border-danger bg-danger bg-opacity-10"
                            : ""
                        }`}
                      >
                        <div className="d-flex align-items-center">
                          <input
                            type="radio"
                            checked={esSeleccionada}
                            disabled
                            className="me-2"
                          />
                          <span>{opcion.texto}</span>
                          {mostrarRespuestasCorrectas && esCorrecta && (
                            <FaCheckCircle className="text-success ms-2" />
                          )}
                          {esSeleccionada && !respuesta?.esCorrecta && (
                            <FaTimesCircle className="text-danger ms-2" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Verdadero/Falso */}
              {pregunta.tipo === "verdadero_falso" && (
                <div>
                  {["verdadero", "falso"].map((opcion) => {
                    const esSeleccionada = respuesta?.respuesta === opcion;
                    const esCorrecta =
                      pregunta.respuestaCorrecta?.toLowerCase() === opcion;

                    return (
                      <div
                        key={opcion}
                        className={`p-2 mb-2 rounded border ${
                          mostrarRespuestasCorrectas && esCorrecta
                            ? "border-success bg-success bg-opacity-10"
                            : esSeleccionada
                            ? respuesta?.esCorrecta
                              ? "border-success bg-success bg-opacity-10"
                              : "border-danger bg-danger bg-opacity-10"
                            : ""
                        }`}
                      >
                        <div className="d-flex align-items-center">
                          <input
                            type="radio"
                            checked={esSeleccionada}
                            disabled
                            className="me-2"
                          />
                          <span className="text-capitalize">{opcion}</span>
                          {mostrarRespuestasCorrectas && esCorrecta && (
                            <FaCheckCircle className="text-success ms-2" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Respuesta Corta o Desarrollo */}
              {(pregunta.tipo === "corta" || pregunta.tipo === "desarrollo") && (
                <div>
                  <Alert
                    variant={
                      respuesta?.esCorrecta === null ? "light" : "light"
                    }
                    className="mb-2"
                  >
                    <strong>Tu respuesta:</strong>
                    <p className="mb-0 mt-2">
                      {respuesta?.respuesta || (
                        <em className="text-muted">Sin respuesta</em>
                      )}
                    </p>
                  </Alert>

                  {respuesta?.comentarioDocente && (
                    <Alert variant="info">
                      <strong>Comentario del Docente:</strong>
                      <p className="mb-0 mt-2">{respuesta.comentarioDocente}</p>
                    </Alert>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        );
      })}

      {/* Mensaje si no se muestran respuestas correctas */}
      {!mostrarRespuestasCorrectas && intento.estado === "calificado" && (
        <Alert variant="info">
          Las respuestas correctas no están disponibles para este examen.
        </Alert>
      )}
    </div>
  );
};

export default VerIntento;
