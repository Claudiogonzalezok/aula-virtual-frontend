import { useState, useEffect, useContext } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Badge,
  ListGroup,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { FaPlus, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

const FormularioExamen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const esEdicion = !!id;

  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState([]);
  const [showPreguntaModal, setShowPreguntaModal] = useState(false);
  const [preguntaEditando, setPreguntaEditando] = useState(null);

  // Modal de confirmación para eliminar pregunta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [preguntaAEliminar, setPreguntaAEliminar] = useState(null);

  const [formExamen, setFormExamen] = useState({
    titulo: "",
    descripcion: "",
    cursoId: "",
    fechaApertura: "",
    fechaCierre: "",
    configuracion: {
      duracionMinutos: 60,
      intentosPermitidos: 1,
      mostrarRespuestas: true,
      mezclarPreguntas: false,
      mezclarOpciones: false,
      notaAprobacion: 60,
    },
    preguntas: [],
    estado: "borrador",
  });

  const [formPregunta, setFormPregunta] = useState({
    tipo: "multiple",
    pregunta: "",
    opciones: [
      { texto: "", esCorrecta: false },
      { texto: "", esCorrecta: false },
    ],
    respuestaCorrecta: "",
    puntaje: 1,
  });

  useEffect(() => {
    cargarCursos();
    if (esEdicion) {
      cargarExamen();
    }
  }, []);

  const cargarCursos = async () => {
    try {
      const { data } = await API.get("/cursos");
      setCursos(data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      toast.error("Error al cargar la lista de cursos");
    }
  };

  const cargarExamen = async () => {
    try {
      const { data } = await API.get(`/examenes/${id}`);
      setFormExamen({
        titulo: data.titulo,
        descripcion: data.descripcion || "",
        cursoId: data.curso._id,
        fechaApertura:
          data.fechaApertura?.split("T")[0] +
          "T" +
          data.fechaApertura?.split("T")[1]?.substring(0, 5),
        fechaCierre:
          data.fechaCierre?.split("T")[0] +
          "T" +
          data.fechaCierre?.split("T")[1]?.substring(0, 5),
        configuracion: data.configuracion,
        preguntas: data.preguntas,
        estado: data.estado,
      });
      toast.success("📝 Examen cargado correctamente");
    } catch (error) {
      console.error("Error al cargar examen:", error);
      toast.error("Error al cargar el examen");
      navigate("/dashboard/examenes");
    }
  };

  const validarFormulario = () => {
    const erroresTemp = [];

    if (!formExamen.titulo.trim()) {
      erroresTemp.push("El título es requerido");
    }
    if (!formExamen.cursoId) {
      erroresTemp.push("Debes seleccionar un curso");
    }
    if (!formExamen.fechaApertura) {
      erroresTemp.push("La fecha de apertura es requerida");
    }
    if (!formExamen.fechaCierre) {
      erroresTemp.push("La fecha de cierre es requerida");
    }
    if (new Date(formExamen.fechaApertura) >= new Date(formExamen.fechaCierre)) {
      erroresTemp.push(
        "La fecha de apertura debe ser anterior a la fecha de cierre"
      );
    }
    if (formExamen.preguntas.length === 0) {
      erroresTemp.push("Debes agregar al menos una pregunta");
    }
    if (formExamen.configuracion.duracionMinutos < 1) {
      erroresTemp.push("La duración debe ser al menos 1 minuto");
    }
    if (formExamen.configuracion.intentosPermitidos < 1) {
      erroresTemp.push("Debe permitirse al menos 1 intento");
    }

    setErrores(erroresTemp);

    if (erroresTemp.length > 0) {
      toast.error(`⚠️ Hay ${erroresTemp.length} error(es) en el formulario`);
    }

    return erroresTemp.length === 0;
  };

  const guardarExamen = async (publicar = false) => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      const datos = {
        ...formExamen,
        estado: publicar ? "publicado" : formExamen.estado,
      };

      if (esEdicion) {
        await API.put(`/examenes/${id}`, datos);
        toast.success(
          publicar
            ? "✅ Examen actualizado y publicado"
            : "💾 Examen actualizado como borrador"
        );
      } else {
        await API.post("/examenes", datos);
        toast.success(
          publicar
            ? "🎉 ¡Examen creado y publicado!"
            : "💾 Examen guardado como borrador"
        );
      }

      setTimeout(() => navigate("/dashboard/examenes"), 1500);
    } catch (error) {
      console.error("Error al guardar examen:", error);
      toast.error(error.response?.data?.msg || "Error al guardar el examen");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalPregunta = (pregunta = null, index = null) => {
    if (pregunta) {
      setPreguntaEditando(index);
      setFormPregunta({ ...pregunta });
    } else {
      setPreguntaEditando(null);
      setFormPregunta({
        tipo: "multiple",
        pregunta: "",
        opciones: [
          { texto: "", esCorrecta: false },
          { texto: "", esCorrecta: false },
        ],
        respuestaCorrecta: "",
        puntaje: 1,
      });
    }
    setShowPreguntaModal(true);
  };

  const agregarOpcion = () => {
    setFormPregunta({
      ...formPregunta,
      opciones: [...formPregunta.opciones, { texto: "", esCorrecta: false }],
    });
  };

  const eliminarOpcion = (index) => {
    if (formPregunta.opciones.length <= 2) {
      toast.warning("Debe haber al menos 2 opciones");
      return;
    }
    setFormPregunta({
      ...formPregunta,
      opciones: formPregunta.opciones.filter((_, i) => i !== index),
    });
  };

  const actualizarOpcion = (index, campo, valor) => {
    const nuevasOpciones = [...formPregunta.opciones];

    if (campo === "esCorrecta" && valor) {
      nuevasOpciones.forEach((op, i) => {
        op.esCorrecta = i === index;
      });
    } else {
      nuevasOpciones[index][campo] = valor;
    }

    setFormPregunta({ ...formPregunta, opciones: nuevasOpciones });
  };

  const guardarPregunta = () => {
    if (!formPregunta.pregunta.trim()) {
      toast.warning("La pregunta no puede estar vacía");
      return;
    }

    if (formPregunta.tipo === "multiple") {
      if (formPregunta.opciones.some((o) => !o.texto.trim())) {
        toast.warning("Todas las opciones deben tener texto");
        return;
      }
      if (!formPregunta.opciones.some((o) => o.esCorrecta)) {
        toast.warning("Debes marcar una opción como correcta");
        return;
      }
    }

    if (
      formPregunta.tipo === "verdadero_falso" &&
      !formPregunta.respuestaCorrecta
    ) {
      toast.warning("Debes seleccionar la respuesta correcta");
      return;
    }

    if (formPregunta.puntaje <= 0) {
      toast.warning("El puntaje debe ser mayor a 0");
      return;
    }

    const nuevasPreguntas = [...formExamen.preguntas];

    if (preguntaEditando !== null) {
      nuevasPreguntas[preguntaEditando] = { ...formPregunta };
      toast.success("✏️ Pregunta actualizada");
    } else {
      nuevasPreguntas.push({ ...formPregunta });
      toast.success("➕ Pregunta agregada");
    }

    setFormExamen({ ...formExamen, preguntas: nuevasPreguntas });
    setShowPreguntaModal(false);
  };

  const confirmarEliminarPregunta = (index) => {
    setPreguntaAEliminar(index);
    setShowDeleteModal(true);
  };

  const eliminarPregunta = () => {
    setFormExamen({
      ...formExamen,
      preguntas: formExamen.preguntas.filter((_, i) => i !== preguntaAEliminar),
    });
    setShowDeleteModal(false);
    setPreguntaAEliminar(null);
    toast.info("🗑️ Pregunta eliminada");
  };

  const calcularPuntajeTotal = () => {
    return formExamen.preguntas.reduce((sum, p) => sum + Number(p.puntaje), 0);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold">
          {esEdicion ? "Editar Examen" : "Crear Nuevo Examen"}
        </h2>
        <p className="text-muted">
          {esEdicion
            ? "Modifica los detalles del examen"
            : "Completa los datos para crear un examen"}
        </p>
      </div>

      {errores.length > 0 && (
        <Alert variant="danger" onClose={() => setErrores([])} dismissible>
          <Alert.Heading>Errores en el formulario:</Alert.Heading>
          <ul className="mb-0">
            {errores.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          {/* Información básica */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Información del Examen</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Título *</Form.Label>
                <Form.Control
                  value={formExamen.titulo}
                  onChange={(e) =>
                    setFormExamen({ ...formExamen, titulo: e.target.value })
                  }
                  placeholder="Ej: Examen Final - Unidad 1"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formExamen.descripcion}
                  onChange={(e) =>
                    setFormExamen({ ...formExamen, descripcion: e.target.value })
                  }
                  placeholder="Breve descripción del examen..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Curso *</Form.Label>
                <Form.Select
                  value={formExamen.cursoId}
                  onChange={(e) =>
                    setFormExamen({ ...formExamen, cursoId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecciona un curso</option>
                  {cursos.map((curso) => (
                    <option key={curso._id} value={curso._id}>
                      {curso.codigo} - {curso.titulo}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha y Hora de Apertura *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={formExamen.fechaApertura}
                      onChange={(e) =>
                        setFormExamen({
                          ...formExamen,
                          fechaApertura: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha y Hora de Cierre *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={formExamen.fechaCierre}
                      onChange={(e) =>
                        setFormExamen({
                          ...formExamen,
                          fechaCierre: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Preguntas */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Preguntas ({formExamen.preguntas.length})</h5>
              <div>
                <Badge bg="light" text="dark">
                  Total: {calcularPuntajeTotal()} puntos
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {formExamen.preguntas.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No hay preguntas agregadas
                </div>
              ) : (
                <ListGroup>
                  {formExamen.preguntas.map((pregunta, index) => (
                    <ListGroup.Item key={index}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex gap-2 mb-2">
                            <Badge bg="secondary">#{index + 1}</Badge>
                            <Badge bg="info">{pregunta.tipo}</Badge>
                            <Badge bg="warning" text="dark">
                              {pregunta.puntaje} pts
                            </Badge>
                          </div>
                          <p className="mb-2">
                            <strong>{pregunta.pregunta}</strong>
                          </p>

                          {pregunta.tipo === "multiple" && (
                            <ul className="small mb-0">
                              {pregunta.opciones.map((opcion, i) => (
                                <li
                                  key={i}
                                  className={
                                    opcion.esCorrecta
                                      ? "text-success fw-bold"
                                      : ""
                                  }
                                >
                                  {opcion.texto}
                                  {opcion.esCorrecta && " ✓"}
                                </li>
                              ))}
                            </ul>
                          )}

                          {pregunta.tipo === "verdadero_falso" && (
                            <p className="small text-success mb-0">
                              Respuesta correcta:{" "}
                              <strong>{pregunta.respuestaCorrecta}</strong>
                            </p>
                          )}
                        </div>
                        <div className="d-flex gap-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => abrirModalPregunta(pregunta, index)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => confirmarEliminarPregunta(index)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              <Button
                variant="success"
                className="w-100 mt-3"
                onClick={() => abrirModalPregunta()}
              >
                <FaPlus className="me-2" />
                Agregar Pregunta
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Configuración */}
          <Card className="shadow-sm mb-4 sticky-top" style={{ top: "20px" }}>
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Configuración</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Duración (minutos)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={formExamen.configuracion.duracionMinutos}
                  onChange={(e) =>
                    setFormExamen({
                      ...formExamen,
                      configuracion: {
                        ...formExamen.configuracion,
                        duracionMinutos: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Intentos permitidos</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={formExamen.configuracion.intentosPermitidos}
                  onChange={(e) =>
                    setFormExamen({
                      ...formExamen,
                      configuracion: {
                        ...formExamen.configuracion,
                        intentosPermitidos: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nota de aprobación (%)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="100"
                  value={formExamen.configuracion.notaAprobacion}
                  onChange={(e) =>
                    setFormExamen({
                      ...formExamen,
                      configuracion: {
                        ...formExamen.configuracion,
                        notaAprobacion: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </Form.Group>

              <hr />

              <Form.Check
                type="checkbox"
                label="Mostrar respuestas correctas"
                checked={formExamen.configuracion.mostrarRespuestas}
                onChange={(e) =>
                  setFormExamen({
                    ...formExamen,
                    configuracion: {
                      ...formExamen.configuracion,
                      mostrarRespuestas: e.target.checked,
                    },
                  })
                }
                className="mb-2"
              />

              <Form.Check
                type="checkbox"
                label="Mezclar preguntas"
                checked={formExamen.configuracion.mezclarPreguntas}
                onChange={(e) =>
                  setFormExamen({
                    ...formExamen,
                    configuracion: {
                      ...formExamen.configuracion,
                      mezclarPreguntas: e.target.checked,
                    },
                  })
                }
                className="mb-2"
              />

              <Form.Check
                type="checkbox"
                label="Mezclar opciones"
                checked={formExamen.configuracion.mezclarOpciones}
                onChange={(e) =>
                  setFormExamen({
                    ...formExamen,
                    configuracion: {
                      ...formExamen.configuracion,
                      mezclarOpciones: e.target.checked,
                    },
                  })
                }
              />
            </Card.Body>
          </Card>

          {/* Botones de acción */}
          <Card className="shadow-sm">
            <Card.Body className="d-grid gap-2">
              <Button
                variant="success"
                onClick={() => guardarExamen(true)}
                disabled={loading}
              >
                <FaSave className="me-2" />
                {loading
                  ? "Guardando..."
                  : esEdicion
                  ? "Guardar y Publicar"
                  : "Crear y Publicar"}
              </Button>

              <Button
                variant="secondary"
                onClick={() => guardarExamen(false)}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar como Borrador"}
              </Button>

              <Button
                variant="outline-secondary"
                onClick={() => navigate("/dashboard/examenes")}
                disabled={loading}
              >
                <FaTimes className="me-2" />
                Cancelar
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de pregunta */}
      <Modal
        show={showPreguntaModal}
        onHide={() => setShowPreguntaModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {preguntaEditando !== null ? "Editar Pregunta" : "Nueva Pregunta"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tipo de Pregunta</Form.Label>
            <Form.Select
              value={formPregunta.tipo}
              onChange={(e) =>
                setFormPregunta({ ...formPregunta, tipo: e.target.value })
              }
            >
              <option value="multiple">Opción Múltiple</option>
              <option value="verdadero_falso">Verdadero/Falso</option>
              <option value="corta">Respuesta Corta</option>
              <option value="desarrollo">Desarrollo</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Pregunta *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formPregunta.pregunta}
              onChange={(e) =>
                setFormPregunta({ ...formPregunta, pregunta: e.target.value })
              }
              placeholder="Escribe tu pregunta aquí..."
            />
          </Form.Group>

          {formPregunta.tipo === "multiple" && (
            <div className="mb-3">
              <Form.Label>Opciones de Respuesta</Form.Label>
              {formPregunta.opciones.map((opcion, index) => (
                <InputGroup key={index} className="mb-2">
                  <InputGroup.Checkbox
                    checked={opcion.esCorrecta}
                    onChange={(e) =>
                      actualizarOpcion(index, "esCorrecta", e.target.checked)
                    }
                    title="Marcar como correcta"
                  />
                  <Form.Control
                    value={opcion.texto}
                    onChange={(e) =>
                      actualizarOpcion(index, "texto", e.target.value)
                    }
                    placeholder={`Opción ${index + 1}`}
                  />
                  {formPregunta.opciones.length > 2 && (
                    <Button
                      variant="outline-danger"
                      onClick={() => eliminarOpcion(index)}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </InputGroup>
              ))}
              <Button
                variant="outline-primary"
                size="sm"
                onClick={agregarOpcion}
              >
                <FaPlus className="me-1" />
                Agregar Opción
              </Button>
            </div>
          )}

          {formPregunta.tipo === "verdadero_falso" && (
            <Form.Group className="mb-3">
              <Form.Label>Respuesta Correcta</Form.Label>
              <Form.Select
                value={formPregunta.respuestaCorrecta}
                onChange={(e) =>
                  setFormPregunta({
                    ...formPregunta,
                    respuestaCorrecta: e.target.value,
                  })
                }
              >
                <option value="">Selecciona...</option>
                <option value="verdadero">Verdadero</option>
                <option value="falso">Falso</option>
              </Form.Select>
            </Form.Group>
          )}

          {(formPregunta.tipo === "corta" ||
            formPregunta.tipo === "desarrollo") && (
            <Alert variant="info">
              <small>
                Las preguntas de tipo "{formPregunta.tipo}" requieren
                calificación manual del docente.
              </small>
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Puntaje</Form.Label>
            <Form.Control
              type="number"
              min="0.5"
              step="0.5"
              value={formPregunta.puntaje}
              onChange={(e) =>
                setFormPregunta({
                  ...formPregunta,
                  puntaje: parseFloat(e.target.value),
                })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPreguntaModal(false)}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarPregunta}>
            {preguntaEditando !== null ? "Actualizar" : "Agregar"} Pregunta
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar pregunta */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro que deseas eliminar esta pregunta?</p>
          <p className="text-muted small mb-0">
            Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarPregunta}>
            <FaTrash className="me-2" />
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FormularioExamen;