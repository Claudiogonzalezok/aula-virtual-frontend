import { useState, useEffect } from "react";
import { Card, Row, Col, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUsers, FaBookOpen, FaChartLine, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import API from "../../services/api";

const AdminDashboard = ({ usuario }) => {
  const [estadisticas, setEstadisticas] = useState({
    totalUsuarios: 0,
    totalCursos: 0,
    totalDocentes: 0,
    totalAlumnos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const [usuariosRes, cursosRes] = await Promise.all([
        API.get("/usuarios"),
        API.get("/cursos"),
      ]);

      const usuarios = usuariosRes.data.usuarios || usuariosRes.data;
      const cursos = cursosRes.data;

      setEstadisticas({
        totalUsuarios: usuarios.length,
        totalCursos: cursos.length,
        totalDocentes: usuarios.filter((u) => u.rol === "docente").length,
        totalAlumnos: usuarios.filter((u) => u.rol === "alumno").length,
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-primary fw-bold">Panel de Administración</h2>
        <p className="text-muted">Bienvenido, {usuario.nombre}</p>
      </div>

      {/* Estadísticas generales */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <Card className="shadow-sm border-0 bg-primary text-white">
              <Card.Body className="text-center">
                <FaUsers size={30} className="mb-2" />
                <h3 className="mb-0">{estadisticas.totalUsuarios}</h3>
                <small>Total Usuarios</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="shadow-sm border-0 bg-success text-white">
              <Card.Body className="text-center">
                <FaBookOpen size={30} className="mb-2" />
                <h3 className="mb-0">{estadisticas.totalCursos}</h3>
                <small>Total Cursos</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="shadow-sm border-0 bg-info text-white">
              <Card.Body className="text-center">
                <FaChalkboardTeacher size={30} className="mb-2" />
                <h3 className="mb-0">{estadisticas.totalDocentes}</h3>
                <small>Docentes</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="shadow-sm border-0 bg-warning text-white">
              <Card.Body className="text-center">
                <FaUserGraduate size={30} className="mb-2" />
                <h3 className="mb-0">{estadisticas.totalAlumnos}</h3>
                <small>Alumnos</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Accesos rápidos */}
      <h5 className="mb-3 fw-bold">Accesos Rápidos</h5>
      <Row xs={1} md={2} lg={3} className="g-4">
        <Col>
          <Card className="shadow border-0 h-100 hover-card">
            <Card.Body className="text-center">
              <FaUsers size={40} className="text-primary mb-3" />
              <Card.Title>Gestión de Usuarios</Card.Title>
              <Card.Text className="text-muted">
                Crear, editar o eliminar usuarios del sistema.
              </Card.Text>
              <Link to="/dashboard/usuarios" className="btn btn-primary w-100">
                Administrar Usuarios
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="shadow border-0 h-100 hover-card">
            <Card.Body className="text-center">
              <FaBookOpen size={40} className="text-success mb-3" />
              <Card.Title>Gestión de Cursos</Card.Title>
              <Card.Text className="text-muted">
                Supervisa los cursos activos y docentes asignados.
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
              <FaChartLine size={40} className="text-info mb-3" />
              <Card.Title>Reportes</Card.Title>
              <Card.Text className="text-muted">
                Visualiza métricas generales de uso del aula virtual.
              </Card.Text>
              <Link to="/dashboard/reportes" className="btn btn-info w-100 text-white">
                Ver Reportes
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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

export default AdminDashboard;