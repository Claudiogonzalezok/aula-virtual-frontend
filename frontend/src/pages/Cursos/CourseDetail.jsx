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
} from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import GestionInscripciones from "./GestionInscripciones";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [clases, setClases] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [claseActual, setClaseActual] = useState(null);
  const [toast, setToast] = useState({ show: false, mensaje: "", tipo: "success" });

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
      setToast({ show: true, mensaje: "Error al cargar curso", tipo: "danger" });
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
    if (clase) {
      setClaseActual(clase);
      setFormClase({
        titulo: clase.titulo,
        descripcion: clase.descripcion,
        fecha: clase.fecha?.split("T")[0] || "",
        horaInicio: clase.horaInicio,
        horaFin: clase.horaFin,
        tipo: clase.tipo,
        enlaceReunion: clase.enlaceReunion || "",
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

  // Guardar clase
  const guardarClase = async (e) => {
    e.preventDefault();

    try {
      if (claseActual) {
        await API.put(`/clases/${claseActual._id}`, formClase);
        setToast({ show: true, mensaje: "Clase actualizada correctamente", tipo: "success" });
      } else {
        await API.post("/clases", { ...formClase, curso: id });
        setToast({ show: true, mensaje: "Clase creada correctamente", tipo: "success" });
      }
      cargarClases();
      cargarEstadisticas();
      setShowModal(false);
    } catch (error) {
      console.error("Error al guardar clase:", error);
      setToast({ show: true, mensaje: "Error al guardar clase", tipo: "danger" });
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
    if (!estado) return "primary"; // Por defecto si no hay estado
    const badges = {
      programada: "primary",
      en_curso: "success",
      finalizada: "secondary",
      cancelada: "danger",
    };
    return badges[estado] || "secondary";
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
                      <p>
                        <strong>👥 Alumnos inscritos:</strong> {curso.alumnos?.length || 0}
                      </p>
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

                  {estadisticas && (
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
            <Button variant="success" onClick={() => abrirModalClase()}>
              ➕ Nueva Clase
            </Button>
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clases.map((clase, index) => (
                  <tr key={clase._id}>
                    <td>{index + 1}</td>
                    <td>{clase.titulo}</td>
                    <td>{formatearFecha(clase.fecha)}</td>
                    <td>
                      {clase.horaInicio} - {clase.horaFin}
                    </td>
                    <td>
                      <Badge bg="info">{clase.tipo}</Badge>
                    </td>
                    <td>
                      <Badge bg={getBadgeEstado(clase.estado)}>
                        {clase.estado ? clase.estado.replace("_", " ") : "programada"}
                      </Badge>
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>

        {/* Tab: Alumnos */}
        <Tab eventKey="alumnos" title={`👥 Alumnos (${curso.alumnos?.length || 0})`}>
          {curso.alumnos?.length === 0 ? (
            <div className="text-center text-muted my-5">
              No hay alumnos inscritos en este curso
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {curso.alumnos?.map((alumno, index) => (
                  <tr key={alumno._id}>
                    <td>{index + 1}</td>
                    <td>{alumno.nombre}</td>
                    <td>{alumno.email}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>

      {/* Modal para crear/editar clase */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{claseActual ? "Editar Clase" : "Nueva Clase"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={guardarClase}>
            <Form.Group className="mb-3">
              <Form.Label>Título *</Form.Label>
              <Form.Control
                value={formClase.titulo}
                onChange={(e) => setFormClase({ ...formClase, titulo: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formClase.descripcion}
                onChange={(e) => setFormClase({ ...formClase, descripcion: e.target.value })}
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
                    required
                  />
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

            <Form.Group className="mb-3">
              <Form.Label>Enlace de Reunión</Form.Label>
              <Form.Control
                type="url"
                value={formClase.enlaceReunion}
                onChange={(e) => setFormClase({ ...formClase, enlaceReunion: e.target.value })}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contenido</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formClase.contenido}
                onChange={(e) => setFormClase({ ...formClase, contenido: e.target.value })}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="success">
                {claseActual ? "💾 Actualizar" : "➕ Crear"}
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

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