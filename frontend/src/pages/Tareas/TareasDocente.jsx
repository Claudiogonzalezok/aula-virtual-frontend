// frontend/src/pages/tareas/TareasDocente.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { listarTareas, eliminarTarea } from "../../services/tareaService";
import TarjetaTarea from "../../components/Tareas/TarjetaTarea";

const TareasDocente = () => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: "todas",
    curso: "",
    busqueda: ""
  });

  useEffect(() => {
    cargarTareas();
  }, [filtros]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filtros.estado !== "todas") {
        params.estado = filtros.estado;
      }
      
      if (filtros.curso) {
        params.curso = filtros.curso;
      }

      const data = await listarTareas(params);
      
      // Filtrar por búsqueda local
      let tareasFiltradas = data.tareas || [];
      if (filtros.busqueda) {
        tareasFiltradas = tareasFiltradas.filter(t => 
          t.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
          t.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase())
        );
      }

      setTareas(tareasFiltradas);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al cargar tareas");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta tarea?")) {
      try {
        await eliminarTarea(id);
        setTareas(tareas.filter(t => t._id !== id));
      } catch (err) {
        alert(err.response?.data?.msg || "Error al eliminar tarea");
      }
    }
  };

  const obtenerEstadoTarea = (tarea) => {
    const ahora = new Date();
    const apertura = new Date(tarea.fechaApertura);
    const cierre = new Date(tarea.fechaCierre);

    if (ahora < apertura) return { texto: "Próxima", variant: "info" };
    if (ahora > cierre) return { texto: "Cerrada", variant: "secondary" };
    return { texto: "Abierta", variant: "success" };
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando tareas...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>📋 Gestión de Tareas</h2>
              <p className="text-muted">Administra las tareas de tus cursos</p>
            </div>
            <Link to="/dashboard/tareas/crear">
              <Button variant="primary">
                ➕ Nueva Tarea
              </Button>
            </Link>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Buscar</Form.Label>
                <InputGroup>
                  <InputGroup.Text>🔍</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por título..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                >
                  <option value="todas">Todas</option>
                  <option value="abierta">Abiertas</option>
                  <option value="cerrada">Cerradas</option>
                  <option value="proxima">Próximas</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => setFiltros({ estado: "todas", curso: "", busqueda: "" })}
              >
                Limpiar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de tareas */}
      {tareas.length === 0 ? (
        <Alert variant="info">
          <h5>No hay tareas</h5>
          <p>Todavía no has creado ninguna tarea. Crea tu primera tarea para comenzar.</p>
          <Link to="/dashboard/tareas/crear">
            <Button variant="info">Crear primera tarea</Button>
          </Link>
        </Alert>
      ) : (
        <Row>
          {tareas.map((tarea) => {
            const estado = obtenerEstadoTarea(tarea);
            return (
              <Col md={6} lg={4} key={tarea._id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0">{tarea.titulo}</h5>
                      <Badge bg={estado.variant}>{estado.texto}</Badge>
                    </div>
                    
                    <p className="text-muted small mb-2">
                      📚 {tarea.curso?.nombre || "Sin curso"}
                    </p>
                    
                    <p className="text-truncate mb-2" style={{ maxHeight: "40px" }}>
                      {tarea.descripcion}
                    </p>
                    
                    <div className="mb-3">
                      <small className="text-muted">
                        🗓️ Cierre: {new Date(tarea.fechaCierre).toLocaleDateString()}
                      </small>
                      <br />
                      <small className="text-muted">
                        📊 Puntaje: {tarea.puntajeMaximo} pts
                      </small>
                    </div>

                    <div className="d-flex gap-2">
                      <Link to={`/dashboard/tareas/${tarea._id}`} className="btn btn-sm btn-outline-primary flex-fill">
                        👁️ Ver
                      </Link>
                      <Link to={`/dashboard/tareas/editar/${tarea._id}`} className="btn btn-sm btn-outline-secondary">
                        ✏️
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline-danger"
                        onClick={() => handleEliminar(tarea._id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default TareasDocente;