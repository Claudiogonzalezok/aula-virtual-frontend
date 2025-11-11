import { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  Badge,
  Button,
  Table,
  Spinner,
  Modal,
  Form,
  Toast,
  ToastContainer,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import GestionInscripciones from "./GestionInscripciones";
import { usePermissions } from "../../hooks/usePermissions";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();
  
  const [curso, setCurso] = useState(null);
  const [clases, setClases] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInscripciones, setShowInscripciones] = useState(false);
  const [claseActual, setClaseActual] = useState(null);
  const [toast, setToast] = useState({ show: false, mensaje: "", tipo: "success" });
  const [erroresValidacion, setErroresValidacion] = useState([]);

  const [formClase, setFormClase] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    tipo: "virtual",
    enlaceReunion: "",
    contenido: "",
  });

  // Cargar datos del curso
  const cargarCurso = async () => {
    try {
      const { data } = await API.get(`/cursos/${id}`);
      setCurso(data);
    } catch (error) {
      console.error("Error al cargar curso:", error);
      if (error.response?.status === 403) {
        setToast({ show: true, mensaje: "No tienes acceso a este curso", tipo: "danger" });
        setTimeout(() => navigate("/dashboard/cursos"), 2000);
      } else {
        setToast({ show: true, mensaje: "Error al cargar curso", tipo: "danger" });
      }
    }
  };

  // Cargar clases del curso
  const cargarClases = async () => {
    try {
      const { data } = await API.get(`/clases/curso/${id}`);
      setClases(data);
    } catch (error) {
      console.error("Error al cargar clases:", error);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const { data } = await API.get(`/cursos/${id}/estadisticas`);
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      await Promise.all([cargarCurso(), cargarClases(), cargarEstadisticas()]);
      setLoading(false);
    };
    cargarDatos();
  }, [id]);

  // Abrir modal para crear/editar clase
  const abrirModalClase = (clase = null) => {
    setErroresValidacion([]); // Limpiar errores
    
    if (clase) {
      setClaseActual(clase);
      setFormClase({
        titulo: clase.titulo,
        descripcion: clase.descripcion,
        fecha: clase.fecha?.split("T")[0] || "",
        horaInicio: clase.horario?.inicio || clase.horaInicio || "",
        horaFin: clase.horario?.fin || clase.horaFin || "",
        tipo: clase.ubicacion?.tipo || clase.tipo || "virtual",
        enlaceReunion: clase.ubicacion?.enlace || clase.enlaceReunion || "",
        contenido: clase.contenido || "",
      });
    } else {
      setClaseActual(null);
      setFormClase({
        titulo: "",
        descripcion: "",
        fecha: "",
        horaInicio: "",
        horaFin: "",
        tipo: "virtual",
        enlaceReunion: "",
        contenido: "",
      });
    }
    setShowModal(true);
  };

  // 🆕 Validar formulario antes de enviar
  const validarFormulario = () => {
    const errores = [];
    const ahora = new Date();
    const fechaSeleccionada = new Date(formClase.fecha + "T00:00:00");
    const fechaInicioCurso = new Date(curso.fechaInicio);
    const fechaFinCurso = new Date(curso.fechaFin);

    // Validar campos requeridos
    if (!formClase.titulo.trim()) {
      errores.push("El título es requerido");
    }

    if (!formClase.fecha) {
      errores.push("La fecha es requerida");
    }

    if (!formClase.horaInicio) {
      errores.push("La hora de inicio es requerida");
    }

    if (!formClase.horaFin) {
      errores.push("La hora de fin es requerida");
    }

    // Validar fecha no sea del pasado (solo para clases nuevas)
    if (!claseActual) {
      const fechaHoraSeleccionada = new Date(formClase.fecha + "T" + formClase.horaInicio);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaSeleccionada < hoy) {
        errores.push("No se puede crear una clase con fecha pasada");
      }

      // Validar que la fecha y hora no sean del pasado
      if (fechaHoraSeleccionada < ahora) {
        errores.push("La fecha y hora de inicio no pueden ser del pasado");
      }
    }

    // Validar que la fecha esté dentro del rango del curso
    if (formClase.fecha) {
      if (fechaSeleccionada < fechaInicioCurso) {
        errores.push(`La fecha debe ser posterior al inicio del curso (${formatearFecha(curso.fechaInicio)})`);
      }

      if (fechaSeleccionada > fechaFinCurso) {
        errores.push(`La fecha debe ser anterior al fin del curso (${formatearFecha(curso.fechaFin)})`);
      }
    }

    // Validar horarios
    if (formClase.horaInicio && formClase.horaFin) {
      if (formClase.horaInicio >= formClase.horaFin) {
        errores.push("La hora de inicio debe ser anterior a la hora de fin");
      }

      // Validar duración mínima (ej: 30 minutos)
      const [horaIni, minIni] = formClase.horaInicio.split(":").map(Number);
      const [horaFin, minFin] = formClase.horaFin.split(":").map(Number);
      const minutosInicio = horaIni * 60 + minIni;
      const minutosFin = horaFin * 60 + minFin;
      const duracion = minutosFin - minutosInicio;

      if (duracion < 30) {
        errores.push("La clase debe durar al menos 30 minutos");
      }

      if (duracion > 480) { // 8 horas
        errores.push("La clase no puede durar más de 8 horas");
      }
    }

    // Validar enlace de reunión para clases virtuales o híbridas
    if ((formClase.tipo === "virtual" || formClase.tipo === "hibrida") && !formClase.enlaceReunion.trim()) {
      errores.push("El enlace de reunión es requerido para clases virtuales o híbridas");
    }

    // Validar formato de URL si hay enlace
    if (formClase.enlaceReunion.trim()) {
      try {
        new URL(formClase.enlaceReunion);
      } catch {
        errores.push("El enlace de reunión debe ser una URL válida");
      }
    }

    setErroresValidacion(errores);
    return errores.length === 0;
  };

  // Guardar clase
  const guardarClase = async (e) => {
    e.preventDefault();

    // Validar formulario
    if (!validarFormulario()) {
      return;
    }

    try {
      const datosClase = {
        titulo: formClase.titulo.trim(),
        descripcion: formClase.descripcion.trim(),
        fecha: formClase.fecha,
        horario: {
          inicio: formClase.horaInicio,
          fin: formClase.horaFin
        },
        ubicacion: {
          tipo: formClase.tipo,
          enlace: formClase.enlaceReunion.trim() || null
        },
        contenido: formClase.contenido.trim(),
        cursoId: id
      };

      if (claseActual) {
        await API.put(`/clases/${claseActual._id}`, datosClase);
        setToast({ show: true, mensaje: "Clase actualizada correctamente", tipo: "success" });
      } else {
        await API.post("/clases", datosClase);
        setToast({ show: true, mensaje: "Clase creada correctamente", tipo: "success" });
      }
      cargarClases();
      cargarEstadisticas();
      setShowModal(false);
      setErroresValidacion([]);
    } catch (error) {
      console.error("Error al guardar clase:", error);
      const mensaje = error.response?.data?.msg || "Error al guardar clase";
      setToast({ show: true, mensaje, tipo: "danger" });
    }
  };

  // Eliminar clase
  const eliminarClase = async (claseId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta clase?")) return;

    try {
      await API.delete(`/clases/${claseId}`);
      setClases((prev) => prev.filter((c) => c._id !== claseId));
      setToast({ show: true, mensaje: "Clase eliminada correctamente", tipo: "success" });
      cargarEstadisticas();
    } catch (error) {
      console.error("Error al eliminar clase:", error);
      setToast({ show: true, mensaje: "Error al eliminar clase", tipo: "danger" });
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Badge de estado
  const getBadgeEstado = (estado) => {
    if (!estado) return "primary";
    const badges = {
      programada: "primary",
      en_curso: "success",
      finalizada: "secondary",
      cancelada: "danger",
    };
    return badges[estado] || "secondary";
  };

  // 🆕 Obtener fecha mínima para el input (hoy)
  const obtenerFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  // 🆕 Obtener fecha máxima (fin del curso)
  const obtenerFechaMaxima = () => {
    if (!curso?.fechaFin) return "";
    return new Date(curso.fechaFin).toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="text-center my-5">
        <h4>Curso no encontrado</h4>
        <Button onClick={() => navigate("/dashboard/cursos")}>Volver</Button>
      </div>
    );
  }

  const canManage = permissions.canManageClasses(curso.docente?._id);
  const canViewStudents = permissions.canViewStudents(curso.docente?._id);
  const canManageInscriptions = permissions.canManageInscriptions;

  return (
    <div>
      <div className="mb-4">
        <Link to="/dashboard/cursos">
          <Button variant="outline-secondary" size="sm">
            ← Volver a Cursos
          </Button>
        </Link>
      </div>

      <Tabs defaultActiveKey="info" className="mb-3">
        {/* Tab: Información del Curso */}
        <Tab eventKey="info" title="📋 Información">
          <Card className="shadow-sm">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <img
                    src={curso.imagen || "https://via.placeholder.com/300x200?text=Curso"}
                    alt={curso.titulo}
                    className="img-fluid rounded"
                  />
                </Col>
                <Col md={8}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3>{curso.titulo}</h3>
                      <Badge bg="secondary">{curso.codigo}</Badge>
                    </div>
                    <Badge bg={curso.estado === "activo" ? "success" : "secondary"}>
                      {curso.estado.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-muted">{curso.descripcion}</p>

                  <Row className="mt-4">
                    <Col md={6}>
                      <p>
                        <strong>👨‍🏫 Docente:</strong> {curso.docente?.nombre}
                      </p>
                      {canViewStudents && (
                        <p>
                          <strong>👥 Alumnos inscritos:</strong> {curso.alumnos?.length || 0}
                        </p>
                      )}
                      <p>
                        <strong>📚 Categoría:</strong> {curso.categoria}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>📅 Inicio:</strong> {formatearFecha(curso.fechaInicio)}
                      </p>
                      <p>
                        <strong>📅 Fin:</strong> {formatearFecha(curso.fechaFin)}
                      </p>
                      <p>
                        <strong>⏱️ Duración:</strong> {curso.duracionHoras} horas
                      </p>
                    </Col>
                  </Row>

                  {estadisticas && canManage && (
                    <div className="mt-4 p-3 bg-light rounded">
                      <h5>📊 Estadísticas</h5>
                      <Row>
                        <Col md={3}>
                          <strong>Total Clases:</strong>
                          <br />
                          {estadisticas.totalClases}
                        </Col>
                        <Col md={3}>
                          <strong>Finalizadas:</strong>
                          <br />
                          {estadisticas.clasesFinalizadas}
                        </Col>
                        <Col md={3}>
                          <strong>Programadas:</strong>
                          <br />
                          {estadisticas.clasesProgramadas}
                        </Col>
                        <Col md={3}>
                          <strong>Progreso:</strong>
                          <br />
                          {estadisticas.progreso}%
                        </Col>
                      </Row>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* Tab: Clases */}
        <Tab eventKey="clases" title={`📚 Clases (${clases.length})`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Clases del Curso</h5>
            {canManage && (
              <Button variant="success" onClick={() => abrirModalClase()}>
                ➕ Nueva Clase
              </Button>
            )}
          </div>

          {clases.length === 0 ? (
            <div className="text-center text-muted my-5">
              No hay clases programadas para este curso
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  {canManage && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {clases.map((clase, index) => (
                  <tr key={clase._id}>
                    <td>{index + 1}</td>
                    <td>{clase.titulo}</td>
                    <td>{formatearFecha(clase.fecha)}</td>
                    <td>
                      {clase.horario?.inicio || clase.horaInicio} - {clase.horario?.fin || clase.horaFin}
                    </td>
                    <td>
                      <Badge bg="info">{clase.ubicacion?.tipo || clase.tipo}</Badge>
                    </td>
                    <td>
                      <Badge bg={getBadgeEstado(clase.estado)}>
                        {clase.estado ? clase.estado.replace("_", " ") : "programada"}
                      </Badge>
                    </td>
                    {canManage && (
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-2"
                          onClick={() => abrirModalClase(clase)}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => eliminarClase(clase._id)}
                        >
                          🗑️
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        {/* Tab: Alumnos */}
        {canViewStudents && (
          <Tab eventKey="alumnos" title={`👥 Alumnos (${curso.alumnos?.length || 0})`}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Alumnos Inscritos</h5>
              {canManageInscriptions && (
                <Button 
                  variant="success" 
                  onClick={() => setShowInscripciones(true)}
                >
                  ➕ Gestionar Inscripciones
                </Button>
              )}
            </div>

            {curso.alumnos?.length === 0 ? (
              <div className="text-center text-muted my-5">
                <p>No hay alumnos inscritos en este curso</p>
                {canManageInscriptions && (
                  <Button 
                    variant="primary" 
                    onClick={() => setShowInscripciones(true)}
                  >
                    Inscribir Alumnos
                  </Button>
                )}
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    {canManageInscriptions && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {curso.alumnos?.map((alumno, index) => (
                    <tr key={alumno._id}>
                      <td>{index + 1}</td>
                      <td>{alumno.nombre}</td>
                      <td>{alumno.email}</td>
                      {canManageInscriptions && (
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={async () => {
                              if (window.confirm(`¿Desinscribir a ${alumno.nombre}?`)) {
                                try {
                                  await API.post(`/cursos/${id}/desinscribir`, {
                                    alumnoId: alumno._id
                                  });
                                  setToast({ 
                                    show: true, 
                                    mensaje: "Alumno desinscrito correctamente", 
                                    tipo: "success" 
                                  });
                                  cargarCurso();
                                } catch (error) {
                                  setToast({ 
                                    show: true, 
                                    mensaje: "Error al desinscribir alumno", 
                                    tipo: "danger" 
                                  });
                                }
                              }
                            }}
                          >
                            Desinscribir
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>
        )}
      </Tabs>

      {/* Modal de Gestión de Inscripciones */}
      {canManageInscriptions && (
        <GestionInscripciones
          show={showInscripciones}
          onHide={() => setShowInscripciones(false)}
          curso={curso}
          onActualizar={() => {
            cargarCurso();
            cargarEstadisticas();
          }}
        />
      )}

      {/* Modal para crear/editar clase */}
      {canManage && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{claseActual ? "Editar Clase" : "Nueva Clase"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* 🆕 Mostrar errores de validación */}
            {erroresValidacion.length > 0 && (
              <Alert variant="danger" onClose={() => setErroresValidacion([])} dismissible>
                <Alert.Heading>Por favor corrige los siguientes errores:</Alert.Heading>
                <ul className="mb-0">
                  {erroresValidacion.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <Form onSubmit={guardarClase}>
              <Form.Group className="mb-3">
                <Form.Label>Título *</Form.Label>
                <Form.Control
                  value={formClase.titulo}
                  onChange={(e) => setFormClase({ ...formClase, titulo: e.target.value })}
                  required
                  placeholder="Ej: Introducción a la programación"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formClase.descripcion}
                  onChange={(e) => setFormClase({ ...formClase, descripcion: e.target.value })}
                  placeholder="Breve descripción de la clase..."
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha *</Form.Label>
                    <Form.Control
                      type="date"
                      value={formClase.fecha}
                      onChange={(e) => setFormClase({ ...formClase, fecha: e.target.value })}
                      min={claseActual ? "" : obtenerFechaMinima()}
                      max={obtenerFechaMaxima()}
                      required
                    />
                    <Form.Text className="text-muted">
                      Entre {formatearFecha(curso.fechaInicio)} y {formatearFecha(curso.fechaFin)}
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hora Inicio *</Form.Label>
                    <Form.Control
                      type="time"
                      value={formClase.horaInicio}
                      onChange={(e) => setFormClase({ ...formClase, horaInicio: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hora Fin *</Form.Label>
                    <Form.Control
                      type="time"
                      value={formClase.horaFin}
                      onChange={(e) => setFormClase({ ...formClase, horaFin: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Tipo *</Form.Label>
                <Form.Select
                  value={formClase.tipo}
                  onChange={(e) => setFormClase({ ...formClase, tipo: e.target.value })}
                  required
                >
                  <option value="virtual">Virtual</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrida">Híbrida</option>
                </Form.Select>
              </Form.Group>

              {(formClase.tipo === "virtual" || formClase.tipo === "hibrida") && (
                <Form.Group className="mb-3">
                  <Form.Label>
                    Enlace de Reunión *
                  </Form.Label>
                  <Form.Control
                    type="url"
                    value={formClase.enlaceReunion}
                    onChange={(e) => setFormClase({ ...formClase, enlaceReunion: e.target.value })}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    required={formClase.tipo === "virtual" || formClase.tipo === "hibrida"}
                  />
                  <Form.Text className="text-muted">
                    URL completa del enlace de videollamada
                  </Form.Text>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Contenido</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formClase.contenido}
                  onChange={(e) => setFormClase({ ...formClase, contenido: e.target.value })}
                  placeholder="Temas a tratar en la clase..."
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" variant="success">
                  {claseActual ? "💾 Actualizar" : "➕ Crear"}
                </Button>
                <Button variant="secondary" onClick={() => {
                  setShowModal(false);
                  setErroresValidacion([]);
                }}>
                  Cancelar
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* Toast de mensajes */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.tipo}
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">
              {toast.tipo === "success" ? "Éxito" : "Error"}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toast.mensaje}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default CourseDetail;