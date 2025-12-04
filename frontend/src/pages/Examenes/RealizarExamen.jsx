import { useState, useEffect, useContext } from "react";
import {
  Card,
  Button,
  Form,
  Alert,
  Badge,
  ProgressBar,
  Modal,
  Spinner,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { FaClock, FaCheckCircle, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

const RealizarExamen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  const [examen, setExamen] = useState(null);
  const [intentoId, setIntentoId] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [iniciarExamen, setIniciarExamen] = useState(false);

  useEffect(() => {
    cargarExamen();
  }, []);

  useEffect(() => {
    if (tiempoRestante > 0 && iniciarExamen) {
      const timer = setTimeout(() => {
        setTiempoRestante(tiempoRestante - 1);
      }, 1000);

      // Avisos de tiempo
      if (tiempoRestante === 300) {
        toast.warning("⏰ Quedan 5 minutos para finalizar el examen", {
          autoClose: 5000,
        });
      } else if (tiempoRestante === 60) {
        toast.error("⚠️ ¡Último minuto! El examen se enviará automáticamente", {
          autoClose: false,
        });
      }

      return () => clearTimeout(timer);
    } else if (tiempoRestante === 0 && iniciarExamen && examen) {
      toast.info("⏱️ Tiempo agotado. Enviando examen automáticamente...");
      enviarExamen();
    }
  }, [tiempoRestante, iniciarExamen]);

  const cargarExamen = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/examenes/${id}`);
      setExamen(data);

      const intentoEnProgreso = data.misIntentos?.find(
        (i) => i.estado === "en_progreso"
      );

      if (intentoEnProgreso) {
        setIntentoId(intentoEnProgreso._id);
        setIniciarExamen(true);

        const tiempoTranscurrido = Math.floor(
          (new Date() - new Date(intentoEnProgreso.fechaInicio)) / 1000
        );
        const tiempoTotal = data.configuracion.duracionMinutos * 60;
        const restante = Math.max(0, tiempoTotal - tiempoTranscurrido);
        setTiempoRestante(restante);

        const respuestasGuardadas = {};
        intentoEnProgreso.respuestas?.forEach((r) => {
          if (r.respuesta) {
            respuestasGuardadas[r.pregunta.toString()] = r.respuesta;
          }
        });
        setRespuestas(respuestasGuardadas);

        toast.info("📝 Continuando examen en progreso...");
      }
    } catch (error) {
      console.error("Error al cargar examen:", error);
      toast.error(error.response?.data?.msg || "Error al cargar el examen");
      navigate("/dashboard/examenes");
    } finally {
      setLoading(false);
    }
  };

  const comenzarExamen = async () => {
    try {
      const { data } = await API.post(`/examenes/${id}/iniciar`);
      setIntentoId(data.intentoId);
      setTiempoRestante(data.duracionMinutos * 60);
      setIniciarExamen(true);
      toast.success("✅ ¡Examen iniciado! Buena suerte 🍀");
    } catch (error) {
      console.error("Error al iniciar examen:", error);
      toast.error(error.response?.data?.msg || "No se pudo iniciar el examen");
    }
  };

  const manejarRespuesta = (preguntaId, respuesta) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: respuesta,
    });
  };

  const enviarExamen = async () => {
    setEnviando(true);
    setShowConfirmModal(false);

    try {
      const respuestasArray = Object.entries(respuestas).map(
        ([preguntaId, respuesta]) => ({
          preguntaId,
          respuesta,
        })
      );

      const { data } = await API.post(`/examenes/${id}/enviar`, {
        intentoId,
        respuestas: respuestasArray,
      });

      toast.success(data.msg || "🎉 ¡Examen enviado correctamente!", {
        autoClose: 3000,
        onClose: () => navigate("/dashboard/examenes"),
      });

      // Navegar después de un breve delay para que se vea el toast
      setTimeout(() => {
        navigate("/dashboard/examenes");
      }, 2000);
    } catch (error) {
      console.error("Error al enviar examen:", error);
      toast.error(
        error.response?.data?.msg || "Error al enviar el examen. Intenta nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, "0")}`;
  };

  const calcularProgreso = () => {
    const respondidas = Object.keys(respuestas).length;
    const total = examen?.preguntas.length || 1;
    return (respondidas / total) * 100;
  };

  const getTiempoColor = () => {
    const porcentaje =
      (tiempoRestante / (examen.configuracion.duracionMinutos * 60)) * 100;
    if (porcentaje > 50) return "success";
    if (porcentaje > 25) return "warning";
    return "danger";
  };

  // ... resto del JSX igual

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!examen) {
    return (
      <Alert variant="danger">
        Examen no encontrado
      </Alert>
    );
  }

  // Pantalla de inicio
  if (!iniciarExamen) {
    return (
      <div className="container" style={{ maxWidth: "800px" }}>
        <Card className="shadow-lg">
          <Card.Header className="bg-primary text-white">
            <h3 className="mb-0">{examen.titulo}</h3>
          </Card.Header>
          <Card.Body>
            {examen.descripcion && (
              <p className="lead">{examen.descripcion}</p>
            )}

            <hr />

            <h5>Instrucciones:</h5>
            <ul>
              <li>Este examen tiene <strong>{examen.preguntas.length} preguntas</strong></li>
              <li>Duración: <strong>{examen.configuracion.duracionMinutos} minutos</strong></li>
              <li>Puntaje total: <strong>{examen.puntajeTotal} puntos</strong></li>
              <li>Nota de aprobación: <strong>{examen.configuracion.notaAprobacion}%</strong></li>
              <li>Intentos permitidos: <strong>{examen.configuracion.intentosPermitidos}</strong></li>
              <li>
                Intentos realizados:{" "}
                <strong>{examen.misIntentos?.length || 0}</strong>
              </li>
            </ul>

            <Alert variant="warning">
              <strong>⚠️ Importante:</strong>
              <ul className="mb-0">
                <li>Una vez iniciado el examen, el tiempo comenzará a correr.</li>
                <li>No podrás pausar el examen.</li>
                <li>Si se acaba el tiempo, se enviará automáticamente.</li>
                <li>Asegúrate de tener una conexión estable a internet.</li>
              </ul>
            </Alert>

            <div className="d-grid gap-2 mt-4">
              <Button
                variant="success"
                size="lg"
                onClick={comenzarExamen}
              >
                <FaCheckCircle className="me-2" />
                Comenzar Examen
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate("/dashboard/examenes")}
              >
                Volver
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Vista del examen en progreso
  return (
    <div>
      {/* Barra superior fija */}
      <Card className="shadow-sm mb-4 sticky-top" style={{ top: 0, zIndex: 1000 }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{examen.titulo}</h5>
              <small className="text-muted">
                Pregunta {Object.keys(respuestas).length} de {examen.preguntas.length} respondidas
              </small>
            </div>
            <div className="text-end">
              <div className="mb-2">
                <Badge bg={getTiempoColor()} className="fs-5">
                  <FaClock className="me-2" />
                  {formatearTiempo(tiempoRestante)}
                </Badge>
              </div>
              <Button
                variant="success"
                onClick={() => setShowConfirmModal(true)}
                disabled={enviando}
              >
                <FaSave className="me-2" />
                Entregar Examen
              </Button>
            </div>
          </div>
          <ProgressBar
            now={calcularProgreso()}
            variant={calcularProgreso() === 100 ? "success" : "info"}
            className="mt-2"
            style={{ height: "8px" }}
          />
        </Card.Body>
      </Card>

      {/* Preguntas */}
      <div className="container" style={{ maxWidth: "900px" }}>
        {examen.preguntas.map((pregunta, index) => (
          <Card key={pregunta._id} className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex gap-2 mb-3">
                <Badge bg="primary">Pregunta {index + 1}</Badge>
                <Badge bg="warning" text="dark">{pregunta.puntaje} pts</Badge>
                <Badge bg="info">{pregunta.tipo}</Badge>
              </div>

              <h5 className="mb-3">{pregunta.pregunta}</h5>

              {/* Opción Múltiple */}
              {pregunta.tipo === "multiple" && (
                <Form>
                  {pregunta.opciones.map((opcion) => (
                    <Form.Check
                      key={opcion._id}
                      type="radio"
                      name={`pregunta-${pregunta._id}`}
                      id={`opcion-${opcion._id}`}
                      label={opcion.texto}
                      checked={respuestas[pregunta._id] === opcion._id.toString()}
                      onChange={() => manejarRespuesta(pregunta._id, opcion._id.toString())}
                      className="mb-2 p-2 border rounded"
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Form>
              )}

              {/* Verdadero/Falso */}
              {pregunta.tipo === "verdadero_falso" && (
                <Form>
                  <Form.Check
                    type="radio"
                    name={`pregunta-${pregunta._id}`}
                    id={`v-${pregunta._id}`}
                    label="Verdadero"
                    checked={respuestas[pregunta._id] === "verdadero"}
                    onChange={() => manejarRespuesta(pregunta._id, "verdadero")}
                    className="mb-2 p-2 border rounded"
                  />
                  <Form.Check
                    type="radio"
                    name={`pregunta-${pregunta._id}`}
                    id={`f-${pregunta._id}`}
                    label="Falso"
                    checked={respuestas[pregunta._id] === "falso"}
                    onChange={() => manejarRespuesta(pregunta._id, "falso")}
                    className="mb-2 p-2 border rounded"
                  />
                </Form>
              )}

              {/* Respuesta Corta */}
              {pregunta.tipo === "corta" && (
                <Form.Control
                  type="text"
                  placeholder="Escribe tu respuesta..."
                  value={respuestas[pregunta._id] || ""}
                  onChange={(e) => manejarRespuesta(pregunta._id, e.target.value)}
                />
              )}

              {/* Desarrollo */}
              {pregunta.tipo === "desarrollo" && (
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Desarrolla tu respuesta..."
                  value={respuestas[pregunta._id] || ""}
                  onChange={(e) => manejarRespuesta(pregunta._id, e.target.value)}
                />
              )}
            </Card.Body>
          </Card>
        ))}

        <Card className="shadow-sm mb-5">
          <Card.Body className="text-center">
            <h5 className="mb-3">¿Has terminado?</h5>
            <p className="text-muted">
              Asegúrate de haber respondido todas las preguntas antes de entregar
            </p>
            <Button
              variant="success"
              size="lg"
              onClick={() => setShowConfirmModal(true)}
              disabled={enviando}
            >
              <FaSave className="me-2" />
              Entregar Examen
            </Button>
          </Card.Body>
        </Card>
      </div>

      {/* Modal de confirmación */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar entrega</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro que deseas entregar el examen?</p>
          <Alert variant="info">
            <strong>Resumen:</strong>
            <ul className="mb-0">
              <li>Preguntas respondidas: {Object.keys(respuestas).length} de {examen.preguntas.length}</li>
              <li>Tiempo restante: {formatearTiempo(tiempoRestante)}</li>
            </ul>
          </Alert>
          <Alert variant="warning">
            Una vez entregado, no podrás modificar tus respuestas.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={enviarExamen} disabled={enviando}>
            {enviando ? "Enviando..." : "Entregar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RealizarExamen;