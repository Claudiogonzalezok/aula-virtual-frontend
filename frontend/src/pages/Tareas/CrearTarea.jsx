// frontend/src/pages/tareas/CrearTarea.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { crearTarea, actualizarTarea, obtenerTarea } from "../../services/tareaService";
import { listarCursos } from "../../services/cursoService";

const CrearEditarTarea = () => {
  const { id } = useParams(); // Si hay ID, es edición
  const navigate = useNavigate();
  const esEdicion = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(esEdicion);
  const [error, setError] = useState(null);
  const [cursos, setCursos] = useState([]);
  
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    curso: "",
    fechaApertura: "",
    fechaCierre: "",
    puntajeMaximo: 100,
    permitirEntregasTarde: false,
    penalizacionTarde: 0,
    tipoEntrega: "archivo",
    formatosPermitidos: "",
    tamanioMaximo: 10485760, // 10MB
    cantidadMaximaArchivos: 5,
    instrucciones: "",
    publicada: true,
  });

  const [archivos, setArchivos] = useState([]);
  const [rubrica, setRubrica] = useState([]);

  useEffect(() => {
    cargarCursos();
    if (esEdicion) {
      cargarTarea();
    }
  }, [id]);

  const cargarCursos = async () => {
    try {
      const data = await listarCursos();
      setCursos(data.cursos || data || []);
    } catch (err) {
      console.error("Error al cargar cursos:", err);
    }
  };

  const cargarTarea = async () => {
    try {
      setLoadingData(true);
      const tarea = await obtenerTarea(id);
      
      // Formatear fechas para input datetime-local
      const fechaApertura = new Date(tarea.fechaApertura).toISOString().slice(0, 16);
      const fechaCierre = new Date(tarea.fechaCierre).toISOString().slice(0, 16);
      
      setForm({
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        curso: tarea.curso._id || tarea.curso,
        fechaApertura,
        fechaCierre,
        puntajeMaximo: tarea.puntajeMaximo,
        permitirEntregasTarde: tarea.permitirEntregasTarde,
        penalizacionTarde: tarea.penalizacionTarde,
        tipoEntrega: tarea.tipoEntrega,
        formatosPermitidos: tarea.formatosPermitidos?.join(", ") || "",
        tamanioMaximo: tarea.tamanioMaximo,
        cantidadMaximaArchivos: tarea.cantidadMaximaArchivos,
        instrucciones: tarea.instrucciones || "",
        publicada: tarea.publicada,
      });

      setRubrica(tarea.rubrica || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al cargar tarea");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleArchivos = (e) => {
    setArchivos(Array.from(e.target.files));
  };

  const agregarCriterio = () => {
    setRubrica([
      ...rubrica,
      { criterio: "", descripcion: "", puntajeMaximo: 0 }
    ]);
  };

  const actualizarCriterio = (index, campo, valor) => {
    const nuevaRubrica = [...rubrica];
    nuevaRubrica[index][campo] = valor;
    setRubrica(nuevaRubrica);
  };

  const eliminarCriterio = (index) => {
    setRubrica(rubrica.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (new Date(form.fechaCierre) <= new Date(form.fechaApertura)) {
        setError("La fecha de cierre debe ser posterior a la fecha de apertura");
        setLoading(false);
        return;
      }

      // Crear FormData
      const formData = new FormData();
      
      // Agregar campos del formulario
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      // Agregar archivos
      archivos.forEach(archivo => {
        formData.append("archivos", archivo);
      });

      // Agregar rúbrica como JSON
      if (rubrica.length > 0) {
        formData.append("rubrica", JSON.stringify(rubrica));
      }

      if (esEdicion) {
        await actualizarTarea(id, formData);
        navigate(`/dashboard/tareas/${id}`, {
          state: { mensaje: "Tarea actualizada correctamente", tipo: "success" }
        });
      } else {
        const response = await crearTarea(formData);
        navigate("/dashboard/tareas", {
          state: { mensaje: "Tarea creada correctamente", tipo: "success" }
        });
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Error al guardar tarea");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando datos...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Row>
        <Col md={10} lg={8} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                {esEdicion ? "✏️ Editar Tarea" : "➕ Nueva Tarea"}
              </h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Información básica */}
                <h5 className="mb-3">📋 Información Básica</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Título *</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo"
                    value={form.titulo}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Trabajo Práctico N°1"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    required
                    placeholder="Describe brevemente la tarea..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Curso *</Form.Label>
                  <Form.Select
                    name="curso"
                    value={form.curso}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar curso...</option>
                    {cursos.map(curso => (
                      <option key={curso._id} value={curso._id}>
                        {curso.titulo || curso.nombre} - {curso.codigo}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Apertura *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="fechaApertura"
                        value={form.fechaApertura}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Cierre *</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="fechaCierre"
                        value={form.fechaCierre}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4" />

                {/* Configuración de calificación */}
                <h5 className="mb-3">📊 Calificación</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Puntaje Máximo *</Form.Label>
                  <Form.Control
                    type="number"
                    name="puntajeMaximo"
                    value={form.puntajeMaximo}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="permitirEntregasTarde"
                    checked={form.permitirEntregasTarde}
                    onChange={handleChange}
                    label="Permitir entregas tardías"
                  />
                </Form.Group>

                {form.permitirEntregasTarde && (
                  <Form.Group className="mb-3">
                    <Form.Label>Penalización por entrega tardía (%)</Form.Label>
                    <Form.Control
                      type="number"
                      name="penalizacionTarde"
                      value={form.penalizacionTarde}
                      onChange={handleChange}
                      min="0"
                      max="100"
                    />
                    <Form.Text className="text-muted">
                      Porcentaje de puntos a descontar (ej: 10 = -10%)
                    </Form.Text>
                  </Form.Group>
                )}

                <hr className="my-4" />

                {/* Configuración de entrega */}
                <h5 className="mb-3">📤 Configuración de Entrega</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Entrega *</Form.Label>
                  <Form.Select
                    name="tipoEntrega"
                    value={form.tipoEntrega}
                    onChange={handleChange}
                  >
                    <option value="archivo">Solo archivos</option>
                    <option value="texto">Solo texto</option>
                    <option value="ambos">Archivos y texto</option>
                  </Form.Select>
                </Form.Group>

                {(form.tipoEntrega === "archivo" || form.tipoEntrega === "ambos") && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Formatos Permitidos</Form.Label>
                      <Form.Control
                        type="text"
                        name="formatosPermitidos"
                        value={form.formatosPermitidos}
                        onChange={handleChange}
                        placeholder="pdf, docx, jpg, png (separados por comas)"
                      />
                      <Form.Text className="text-muted">
                        Dejar vacío para permitir todos los formatos
                      </Form.Text>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tamaño Máximo por Archivo (MB)</Form.Label>
                          <Form.Control
                            type="number"
                            name="tamanioMaximo"
                            value={form.tamanioMaximo / 1048576} // Convertir de bytes a MB
                            onChange={(e) => setForm({
                              ...form,
                              tamanioMaximo: e.target.value * 1048576
                            })}
                            min="1"
                            max="50"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Cantidad Máxima de Archivos</Form.Label>
                          <Form.Control
                            type="number"
                            name="cantidadMaximaArchivos"
                            value={form.cantidadMaximaArchivos}
                            onChange={handleChange}
                            min="1"
                            max="10"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Instrucciones Adicionales</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="instrucciones"
                    value={form.instrucciones}
                    onChange={handleChange}
                    placeholder="Instrucciones específicas para la entrega..."
                  />
                </Form.Group>

                <hr className="my-4" />

                {/* Archivos adjuntos */}
                <h5 className="mb-3">📎 Archivos Adjuntos (Material de la tarea)</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Subir archivos</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleArchivos}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                  />
                  <Form.Text className="text-muted">
                    Puedes subir múltiples archivos (material de estudio, consignas, etc.)
                  </Form.Text>
                </Form.Group>

                {archivos.length > 0 && (
                  <Alert variant="info">
                    <strong>Archivos seleccionados:</strong>
                    <ul className="mb-0 mt-2">
                      {archivos.map((archivo, index) => (
                        <li key={index}>{archivo.name}</li>
                      ))}
                    </ul>
                  </Alert>
                )}

                <hr className="my-4" />

                {/* Rúbrica de evaluación */}
                <h5 className="mb-3">📐 Rúbrica de Evaluación (Opcional)</h5>
                
                {rubrica.map((criterio, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6>Criterio {index + 1}</h6>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => eliminarCriterio(index)}
                        >
                          🗑️ Eliminar
                        </Button>
                      </div>

                      <Form.Group className="mb-2">
                        <Form.Label>Nombre del Criterio</Form.Label>
                        <Form.Control
                          type="text"
                          value={criterio.criterio}
                          onChange={(e) => actualizarCriterio(index, "criterio", e.target.value)}
                          placeholder="Ej: Presentación"
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                          type="text"
                          value={criterio.descripcion}
                          onChange={(e) => actualizarCriterio(index, "descripcion", e.target.value)}
                          placeholder="Descripción del criterio"
                        />
                      </Form.Group>

                      <Form.Group>
                        <Form.Label>Puntaje Máximo</Form.Label>
                        <Form.Control
                          type="number"
                          value={criterio.puntajeMaximo}
                          onChange={(e) => actualizarCriterio(index, "puntajeMaximo", Number(e.target.value))}
                          min="0"
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                ))}

                <Button variant="outline-primary" onClick={agregarCriterio} className="mb-3">
                  ➕ Agregar Criterio
                </Button>

                <hr className="my-4" />

                {/* Opciones de publicación */}
                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    name="publicada"
                    checked={form.publicada}
                    onChange={handleChange}
                    label="Publicar tarea (los alumnos podrán verla)"
                  />
                </Form.Group>

                {/* Botones */}
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="success"
                    disabled={loading}
                    className="flex-fill"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        {esEdicion ? "💾 Guardar Cambios" : "✅ Crear Tarea"}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate("/dashboard/tareas")}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CrearEditarTarea;