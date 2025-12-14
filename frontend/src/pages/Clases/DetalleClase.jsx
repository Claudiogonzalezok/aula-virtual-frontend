// frontend/src/pages/Clases/DetalleClase.jsx
import { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Button,
  Spinner,
  Alert,
  ListGroup,
  ProgressBar,
  Table,
  Modal,
  Form,
} from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaVideo,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaCalendarAlt,
  FaPlay,
  FaBook,
  FaChalkboardTeacher,
  FaFileAlt,
  FaDownload,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCheck,
  FaEdit,
  FaTrash,
  FaPlus,
  FaLink,
  FaCopy,
  FaExclamationTriangle,
  FaBullseye,
  FaClipboardList,
  FaSave,
  FaBan,
} from "react-icons/fa";

const DetalleClase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  const [clase, setClase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ahora, setAhora] = useState(new Date());

  // Modal para agregar material
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [nuevoMaterial, setNuevoMaterial] = useState({
    nombre: "",
    tipo: "documento",
    url: "",
    descripcion: "",
  });
  const [guardandoMaterial, setGuardandoMaterial] = useState(false);

  // Modal para confirmar eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Modal para editar clase
  const [showEditModal, setShowEditModal] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [formEdicion, setFormEdicion] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    tipo: "virtual",
    enlaceReunion: "",
    contenido: "",
    estado: "programada",
  });

  const esDocente = usuario?.rol === "docente";
  const esAlumno = usuario?.rol === "alumno";
  const esAdmin = usuario?.rol === "admin";
  const puedeEditar = esDocente || esAdmin;

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setAhora(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    cargarClase();
  }, [id]);

  const cargarClase = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/clases/${id}`);
      setClase(data);
      // Inicializar formulario de edición
      setFormEdicion({
        titulo: data.titulo || "",
        descripcion: data.descripcion || "",
        fecha: data.fecha ? data.fecha.split("T")[0] : "",
        horaInicio: data.horaInicio || "",
        horaFin: data.horaFin || "",
        tipo: data.tipo || "virtual",
        enlaceReunion: data.enlaceReunion || "",
        contenido: data.contenido || "",
        estado: data.estado || "programada",
      });
    } catch (error) {
      console.error("Error al cargar clase:", error);
      toast.error(error.response?.data?.msg || "Error al cargar la clase");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HELPERS DE TIEMPO Y ESTADO
  // ============================================

  const obtenerFechaHora = (tipo) => {
    if (!clase) return new Date();
    const fecha = new Date(clase.fecha);
    const [horas, minutos] = (
      tipo === "inicio" ? clase.horaInicio : clase.horaFin
    ).split(":");
    fecha.setHours(parseInt(horas), parseInt(minutos), 0, 0);
    return fecha;
  };

  const calcularEstadoTiempo = () => {
    if (!clase) return { tipo: "programada" };

    const fechaInicio = obtenerFechaHora("inicio");
    const fechaFin = obtenerFechaHora("fin");
    const diferencia = fechaInicio - ahora;
    const minutosRestantes = Math.floor(diferencia / (1000 * 60));

    if (clase.estado === "cancelada") {
      return { tipo: "cancelada", minutosRestantes: null };
    }

    if (ahora > fechaFin) {
      return { tipo: "finalizada", minutosRestantes: null };
    }

    if (ahora >= fechaInicio && ahora <= fechaFin) {
      const minutosTranscurridos = Math.floor(
        (ahora - fechaInicio) / (1000 * 60)
      );
      const duracionTotal = Math.floor((fechaFin - fechaInicio) / (1000 * 60));
      return {
        tipo: "en_curso",
        minutosRestantes: duracionTotal - minutosTranscurridos,
        progreso: (minutosTranscurridos / duracionTotal) * 100,
        duracionTotal,
      };
    }

    if (minutosRestantes > 0 && minutosRestantes <= 30) {
      return { tipo: "proxima", minutosRestantes };
    }

    const hoy = new Date();
    if (fechaInicio.toDateString() === hoy.toDateString()) {
      return { tipo: "hoy", minutosRestantes };
    }

    return { tipo: "programada", minutosRestantes: null };
  };

  const estadoTiempo = calcularEstadoTiempo();

  // ============================================
  // FORMATEO
  // ============================================

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calcularDuracion = () => {
    if (!clase) return "0";
    const inicio = obtenerFechaHora("inicio");
    const fin = obtenerFechaHora("fin");
    const minutos = Math.floor((fin - inicio) / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas > 0) {
      return `${horas}h ${mins > 0 ? `${mins}m` : ""}`;
    }
    return `${mins} minutos`;
  };

  const getTipoIcono = (tipo) => {
    switch (tipo) {
      case "virtual":
        return <FaVideo className="me-2 text-primary" />;
      case "presencial":
        return <FaMapMarkerAlt className="me-2 text-success" />;
      case "hibrida":
        return <FaUsers className="me-2 text-warning" />;
      default:
        return null;
    }
  };

  const getTipoMaterialIcono = (tipo) => {
    switch (tipo) {
      case "video":
        return <FaVideo className="text-danger" />;
      case "enlace":
        return <FaLink className="text-primary" />;
      case "presentacion":
        return <FaFileAlt className="text-warning" />;
      default:
        return <FaFileAlt className="text-secondary" />;
    }
  };

  // ============================================
  // ACCIONES
  // ============================================

  const copiarEnlace = () => {
    if (clase?.enlaceReunion) {
      navigator.clipboard.writeText(clase.enlaceReunion);
      toast.success("📋 Enlace copiado al portapapeles");
    }
  };

  const agregarMaterial = async () => {
    if (!nuevoMaterial.nombre || !nuevoMaterial.url) {
      toast.warning("El nombre y la URL son requeridos");
      return;
    }

    setGuardandoMaterial(true);
    try {
      await API.post(`/clases/${id}/materiales`, nuevoMaterial);
      toast.success("✅ Material agregado correctamente");
      setShowMaterialModal(false);
      setNuevoMaterial({ nombre: "", tipo: "documento", url: "", descripcion: "" });
      cargarClase();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al agregar material");
    } finally {
      setGuardandoMaterial(false);
    }
  };

  const eliminarMaterial = async (materialId) => {
    if (!window.confirm("¿Eliminar este material?")) return;

    try {
      await API.delete(`/clases/${id}/materiales/${materialId}`);
      toast.success("Material eliminado");
      cargarClase();
    } catch (error) {
      toast.error("Error al eliminar material");
    }
  };

  const eliminarClase = async () => {
    setEliminando(true);
    try {
      await API.delete(`/clases/${id}`);
      toast.success("Clase eliminada correctamente");
      navigate("/dashboard/clases");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al eliminar la clase");
    } finally {
      setEliminando(false);
      setShowDeleteModal(false);
    }
  };

  // ============================================
  // EDICIÓN DE CLASE
  // ============================================

  const abrirModalEdicion = () => {
    setFormEdicion({
      titulo: clase.titulo || "",
      descripcion: clase.descripcion || "",
      fecha: clase.fecha ? clase.fecha.split("T")[0] : "",
      horaInicio: clase.horaInicio || "",
      horaFin: clase.horaFin || "",
      tipo: clase.tipo || "virtual",
      enlaceReunion: clase.enlaceReunion || "",
      contenido: clase.contenido || "",
      estado: clase.estado || "programada",
    });
    setShowEditModal(true);
  };

  const guardarEdicion = async () => {
    // Validaciones
    if (!formEdicion.titulo.trim()) {
      toast.warning("El título es requerido");
      return;
    }
    if (!formEdicion.fecha) {
      toast.warning("La fecha es requerida");
      return;
    }
    if (!formEdicion.horaInicio || !formEdicion.horaFin) {
      toast.warning("El horario es requerido");
      return;
    }
    if (formEdicion.horaInicio >= formEdicion.horaFin) {
      toast.warning("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }

    setGuardandoEdicion(true);
    try {
      const datosActualizacion = {
        titulo: formEdicion.titulo,
        descripcion: formEdicion.descripcion,
        fecha: formEdicion.fecha,
        horario: {
          inicio: formEdicion.horaInicio,
          fin: formEdicion.horaFin,
        },
        ubicacion: {
          tipo: formEdicion.tipo,
          enlace: formEdicion.enlaceReunion,
        },
        contenido: formEdicion.contenido,
        estado: formEdicion.estado,
      };

      await API.put(`/clases/${id}`, datosActualizacion);
      toast.success("✅ Clase actualizada correctamente");
      setShowEditModal(false);
      cargarClase();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al actualizar la clase");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const cambiarEstadoClase = async (nuevoEstado) => {
    try {
      await API.put(`/clases/${id}/estado`, { estado: nuevoEstado });
      toast.success(`Estado cambiado a: ${nuevoEstado.replace("_", " ")}`);
      cargarClase();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al cambiar estado");
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando clase...</p>
      </div>
    );
  }

  if (!clase) {
    return (
      <Alert variant="danger">
        <h5>Clase no encontrada</h5>
        <Button variant="danger" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Alert>
    );
  }

  const esEnCurso = estadoTiempo.tipo === "en_curso";
  const esProxima = estadoTiempo.tipo === "proxima";
  const esCancelada = estadoTiempo.tipo === "cancelada";
  const esFinalizada = estadoTiempo.tipo === "finalizada";

  return (
    <div>
      {/* Header con botón volver */}
      <div className="mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-3"
        >
          <FaArrowLeft className="me-2" />
          Volver
        </Button>

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">{clase.titulo}</h2>
            <p className="text-muted mb-0">
              <FaBook className="me-1" />
              {clase.curso?.codigo} - {clase.curso?.titulo}
            </p>
            {clase.curso?.docente && (
              <p className="text-muted mb-0">
                <FaChalkboardTeacher className="me-1" />
                {clase.curso.docente.nombre}
              </p>
            )}
          </div>

          {puedeEditar && (
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={abrirModalEdicion}
              >
                <FaEdit className="me-1" /> Editar
              </Button>
              {clase.estado !== "cancelada" && (
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => cambiarEstadoClase("cancelada")}
                >
                  <FaBan className="me-1" /> Cancelar Clase
                </Button>
              )}
              {clase.estado === "cancelada" && (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => cambiarEstadoClase("programada")}
                >
                  <FaCheckCircle className="me-1" /> Reactivar
                </Button>
              )}
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <FaTrash className="me-1" /> Eliminar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* ALERTAS DE ESTADO EN TIEMPO REAL */}
      {/* ============================================ */}

      {esEnCurso && (
        <Alert variant="success" className="shadow-sm mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center">
              <FaPlay className="me-3 fs-3" />
              <div>
                <strong className="fs-5">¡Esta clase está en curso!</strong>
                <p className="mb-0">
                  Quedan aproximadamente {estadoTiempo.minutosRestantes} minutos
                </p>
                <ProgressBar
                  now={estadoTiempo.progreso}
                  variant="success"
                  className="mt-2"
                  style={{ width: "200px", height: "8px" }}
                />
              </div>
            </div>
            {clase.tipo === "virtual" && clase.enlaceReunion && (
              <Button
                variant="success"
                size="lg"
                href={clase.enlaceReunion}
                target="_blank"
              >
                <FaVideo className="me-2" />
                Unirse a la clase
              </Button>
            )}
          </div>
        </Alert>
      )}

      {esProxima && (
        <Alert variant="warning" className="shadow-sm mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center">
              <FaClock className="me-3 fs-3" />
              <div>
                <strong className="fs-5">¡La clase comienza pronto!</strong>
                <p className="mb-0">
                  Faltan {estadoTiempo.minutosRestantes} minutos para que inicie
                </p>
              </div>
            </div>
            {clase.tipo === "virtual" && clase.enlaceReunion && (
              <Button
                variant="warning"
                size="lg"
                href={clase.enlaceReunion}
                target="_blank"
              >
                <FaVideo className="me-2" />
                Preparar enlace
              </Button>
            )}
          </div>
        </Alert>
      )}

      {esCancelada && (
        <Alert variant="danger" className="shadow-sm mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>Esta clase ha sido cancelada</strong>
        </Alert>
      )}

      <Row>
        {/* Columna principal */}
        <Col lg={8}>
          {/* Información general */}
          <Card className="shadow-sm mb-4">
            <Card.Header
              className={`${
                esEnCurso
                  ? "bg-success"
                  : esProxima
                  ? "bg-warning text-dark"
                  : esCancelada
                  ? "bg-danger"
                  : esFinalizada
                  ? "bg-secondary"
                  : "bg-primary"
              } text-white`}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {esEnCurso && <FaPlay className="me-2" />}
                  {esProxima && <FaClock className="me-2" />}
                  Información de la Clase
                </h5>
                <Badge
                  bg={esEnCurso || esProxima ? "light" : "dark"}
                  text={esEnCurso || esProxima ? "dark" : "white"}
                  className={esEnCurso ? "pulso" : ""}
                >
                  {esEnCurso
                    ? "EN CURSO"
                    : esProxima
                    ? `Inicia en ${estadoTiempo.minutosRestantes} min`
                    : clase.estado?.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              {clase.descripcion && (
                <>
                  <p className="lead">{clase.descripcion}</p>
                  <hr />
                </>
              )}

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>
                      <FaCalendarAlt className="me-2 text-primary" />
                      Fecha:
                    </strong>
                    <p className="mb-0 ms-4 text-capitalize">
                      {formatearFecha(clase.fecha)}
                    </p>
                  </div>

                  <div className="mb-3">
                    <strong>
                      <FaClock className="me-2 text-info" />
                      Horario:
                    </strong>
                    <p className="mb-0 ms-4">
                      {clase.horaInicio} - {clase.horaFin}
                      <Badge bg="light" text="dark" className="ms-2">
                        {calcularDuracion()}
                      </Badge>
                    </p>
                  </div>

                  <div className="mb-3">
                    <strong>
                      {getTipoIcono(clase.tipo)}
                      Modalidad:
                    </strong>
                    <p className="mb-0 ms-4 text-capitalize">{clase.tipo}</p>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mb-3">
                    <strong>
                      <FaBook className="me-2 text-success" />
                      Curso:
                    </strong>
                    <p className="mb-0 ms-4">
                      <Link
                        to={`/dashboard/cursos/${clase.curso?._id}`}
                        className="text-decoration-none"
                      >
                        {clase.curso?.codigo} - {clase.curso?.titulo}
                      </Link>
                    </p>
                  </div>

                  {clase.curso?.docente && (
                    <div className="mb-3">
                      <strong>
                        <FaChalkboardTeacher className="me-2 text-warning" />
                        Docente:
                      </strong>
                      <p className="mb-0 ms-4">{clase.curso.docente.nombre}</p>
                    </div>
                  )}

                  {clase.orden > 0 && (
                    <div className="mb-3">
                      <strong>
                        <FaClipboardList className="me-2 text-secondary" />
                        Número de clase:
                      </strong>
                      <p className="mb-0 ms-4">Clase #{clase.orden}</p>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ============================================ */}
          {/* ENLACE DE ACCESO (para clases virtuales) */}
          {/* ============================================ */}

          {clase.tipo === "virtual" && clase.enlaceReunion && (
            <Card
              className={`shadow-sm mb-4 ${
                esEnCurso ? "border-success border-2" : ""
              }`}
            >
              <Card.Header
                className={esEnCurso ? "bg-success text-white" : "bg-light"}
              >
                <h5 className="mb-0">
                  <FaVideo className="me-2" />
                  Enlace de Acceso a la Clase Virtual
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div
                    className="flex-grow-1 bg-light p-3 rounded border"
                    style={{ wordBreak: "break-all" }}
                    >
                    <FaLink className="me-2 text-primary" />
                    <a
                        href={clase.enlaceReunion}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                    >
                        {clase.enlaceReunion}
                    </a>
                    </div>

                  <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={copiarEnlace}>
                      <FaCopy className="me-1" /> Copiar
                    </Button>
                    <Button
                      variant={esEnCurso ? "success" : "primary"}
                      href={clase.enlaceReunion}
                      target="_blank"
                      size={esEnCurso ? "lg" : "md"}
                    >
                      <FaExternalLinkAlt className="me-1" />
                      {esEnCurso ? "Unirse ahora" : "Abrir enlace"}
                    </Button>
                  </div>
                </div>

                {esEnCurso && (
                  <Alert variant="success" className="mt-3 mb-0">
                    <FaPlay className="me-2" />
                    <strong>¡La clase está en curso!</strong> Haz clic en
                    "Unirse ahora" para entrar a la sesión.
                  </Alert>
                )}

                {esProxima && (
                  <Alert variant="warning" className="mt-3 mb-0">
                    <FaClock className="me-2" />
                    La clase comenzará en {estadoTiempo.minutosRestantes}{" "}
                    minutos. Te recomendamos probar el enlace antes.
                  </Alert>
                )}

                {!esEnCurso && !esProxima && !esFinalizada && !esCancelada && (
                  <Alert variant="info" className="mt-3 mb-0">
                    <FaCalendarAlt className="me-2" />
                    Guarda este enlace. Lo necesitarás el{" "}
                    {formatearFechaCorta(clase.fecha)} a las {clase.horaInicio}.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Clase virtual sin enlace */}
          {clase.tipo === "virtual" && !clase.enlaceReunion && (
            <Card className="shadow-sm mb-4 border-warning">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">
                  <FaVideo className="me-2" />
                  Enlace de Acceso
                </h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="warning" className="mb-0">
                  <FaExclamationTriangle className="me-2" />
                  <strong>Enlace no configurado.</strong> El docente aún no ha
                  agregado el enlace de la reunión virtual.
                  {puedeEditar && (
                    <div className="mt-2">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={abrirModalEdicion}
                      >
                        <FaEdit className="me-1" /> Agregar enlace ahora
                      </Button>
                    </div>
                  )}
                </Alert>
              </Card.Body>
            </Card>
          )}

          {/* Clase presencial */}
          {clase.tipo === "presencial" && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <FaMapMarkerAlt className="me-2 text-success" />
                  Ubicación de la Clase Presencial
                </h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="info" className="mb-0">
                  <FaMapMarkerAlt className="me-2" />
                  Esta es una clase presencial. Consulta con tu docente la
                  ubicación exacta del aula.
                </Alert>
              </Card.Body>
            </Card>
          )}

          {/* ============================================ */}
          {/* CONTENIDO DE LA CLASE */}
          {/* ============================================ */}

          {clase.contenido && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <FaBook className="me-2" />
                  Contenido de la Clase
                </h5>
              </Card.Header>
              <Card.Body>
                <div style={{ whiteSpace: "pre-wrap" }}>{clase.contenido}</div>
              </Card.Body>
            </Card>
          )}

          {/* ============================================ */}
          {/* OBJETIVOS */}
          {/* ============================================ */}

          {clase.objetivos && clase.objetivos.length > 0 && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <FaBullseye className="me-2 text-danger" />
                  Objetivos de la Clase
                </h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {clase.objetivos.map((objetivo, index) => (
                    <ListGroup.Item key={index} className="ps-0">
                      <FaCheckCircle className="me-2 text-success" />
                      {objetivo}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}

          {/* ============================================ */}
          {/* MATERIALES */}
          {/* ============================================ */}

          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaFileAlt className="me-2" />
                Materiales ({clase.materiales?.length || 0})
              </h5>
              {puedeEditar && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setShowMaterialModal(true)}
                >
                  <FaPlus className="me-1" /> Agregar
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {!clase.materiales || clase.materiales.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <FaFileAlt size={40} className="mb-2" />
                  <p className="mb-0">No hay materiales disponibles</p>
                </div>
              ) : (
                <ListGroup>
                  {clase.materiales.map((material) => (
                    <ListGroup.Item
                      key={material._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          {getTipoMaterialIcono(material.tipo)}
                        </div>
                        <div>
                          <strong>{material.nombre}</strong>
                          {material.descripcion && (
                            <p className="mb-0 small text-muted">
                              {material.descripcion}
                            </p>
                          )}
                          <Badge bg="secondary" className="mt-1">
                            {material.tipo}
                          </Badge>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={material.url}
                          target="_blank"
                        >
                          <FaDownload className="me-1" /> Descargar
                        </Button>
                        {puedeEditar && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => eliminarMaterial(material._id)}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>

          {/* ============================================ */}
          {/* ASISTENCIA (solo para docentes) */}
          {/* ============================================ */}

          {puedeEditar && clase.asistencias && clase.asistencias.length > 0 && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">
                  <FaUserCheck className="me-2" />
                  Registro de Asistencia ({clase.asistencias.length})
                </h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clase.asistencias.map((asistencia) => (
                      <tr key={asistencia._id}>
                        <td>{asistencia.estudiante?.nombre}</td>
                        <td>{asistencia.estudiante?.email}</td>
                        <td>
                          {asistencia.presente ? (
                            <Badge bg="success">
                              <FaCheckCircle className="me-1" /> Presente
                            </Badge>
                          ) : (
                            <Badge bg="danger">
                              <FaTimesCircle className="me-1" /> Ausente
                            </Badge>
                          )}
                        </td>
                        <td>
                          {new Date(asistencia.fechaRegistro).toLocaleString(
                            "es-AR"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* ============================================ */}
        {/* COLUMNA LATERAL */}
        {/* ============================================ */}

        <Col lg={4}>
          {/* Acciones rápidas */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">Acciones Rápidas</h5>
            </Card.Header>
            <Card.Body className="d-grid gap-2">
              {clase.tipo === "virtual" && clase.enlaceReunion && (
                <Button
                  variant={esEnCurso ? "success" : "primary"}
                  size="lg"
                  href={clase.enlaceReunion}
                  target="_blank"
                  disabled={esCancelada}
                >
                  <FaVideo className="me-2" />
                  {esEnCurso ? "Unirse a la clase" : "Abrir enlace de reunión"}
                </Button>
              )}

              <Button
                variant="outline-primary"
                as={Link}
                to={`/dashboard/cursos/${clase.curso?._id}`}
              >
                <FaBook className="me-2" />
                Ver Curso
              </Button>

              {puedeEditar && (
                <>
                  <Button
                    variant="outline-success"
                    onClick={() => setShowMaterialModal(true)}
                  >
                    <FaPlus className="me-2" />
                    Agregar Material
                  </Button>

                  <Button
                    variant="outline-secondary"
                    onClick={abrirModalEdicion}
                  >
                    <FaEdit className="me-2" />
                    Editar Clase
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>

          {/* Info del curso */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <FaBook className="me-2" />
                Sobre el Curso
              </h6>
            </Card.Header>
            <Card.Body>
              <p className="mb-1">
                <strong>{clase.curso?.titulo}</strong>
              </p>
              <p className="text-muted small mb-2">{clase.curso?.codigo}</p>

              {clase.curso?.docente && (
                <p className="mb-0">
                  <FaChalkboardTeacher className="me-2" />
                  {clase.curso.docente.nombre}
                </p>
              )}

              <hr />

              <Link
                to={`/dashboard/cursos/${clase.curso?._id}`}
                className="text-decoration-none"
              >
                Ver todas las clases del curso →
              </Link>
            </Card.Body>
          </Card>

          {/* Resumen de estado */}
          <Card className="shadow-sm">
            <Card.Header
              className={`${
                esEnCurso
                  ? "bg-success"
                  : esProxima
                  ? "bg-warning"
                  : esCancelada
                  ? "bg-danger"
                  : esFinalizada
                  ? "bg-secondary"
                  : "bg-info"
              } text-white`}
            >
              <h6 className="mb-0">Estado de la Clase</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-3">
                {esEnCurso && (
                  <>
                    <FaPlay className="text-success mb-2" size={40} />
                    <h5 className="text-success">EN CURSO</h5>
                    <p className="mb-0">
                      Quedan {estadoTiempo.minutosRestantes} min
                    </p>
                  </>
                )}
                {esProxima && (
                  <>
                    <FaClock className="text-warning mb-2" size={40} />
                    <h5 className="text-warning">PRÓXIMA</h5>
                    <p className="mb-0">
                      Comienza en {estadoTiempo.minutosRestantes} min
                    </p>
                  </>
                )}
                {estadoTiempo.tipo === "hoy" && (
                  <>
                    <FaCalendarAlt className="text-info mb-2" size={40} />
                    <h5 className="text-info">HOY</h5>
                    <p className="mb-0">A las {clase.horaInicio}</p>
                  </>
                )}
                {estadoTiempo.tipo === "programada" && (
                  <>
                    <FaCalendarAlt className="text-primary mb-2" size={40} />
                    <h5 className="text-primary">PROGRAMADA</h5>
                    <p className="mb-0">{formatearFechaCorta(clase.fecha)}</p>
                  </>
                )}
                {esFinalizada && (
                  <>
                    <FaCheckCircle className="text-secondary mb-2" size={40} />
                    <h5 className="text-secondary">FINALIZADA</h5>
                    <p className="mb-0">Clase completada</p>
                  </>
                )}
                {esCancelada && (
                  <>
                    <FaTimesCircle className="text-danger mb-2" size={40} />
                    <h5 className="text-danger">CANCELADA</h5>
                    <p className="mb-0">Esta clase fue cancelada</p>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ============================================ */}
      {/* MODAL EDITAR CLASE */}
      {/* ============================================ */}

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Editar Clase
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Título <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Introducción a la programación"
                    value={formEdicion.titulo}
                    onChange={(e) =>
                      setFormEdicion({ ...formEdicion, titulo: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Breve descripción de la clase..."
                    value={formEdicion.descripcion}
                    onChange={(e) =>
                      setFormEdicion({
                        ...formEdicion,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Fecha <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formEdicion.fecha}
                    onChange={(e) =>
                      setFormEdicion({ ...formEdicion, fecha: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Hora Inicio <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    value={formEdicion.horaInicio}
                    onChange={(e) =>
                      setFormEdicion({
                        ...formEdicion,
                        horaInicio: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Hora Fin <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="time"
                    value={formEdicion.horaFin}
                    onChange={(e) =>
                      setFormEdicion({
                        ...formEdicion,
                        horaFin: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Modalidad</Form.Label>
                  <Form.Select
                    value={formEdicion.tipo}
                    onChange={(e) =>
                      setFormEdicion({ ...formEdicion, tipo: e.target.value })
                    }
                  >
                    <option value="virtual">Virtual</option>
                    <option value="presencial">Presencial</option>
                    <option value="hibrida">Híbrida</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={formEdicion.estado}
                    onChange={(e) =>
                      setFormEdicion({ ...formEdicion, estado: e.target.value })
                    }
                  >
                    <option value="programada">Programada</option>
                    <option value="en_curso">En Curso</option>
                    <option value="finalizada">Finalizada</option>
                    <option value="cancelada">Cancelada</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {(formEdicion.tipo === "virtual" ||
                formEdicion.tipo === "hibrida") && (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaVideo className="me-1" /> Enlace de Reunión
                    </Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://meet.google.com/... o https://zoom.us/..."
                      value={formEdicion.enlaceReunion}
                      onChange={(e) =>
                        setFormEdicion({
                          ...formEdicion,
                          enlaceReunion: e.target.value,
                        })
                      }
                    />
                    <Form.Text className="text-muted">
                      Enlace de Google Meet, Zoom, Teams, etc.
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Contenido de la Clase</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Temas a tratar, actividades, etc..."
                    value={formEdicion.contenido}
                    onChange={(e) =>
                      setFormEdicion({
                        ...formEdicion,
                        contenido: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={guardarEdicion}
            disabled={guardandoEdicion}
          >
            {guardandoEdicion ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ============================================ */}
      {/* MODAL AGREGAR MATERIAL */}
      {/* ============================================ */}

      <Modal
        show={showMaterialModal}
        onHide={() => setShowMaterialModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Agregar Material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Presentación clase 1"
                value={nuevoMaterial.nombre}
                onChange={(e) =>
                  setNuevoMaterial({ ...nuevoMaterial, nombre: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                value={nuevoMaterial.tipo}
                onChange={(e) =>
                  setNuevoMaterial({ ...nuevoMaterial, tipo: e.target.value })
                }
              >
                <option value="documento">Documento</option>
                <option value="video">Video</option>
                <option value="enlace">Enlace</option>
                <option value="presentacion">Presentación</option>
                <option value="otro">Otro</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>URL *</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://..."
                value={nuevoMaterial.url}
                onChange={(e) =>
                  setNuevoMaterial({ ...nuevoMaterial, url: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Breve descripción del material..."
                value={nuevoMaterial.descripcion}
                onChange={(e) =>
                  setNuevoMaterial({
                    ...nuevoMaterial,
                    descripcion: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowMaterialModal(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={agregarMaterial}
            disabled={guardandoMaterial}
          >
            {guardandoMaterial ? "Guardando..." : "Agregar Material"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ============================================ */}
      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {/* ============================================ */}

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que deseas eliminar la clase{" "}
            <strong>"{clase.titulo}"</strong>?
          </p>
          <Alert variant="warning">
            <FaExclamationTriangle className="me-2" />
            Esta acción no se puede deshacer. Se eliminarán todos los materiales
            y registros de asistencia asociados.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={eliminarClase}
            disabled={eliminando}
          >
            {eliminando ? "Eliminando..." : "Eliminar Clase"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ============================================ */}
      {/* CSS */}
      {/* ============================================ */}

      <style>{`
        .pulso {
          animation: pulso 1.5s infinite;
        }

        @keyframes pulso {
          0% {
            box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(25, 135, 84, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(25, 135, 84, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default DetalleClase;