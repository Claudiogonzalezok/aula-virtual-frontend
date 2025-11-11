import { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, ListGroup, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { 
  FaChalkboardTeacher, 
  FaPlusCircle, 
  FaClipboardList, 
  FaUsers,
  FaBookOpen,
  FaClock 
} from "react-icons/fa";
import API from "../../services/api";

const DocenteDashboard = ({ usuario }) => {
  const [estadisticas, setEstadisticas] = useState({
    totalCursos: 0,
    totalAlumnos: 0,
    cursosActivos: 0,
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

      const totalAlumnos = data.reduce((sum, curso) => sum + (curso.alumnos?.length || 0), 0);
      const cursosActivos = data.filter((c) => c.estado === "activo").length;

      setEstadisticas({
        totalCursos: data.length,
        totalAlumnos,
        cursosActivos,
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

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-success fw-bold">Panel del Docente</h2>
        <p className="text-muted">Bienvenido, {usuario.nombre}</p>
      </div>

      {/* Estadísticas */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : (
        <>
          <Row className="mb-4 g-3">
            <Col xs={6} md={4}>
              <Card className="shadow-sm border-0 bg-success text-white">
                <Card.Body className="text-center">
                  <FaBookOpen size={30} className="mb-2" />
                  <h3 className="mb-0">{estadisticas.totalCursos}</h3>
                  <small>Mis Cursos</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={4}>
              <Card className="shadow-sm border-0 bg-info text-white">
                <Card.Body className="text-center">
                  <FaUsers size={30} className="mb-2" />
                  <h3 className="mb-0">{estadisticas.totalAlumnos}</h3>
                  <small>Total Alumnos</small>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={4}>
              <Card className="shadow-sm border-0 bg-primary text-white">
                <Card.Body className="text-center">
                  <FaClock size={30} className="mb-2" />
                  <h3 className="mb-0">{estadisticas.cursosActivos}</h3>
                  <small>Cursos Activos</small>
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
                  <FaChalkboardTeacher size={40} className="text-success mb-3" />
                  <Card.Title>Mis Cursos</Card.Title>
                  <Card.Text className="text-muted">
                    Gestiona tus cursos, alumnos y estadísticas.
                  </Card.Text>
                  <Link to="/dashboard/cursos" className="btn btn-success w-100">
                    Ver Cursos
                  </Link>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card className="shadow border-0 h-100 hover-card">
                <Card.Body className="text-center">
                  <FaPlusCircle size={40} className="text-primary mb-3" />
                  <Card.Title>Mis Clases</Card.Title>
                  <Card.Text className="text-muted">
                    Ve todas las clases programadas con calendario y tabla.
                  </Card.Text>
                  <Link to="/dashboard/clases" className="btn btn-primary w-100">
                    Ver Todas las Clases
                  </Link>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card className="shadow border-0 h-100 hover-card">
                <Card.Body className="text-center">
                  <FaClipboardList size={40} className="text-info mb-3" />
                  <Card.Title>Exámenes</Card.Title>
                  <Card.Text className="text-muted">
                    Administra y califica exámenes de tus alumnos.
                  </Card.Text>
                  <Link to="/dashboard/examenes" className="btn btn-info w-100 text-white">
                    Gestionar
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Cursos recientes */}
          {cursos.length > 0 && (
            <div>
              <h5 className="mb-3 fw-bold">Mis Cursos Recientes</h5>
              <Card className="shadow-sm border-0">
                <ListGroup variant="flush">
                  {cursos.map((curso) => (
                    <ListGroup.Item key={curso._id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{curso.titulo}</h6>
                        <small className="text-muted">
                          {curso.codigo} • {curso.alumnos?.length || 0} alumnos •{" "}
                          {formatearFecha(curso.fechaInicio)}
                        </small>
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        <Badge bg={curso.estado === "activo" ? "success" : "secondary"}>
                          {curso.estado}
                        </Badge>
                        <Link to={`/dashboard/cursos/${curso._id}`} className="btn btn-sm btn-outline-success">
                          Ver
                        </Link>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Card.Footer className="text-center bg-white">
                  <Link to="/dashboard/cursos" className="text-decoration-none">
                    Ver todos los cursos →
                  </Link>
                </Card.Footer>
              </Card>
            </div>
          )}
        </>
      )}

      {/* CSS para hover effect */}
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

export default DocenteDashboard;