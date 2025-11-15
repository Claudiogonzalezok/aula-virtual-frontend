// frontend/src/pages/tareas/DetalleTarea.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, ListGroup, Tabs, Tab, Form } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { obtenerTarea, eliminarTarea } from "../../services/tareaService";
import { crearEntrega, actualizarEntrega } from "../../services/entregaService";

const DetalleTarea = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tarea, setTarea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);

  // Estados para el formulario de entrega
  const [comentario, setComentario] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [enviandoEntrega, setEnviandoEntrega] = useState(false);
  const [errorEntrega, setErrorEntrega] = useState(null);
  const [successEntrega, setSuccessEntrega] = useState(null);

  useEffect(() => {
    // Obtener usuario del localStorage
    const userData = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(userData);
    cargarTarea();
  }, [id]);

  const cargarTarea = async () => {
    try {
      setLoading(true);
      const data = await obtenerTarea(id);
      setTarea(data);

      // Si es alumno y ya tiene entrega, cargar su comentario
      if (data.miEntrega?.comentarioAlumno) {
        setComentario(data.miEntrega.comentarioAlumno);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Error al cargar tarea");
    } finally {
      setLoading(false);
    }
  };

  const handleArchivos = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar cantidad
    if (files.length > tarea.cantidadMaximaArchivos) {
      setErrorEntrega(`Solo puedes subir hasta ${tarea.cantidadMaximaArchivos} archivos`);
      return;
    }

    // Validar tamaño
    const archivosGrandes = files.filter(f => f.size > tarea.tamanioMaximo);
    if (archivosGrandes.length > 0) {
      setErrorEntrega(`Algunos archivos exceden el tamaño máximo de ${(tarea.tamanioMaximo / 1048576).toFixed(1)}MB`);
      return;
    }

    // Validar formato si hay restricciones
    if (tarea.formatosPermitidos.length > 0) {
      const archivosInvalidos = files.filter(f => {
        const ext = f.name.split('.').pop().toLowerCase();
        return !tarea.formatosPermitidos.includes(ext);
      });

      if (archivosInvalidos.length > 0) {
        setErrorEntrega(`Formatos permitidos: ${tarea.formatosPermitidos.join(", ")}`);
        return;
      }
    }

    setArchivos(files);
    setErrorEntrega(null);
  };

  const handleSubmitEntrega = async (e) => {
    e.preventDefault();
  console.log("🔍 Iniciando envío de entrega..."); // 🔥 AGREGAR
  console.log("🔍 Tarea ID:", id); // 🔥 AGREGAR
  console.log("🔍 Comentario:", comentario); // 🔥 AGREGAR
  console.log("🔍 Archivos:", archivos); // 🔥 AGREGAR
  console.log("🔍 miEntrega:", tarea.miEntrega); // 🔥 AGREGAR

    setEnviandoEntrega(true);
    setErrorEntrega(null);
    setSuccessEntrega(null);

    try {
      const formData = new FormData();
      formData.append("tareaId", id);
      formData.append("comentarioAlumno", comentario);

      archivos.forEach(archivo => {
        formData.append("archivos", archivo);
      });

      if (tarea.miEntrega && tarea.miEntrega._id) {
        // Actualizar entrega existente
        await actualizarEntrega(tarea.miEntrega._id, formData);
        setSuccessEntrega("Entrega actualizada correctamente");
      } else {
        // Crear nueva entrega
        await crearEntrega(formData);
        setSuccessEntrega("Entrega enviada correctamente");
      }

      // Recargar tarea para ver la entrega actualizada
      setTimeout(() => {
        cargarTarea();
        setArchivos([]);
      }, 1500);

    } catch (err) {
      setErrorEntrega(err.response?.data?.msg || "Error al enviar entrega");
    } finally {
      setEnviandoEntrega(false);
    }
  };

  const handleEliminar = async () => {
    if (window.confirm("¿Estás seguro de eliminar esta tarea?")) {
      try {
        await eliminarTarea(id);
        navigate("/dashboard/tareas", {
          state: { mensaje: "Tarea eliminada correctamente", tipo: "success" }
        });
      } catch (err) {
        alert(err.response?.data?.msg || "Error al eliminar tarea");
      }
    }
  };

  const obtenerEstadoTarea = () => {
    const ahora = new Date();
    const apertura = new Date(tarea.fechaApertura);
    const cierre = new Date(tarea.fechaCierre);

    if (ahora < apertura) return { texto: "Próxima", variant: "info", icon: "⏰" };
    if (ahora > cierre) return { texto: "Cerrada", variant: "secondary", icon: "🔒" };
    return { texto: "Abierta", variant: "success", icon: "✅" };
  };

  const obtenerEstadoEntrega = () => {
    if (!tarea.miEntrega) {
      return { texto: "Sin entregar", variant: "warning", icon: "⚠️" };
    }

    switch (tarea.miEntrega.estado) {
      case "entregada":
        return { texto: "Entregada", variant: "info", icon: "📤" };
      case "calificada":
        return { texto: "Calificada", variant: "success", icon: "✅" };
      case "devuelta":
        return { texto: "Devuelta para corrección", variant: "danger", icon: "🔄" };
      default:
        return { texto: "Pendiente", variant: "secondary", icon: "⏳" };
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando tarea...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <h5>Error</h5>
          <p>{error}</p>
          <Link to={usuario?.rol === "alumno" ? "/dashboard/mis-tareas" : "/dashboard/tareas"}>
            <Button variant="danger">Volver a Tareas</Button>
          </Link>
        </Alert>
      </Container>
    );
  }

  const estado = obtenerEstadoTarea();
  const esDocente = usuario?.rol === "docente" || usuario?.rol === "admin";
  const esAlumno = usuario?.rol === "alumno";
  const puedeEntregar = esAlumno && (tarea.estaAbierta || (tarea.estaVencida && tarea.permitirEntregasTarde));
  const yaCalificada = tarea.miEntrega?.estado === "calificada";

  return (
    <Container className="mt-4 mb-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2>{tarea.titulo}</h2>
              <p className="text-muted mb-2">
                📚 {tarea.curso?.nombre} {tarea.clase && `• 📖 ${tarea.clase.titulo}`}
              </p>
              <div className="d-flex gap-2">
                <Badge bg={estado.variant}>{estado.icon} {estado.texto}</Badge>
                {esAlumno && (
                  <Badge bg={obtenerEstadoEntrega().variant}>
                    {obtenerEstadoEntrega().icon} {obtenerEstadoEntrega().texto}
                  </Badge>
                )}
                {tarea.miEntrega?.entregadaTarde && (
                  <Badge bg="warning">⚠️ Entrega tardía</Badge>
                )}
              </div>
            </div>
            {esDocente && (
              <div className="d-flex gap-2">
                <Link to={`/dashboard/tareas/editar/${id}`}>
                  <Button variant="outline-primary">✏️ Editar</Button>
                </Link>
                <Button variant="outline-danger" onClick={handleEliminar}>
                  🗑️ Eliminar
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Descripción y detalles */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">📋 Descripción</h5>
            </Card.Header>
            <Card.Body>
              <p style={{ whiteSpace: "pre-wrap" }}>{tarea.descripcion}</p>

              {tarea.instrucciones && (
                <>
                  <hr />
                  <h6>📝 Instrucciones</h6>
                  <p style={{ whiteSpace: "pre-wrap" }}>{tarea.instrucciones}</p>
                </>
              )}

              {tarea.rubrica && tarea.rubrica.length > 0 && (
                <>
                  <hr />
                  <h6>📐 Criterios de Evaluación</h6>
                  <ListGroup>
                    {tarea.rubrica.map((criterio, index) => (
                      <ListGroup.Item key={index}>
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>{criterio.criterio}</strong>
                            {criterio.descripcion && (
                              <p className="mb-0 text-muted small">{criterio.descripcion}</p>
                            )}
                          </div>
                          <Badge bg="primary">{criterio.puntajeMaximo} pts</Badge>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </>
              )}

              {tarea.archivosAdjuntos && tarea.archivosAdjuntos.length > 0 && (
                <>
                  <hr />
                  <h6>📎 Material de la tarea</h6>
                  <ListGroup>
                    {tarea.archivosAdjuntos.map((archivo, index) => (
                      <ListGroup.Item key={index}>
                        <a href={`${import.meta.env.VITE_API_URL}/${archivo.url}`} target="_blank" rel="noopener noreferrer">
                          📄 {archivo.nombre}
                        </a>
                        <span className="text-muted small ms-2">
                          ({(archivo.tamano / 1024).toFixed(1)} KB)
                        </span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </>
              )}
            </Card.Body>
          </Card>

          {/* Formulario de entrega (solo alumnos) */}
          {esAlumno && (
            <Card className="mb-4">
              <Card.Header className={`${puedeEntregar ? "bg-primary text-white" : "bg-secondary text-white"}`}>
                <h5 className="mb-0">
                  {yaCalificada ? "📊 Tu Entrega (Calificada)" : "📤 Tu Entrega"}
                </h5>
              </Card.Header>
              <Card.Body>
                {!puedeEntregar && !tarea.miEntrega && (
                  <Alert variant="warning">
                    ⚠️ El plazo de entrega ha finalizado y no se permiten entregas tardías.
                  </Alert>
                )}

                {yaCalificada && (
                  <Alert variant="success">
                    <h6>✅ Calificación: {tarea.miEntrega.calificacion} / {tarea.puntajeMaximo}</h6>
                    {tarea.miEntrega.comentarioDocente && (
                      <>
                        <hr />
                        <strong>Comentario del docente:</strong>
                        <p className="mb-0 mt-2">{tarea.miEntrega.comentarioDocente}</p>
                      </>
                    )}
                  </Alert>
                )}

                {successEntrega && (
                  <Alert variant="success" dismissible onClose={() => setSuccessEntrega(null)}>
                    {successEntrega}
                  </Alert>
                )}

                {errorEntrega && (
                  <Alert variant="danger" dismissible onClose={() => setErrorEntrega(null)}>
                    {errorEntrega}
                  </Alert>
                )}

                {puedeEntregar && !yaCalificada && (
                  <Form onSubmit={handleSubmitEntrega}>
                    {(tarea.tipoEntrega === "texto" || tarea.tipoEntrega === "ambos") && (
                      <Form.Group className="mb-3">
                        <Form.Label>Comentario / Texto de la entrega</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          placeholder="Escribe tu respuesta aquí..."
                          required={tarea.tipoEntrega === "texto"}
                        />
                      </Form.Group>
                    )}

                    {(tarea.tipoEntrega === "archivo" || tarea.tipoEntrega === "ambos") && (
                      <Form.Group className="mb-3">
                        <Form.Label>Archivos</Form.Label>
                        <Form.Control
                          type="file"
                          multiple
                          onChange={handleArchivos}
                          accept={tarea.formatosPermitidos.length > 0 
                            ? tarea.formatosPermitidos.map(f => `.${f}`).join(",")
                            : undefined
                          }
                        />
                        <Form.Text className="text-muted">
                          Máximo {tarea.cantidadMaximaArchivos} archivos • 
                          Tamaño máximo: {(tarea.tamanioMaximo / 1048576).toFixed(1)}MB por archivo
                          {tarea.formatosPermitidos.length > 0 && (
                            <> • Formatos: {tarea.formatosPermitidos.join(", ")}</>
                          )}
                        </Form.Text>
                      </Form.Group>
                    )}

                    {archivos.length > 0 && (
                      <Alert variant="info">
                        <strong>Archivos seleccionados:</strong>
                        <ul className="mb-0 mt-2">
                          {archivos.map((archivo, index) => (
                            <li key={index}>
                              {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
                            </li>
                          ))}
                        </ul>
                      </Alert>
                    )}

                    {tarea.miEntrega?.archivosEntregados && tarea.miEntrega.archivosEntregados.length > 0 && (
                      <Alert variant="secondary">
                        <strong>Archivos entregados anteriormente:</strong>
                        <ul className="mb-0 mt-2">
                          {tarea.miEntrega.archivosEntregados.map((archivo, index) => (
                            <li key={index}>
                              <a href={`${import.meta.env.VITE_API_URL}/${archivo.url}`} target="_blank" rel="noopener noreferrer">
                                {archivo.nombre}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </Alert>
                    )}

                    {tarea.estaVencida && tarea.permitirEntregasTarde && (
                      <Alert variant="warning">
                        ⚠️ Esta entrega es tardía. Se aplicará una penalización del {tarea.penalizacionTarde}% sobre la calificación.
                      </Alert>
                    )}
                    <Button
                    type="submit"
                    variant="success"
                    disabled={enviandoEntrega}
                    className="w-100"
                    >
                    {enviandoEntrega ? (
                        <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Enviando...
                        </>
                    ) : (
                        <>
                        {/* Si tiene entrega Y ya subió archivos o comentario, es actualizar */}
                        {tarea.miEntrega && (tarea.miEntrega.archivosEntregados?.length > 0 || tarea.miEntrega.comentarioAlumno)
                            ? "🔄 Actualizar Entrega" 
                            : "📤 Enviar Entrega"}
                        </>
                    )}
                    </Button>

                  </Form>
                )}

                {/* Mostrar entrega existente */}
                {tarea.miEntrega && (
                  <div className="mt-3">
                    <hr />
                    <h6>📋 Detalles de tu entrega</h6>
                    <p className="mb-1">
                      <strong>Fecha:</strong> {new Date(tarea.miEntrega.fechaEntrega).toLocaleString()}
                    </p>
                    {tarea.miEntrega.comentarioAlumno && (
                      <p className="mb-1">
                        <strong>Tu comentario:</strong> {tarea.miEntrega.comentarioAlumno}
                      </p>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Vista de entregas para docente */}
          {esDocente && tarea.estadisticas && (
            <Card>
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">📊 Estadísticas de Entregas</h5>
              </Card.Header>
              <Card.Body>
                <Row className="text-center">
                  <Col>
                    <h3>{tarea.estadisticas.totalInscritos}</h3>
                    <p className="text-muted">Inscritos</p>
                  </Col>
                  <Col>
                    <h3>{tarea.estadisticas.entregas.reduce((sum, e) => sum + e.cantidad, 0)}</h3>
                    <p className="text-muted">Entregas</p>
                  </Col>
                  <Col>
                    <h3>{tarea.estadisticas.porcentajeEntrega}%</h3>
                    <p className="text-muted">% Entregado</p>
                  </Col>
                </Row>

                <hr />

                <Link to={`/dashboard/tareas/${id}/calificar`}>
                  <Button variant="primary" className="w-100">
                    📝 Ver y Calificar Entregas
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">ℹ️ Información</h6>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Docente:</strong><br />
                {tarea.docente?.nombre}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Fecha de apertura:</strong><br />
                {new Date(tarea.fechaApertura).toLocaleString()}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Fecha de cierre:</strong><br />
                {new Date(tarea.fechaCierre).toLocaleString()}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Puntaje:</strong><br />
                {tarea.puntajeMaximo} puntos
              </ListGroup.Item>
              {tarea.permitirEntregasTarde && (
                <ListGroup.Item>
                  <strong>Entregas tardías:</strong><br />
                  Permitidas (penalización: {tarea.penalizacionTarde}%)
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>

          <div className="d-grid gap-2">
            <Link to={esAlumno ? "/dashboard/mis-tareas" : "/dashboard/tareas"}>
              <Button variant="secondary" className="w-100">
                ← Volver a Tareas
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DetalleTarea;