import { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, ListGroup, Badge, ProgressBar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { 
  FaBookReader, 
  FaStar, 
  FaCommentDots, 
  FaBookOpen,
  FaChalkboard,
  FaClock 
} from "react-icons/fa";
import API from "../../services/api";

const AlumnoDashboard = ({ usuario }) => {
  const [estadisticas, setEstadisticas] = useState({
    cursosInscritos: 0,
    cursosActivos: 0,
    proximasClases: 0,
  });
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const { data } = await API.get("/cursos");
      setCursos(data.slice(0, 5)); // Últimos 5 cursos

      const cursosActivos = data.filter((c) => c.estado === "activo").length;

      setEstadisticas({
        cursosInscritos: data.length,
        cursosActivos,
        proximasClases: 0, // Esto lo puedes calcular cuando tengas las clases
      });
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calcularProgreso = (curso) => {
    const hoy = new Date();
    const inicio = new Date(curso.fechaInicio);
    const fin = new Date(curso.fechaFin);
    
    if (hoy < inicio) return 0;
    if (hoy > fin) return 100;
    
    const total = fin - inicio;
    const transcurrido = hoy - inicio;
    return Math.round((transcurrido / total) * 100);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold" style={{ color: "#6f42c1" }}>
          Panel del Alumno
        </h2>
        <p className="text-muted">Bienvenido, {usuario.nombre}</p>
      </div>

      {/* Estadísticas */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" style={{ color: "#6f42c1" }} />
        </div>
      ) : (
        <>
          <Row className="mb-4 g-3">
            <Col xs={6} md={4}>
              <Card className="shadow-sm border-0 text-white" style={{ backgroundColor: "#6f42c1" }}>
                <Card.Body className="text-center">
                  <FaBookOpen size={30} className="mb-2" />
                  <h3 className="mb-0">{estadisticas.cursosInscritos}</h3>
                  <small>Cursos Inscritos</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={4}>
              <Card className="shadow-sm border-0 text-white" style={{ backgroundColor: "#28a745" }}>
                <Card.Body className="text-center">
                  <FaChalkboard size={30} className="mb-2" />
                  <h3 className="mb-0">{estadisticas.cursosActivos}</h3>
                  <small>Cursos Activos</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={4}>
              <Card className="shadow-sm border-0 text-white" style={{ backgroundColor: "#17a2b8" }}>
                <Card.Body className="text-center">
                  <FaClock size={30} className="mb-2" />
                  <h3 className="mb-0">{estadisticas.proximasClases}</h3>
                  <small>Próximas Clases</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Accesos rápidos */}
          <h5 className="mb-3 fw-bold">Accesos Rápidos</h5>
          <Row xs={1} md={2} lg={3} className="g-4 mb-4">
            <Col>
              <Card className="shadow border-0 h-100 hover-card">
                <Card.Body className="text-center">
                  <FaBookReader size={40} style={{ color: "#6f42c1" }} className="mb-3" />
                  <Card.Title>Mis Cursos</Card.Title>
                  <Card.Text className="text-muted">
                    Accede a tus clases y materiales de estudio.
                  </Card.Text>
                  <Link 
                    to="/dashboard/cursos" 
                    className="btn w-100 text-white" 
                    style={{ backgroundColor: "#6f42c1" }}
                  >
                    Ver Cursos
                  </Link>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card className="shadow border-0 h-100 hover-card">
                <Card.Body className="text-center">
                  <FaStar size={40} style={{ color: "#ffc107" }} className="mb-3" />
                  <Card.Title>Mis Notas</Card.Title>
                  <Card.Text className="text-muted">
                    Consulta tus calificaciones y avances.
                  </Card.Text>
                  <Link 
                    to="/dashboard/notas" 
                    className="btn btn-warning w-100 text-white"
                  >
                    Ver Notas
                  </Link>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card className="shadow border-0 h-100 hover-card">
                <Card.Body className="text-center">
                  <FaCommentDots size={40} style={{ color: "#17a2b8" }} className="mb-3" />
                  <Card.Title>Foros</Card.Title>
                  <Card.Text className="text-muted">
                    Participa en los foros de tus clases.
                  </Card.Text>
                  <Link 
                    to="/dashboard/foros" 
                    className="btn btn-info w-100 text-white"
                  >
                    Ir al Foro
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Mis cursos */}
          {cursos.length > 0 && (
            <div>
              <h5 className="mb-3 fw-bold">Mis Cursos Activos</h5>
              <Card className="shadow-sm border-0">
                <ListGroup variant="flush">
                  {cursos.map((curso) => {
                    const progreso = calcularProgreso(curso);
                    return (
                      <ListGroup.Item key={curso._id}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{curso.titulo}</h6>
                            <small className="text-muted">
                              {curso.codigo} • Docente: {curso.docente?.nombre}
                            </small>
                          </div>
                          <Badge bg={curso.estado === "activo" ? "success" : "secondary"}>
                            {curso.estado}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">Progreso del curso</small>
                            <small className="text-muted">{progreso}%</small>
                          </div>
                          <ProgressBar 
                            now={progreso} 
                            variant="purple"
                            style={{ backgroundColor: "#e9ecef" }}
                          >
                            <div 
                              style={{ 
                                width: `${progreso}%`, 
                                backgroundColor: "#6f42c1",
                                height: "100%" 
                              }} 
                            />
                          </ProgressBar>
                        </div>
                        <div className="d-flex gap-2">
                          <Link 
                            to={`/dashboard/cursos/${curso._id}`} 
                            className="btn btn-sm text-white" 
                            style={{ backgroundColor: "#6f42c1" }}
                          >
                            Ir al Curso
                          </Link>
                          <small className="text-muted align-self-center">
                            Finaliza: {formatearFecha(curso.fechaFin)}
                          </small>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
                <Card.Footer className="text-center bg-white">
                  <Link to="/dashboard/cursos" className="text-decoration-none" style={{ color: "#6f42c1" }}>
                    Ver todos mis cursos →
                  </Link>
                </Card.Footer>
              </Card>
            </div>
          )}

          {cursos.length === 0 && (
            <Card className="shadow-sm border-0 text-center p-5">
              <FaBookOpen size={50} className="text-muted mb-3" />
              <h5 className="text-muted">Aún no estás inscrito en ningún curso</h5>
              <p className="text-muted">Contacta a tu docente para inscribirte en los cursos disponibles.</p>
            </Card>
          )}
        </>
      )}

      {/* CSS para hover effect y ProgressBar custom */}
      <style>{`
        .hover-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default AlumnoDashboard;