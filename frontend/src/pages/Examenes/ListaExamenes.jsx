import { useEffect, useState, useContext } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Modal,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { FaPlus, FaEye, FaEdit, FaTrash, FaChartBar, FaClock } from "react-icons/fa";

const ListaExamenes = () => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examenAEliminar, setExamenAEliminar] = useState(null);

  useEffect(() => {
    cargarExamenes();
  }, []);

  const cargarExamenes = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/examenes");
      setExamenes(data);
    } catch (error) {
      console.error("Error al cargar exámenes:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminacion = (examen) => {
    setExamenAEliminar(examen);
    setShowDeleteModal(true);
  };

  const eliminarExamen = async () => {
    try {
      await API.delete(`/examenes/${examenAEliminar._id}`);
      setExamenes(examenes.filter((e) => e._id !== examenAEliminar._id));
      setShowDeleteModal(false);
      setExamenAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar examen:", error);
      alert(error.response?.data?.msg || "Error al eliminar examen");
    }
  };

  const getBadgeEstado = (estado) => {
    const badges = {
      borrador: "secondary",
      publicado: "success",
      cerrado: "danger",
    };
    return badges[estado] || "secondary";
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const estaDisponible = (examen) => {
    const ahora = new Date();
    const apertura = new Date(examen.fechaApertura);
    const cierre = new Date(examen.fechaCierre);
    return ahora >= apertura && ahora <= cierre && examen.estado === "publicado";
  };

  const getEstadoParaAlumno = (examen) => {
    if (!examen.misIntentos || examen.misIntentos.length === 0) {
      return estaDisponible(examen) ? { texto: "Disponible", bg: "success" } : { texto: "No disponible", bg: "secondary" };
    }

    const ultimoIntento = examen.misIntentos[examen.misIntentos.length - 1];
    
    if (ultimoIntento.estado === "en_progreso") {
      return { texto: "En progreso", bg: "warning" };
    } else if (ultimoIntento.estado === "completado") {
      return { texto: "Pendiente calificación", bg: "info" };
    } else if (ultimoIntento.estado === "calificado") {
      const aprobado = ultimoIntento.porcentaje >= examen.configuracion.notaAprobacion;
      return { 
        texto: `${aprobado ? "Aprobado" : "Reprobado"} (${ultimoIntento.porcentaje}%)`, 
        bg: aprobado ? "success" : "danger" 
      };
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">
            {usuario.rol === "docente" ? "Gestión de Exámenes" : "Mis Exámenes"}
          </h2>
          <p className="text-muted">
            {usuario.rol === "alumno" 
              ? "Realiza tus exámenes y consulta tus resultados"
              : "Crea y gestiona exámenes para tus cursos"}
          </p>
        </div>
        {(usuario.rol === "docente" || usuario.rol === "admin") && (
          <Button
            variant="success"
            onClick={() => navigate("/dashboard/examenes/crear")}
          >
            <FaPlus className="me-2" />
            Crear Examen
          </Button>
        )}
      </div>

      {examenes.length === 0 ? (
        <Card className="shadow-sm text-center p-5">
          <h5 className="text-muted">
            {usuario.rol === "alumno" 
              ? "No tienes exámenes disponibles" 
              : "Aún no has creado ningún examen"}
          </h5>
          {usuario.rol !== "alumno" && (
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => navigate("/dashboard/examenes/crear")}
            >
              Crear tu primer examen
            </Button>
          )}
        </Card>
      ) : usuario.rol === "alumno" ? (
        // Vista para ALUMNOS
        <Row>
          {examenes.map((examen) => {
            const estadoAlumno = getEstadoParaAlumno(examen);
            const disponible = estaDisponible(examen);
            const intentosRestantes = examen.configuracion.intentosPermitidos - (examen.misIntentos?.length || 0);

            return (
              <Col key={examen._id} md={6} lg={4} className="mb-4">
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0">{examen.titulo}</h5>
                      <Badge bg={estadoAlumno.bg}>{estadoAlumno.texto}</Badge>
                    </div>
                    
                    <p className="text-muted small mb-2">
                      <strong>Curso:</strong> {examen.curso.titulo}
                    </p>
                    
                    {examen.descripcion && (
                      <p className="text-muted small">{examen.descripcion}</p>
                    )}

                    <hr />

                    <div className="small mb-2">
                      <div className="d-flex justify-content-between">
                        <span>📝 Preguntas:</span>
                        <strong>{examen.preguntas.length}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>⏱️ Duración:</span>
                        <strong>{examen.configuracion.duracionMinutos} min</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>🎯 Puntaje:</span>
                        <strong>{examen.puntajeTotal} pts</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>✅ Aprobación:</span>
                        <strong>{examen.configuracion.notaAprobacion}%</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>🔄 Intentos restantes:</span>
                        <strong>{intentosRestantes}</strong>
                      </div>
                    </div>

                    <hr />

                    <div className="small text-muted mb-3">
                      <div>📅 Apertura: {formatearFecha(examen.fechaApertura)}</div>
                      <div>🔒 Cierre: {formatearFecha(examen.fechaCierre)}</div>
                    </div>

                    {disponible && intentosRestantes > 0 ? (
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => navigate(`/dashboard/examenes/${examen._id}/realizar`)}
                      >
                        {examen.misIntentos?.some(i => i.estado === "en_progreso") 
                          ? "Continuar Examen" 
                          : "Iniciar Examen"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline-primary"
                        className="w-100"
                        onClick={() => navigate(`/dashboard/examenes/${examen._id}`)}
                      >
                        Ver Detalles
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        // Vista para DOCENTES/ADMIN
        <Card className="shadow-sm">
          <Table striped bordered hover responsive>
            <thead className="table-primary">
              <tr>
                <th>Título</th>
                <th>Curso</th>
                <th>Preguntas</th>
                <th>Fecha Apertura</th>
                <th>Fecha Cierre</th>
                <th>Estado</th>
                <th>Intentos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {examenes.map((examen) => (
                <tr key={examen._id}>
                  <td>
                    <strong>{examen.titulo}</strong>
                    {examen.descripcion && (
                      <>
                        <br />
                        <small className="text-muted">
                          {examen.descripcion.substring(0, 50)}
                          {examen.descripcion.length > 50 && "..."}
                        </small>
                      </>
                    )}
                  </td>
                  <td>{examen.curso.titulo}</td>
                  <td className="text-center">
                    <Badge bg="info">{examen.preguntas.length}</Badge>
                  </td>
                  <td>{formatearFecha(examen.fechaApertura)}</td>
                  <td>{formatearFecha(examen.fechaCierre)}</td>
                  <td>
                    <Badge bg={getBadgeEstado(examen.estado)}>
                      {examen.estado}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <Badge bg="secondary">
                      {examen.intentos?.length || 0}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="info"
                        size="sm"
                        title="Ver detalles"
                        onClick={() => navigate(`/dashboard/examenes/${examen._id}`)}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        title="Editar"
                        onClick={() => navigate(`/dashboard/examenes/${examen._id}/editar`)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        title="Estadísticas"
                        onClick={() => navigate(`/dashboard/examenes/${examen._id}/estadisticas`)}
                      >
                        <FaChartBar />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        title="Eliminar"
                        onClick={() => confirmarEliminacion(examen)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar el examen{" "}
          <strong>{examenAEliminar?.titulo}</strong>?
          <Alert variant="warning" className="mt-3 mb-0">
            Esta acción no se puede deshacer y se eliminarán todos los intentos de los alumnos.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarExamen}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListaExamenes;