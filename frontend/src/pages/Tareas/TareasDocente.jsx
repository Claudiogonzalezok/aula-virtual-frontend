// frontend/src/pages/Tareas/TareasDocente.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { listarTareas, eliminarTarea } from "../../services/tareaService";
import { listarCursos } from "../../services/cursoService";

const TareasDocente = () => {
  const [tareas, setTareas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // 🆕 Estados para filtros
  const [cursoFiltro, setCursoFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

const cargarDatos = async () => {
  try {
    setLoading(true);
    const [tareasData, cursosData] = await Promise.all([
      listarTareas(),
      listarCursos()
    ]);
    
    // 🔥 AGREGAR ESTOS LOGS:
    console.log("📊 Respuesta completa de tareas:", tareasData);
    console.log("📊 Tipo de tareasData:", typeof tareasData);
    console.log("📊 Es array tareasData?:", Array.isArray(tareasData));
    console.log("📊 tareasData.tareas:", tareasData.tareas);
    
    // 🔥 CAMBIAR ESTA LÍNEA:
    // ANTES:
    // setTareas(tareasData.tareas || tareasData || []);
    
    // DESPUÉS:
    const tareasArray = Array.isArray(tareasData) 
      ? tareasData 
      : (Array.isArray(tareasData.tareas) ? tareasData.tareas : []);
    
    console.log("📊 Tareas finales:", tareasArray);
    setTareas(tareasArray);
    
    const cursosArray = Array.isArray(cursosData)
      ? cursosData
      : (Array.isArray(cursosData.cursos) ? cursosData.cursos : []);
    
    setCursos(cursosArray);
  } catch (err) {
    console.error("❌ Error completo:", err);
    setError(err.response?.data?.msg || "Error al cargar tareas");
  } finally {
    setLoading(false);
  }
};

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta tarea?")) {
      try {
        await eliminarTarea(id);
        setMensaje({ tipo: "success", texto: "Tarea eliminada correctamente" });
        cargarDatos();
      } catch (err) {
        setMensaje({ tipo: "danger", texto: err.response?.data?.msg || "Error al eliminar" });
      }
    }
  };

  const obtenerEstado = (tarea) => {
    const ahora = new Date();
    const apertura = new Date(tarea.fechaApertura);
    const cierre = new Date(tarea.fechaCierre);

    if (ahora < apertura) return { texto: "Próxima", variant: "info", valor: "proxima" };
    if (ahora > cierre) return { texto: "Cerrada", variant: "secondary", valor: "cerrada" };
    return { texto: "Abierta", variant: "success", valor: "abierta" };
  };

  // 🆕 Filtrar tareas
  const tareasFiltradas = tareas.filter(tarea => {
    // Filtro por curso
    if (cursoFiltro && tarea.curso?._id !== cursoFiltro) {
      return false;
    }

    // Filtro por estado
    if (estadoFiltro !== "todas") {
      const estado = obtenerEstado(tarea).valor;
      if (estado !== estadoFiltro) {
        return false;
      }
    }

    // Filtro por búsqueda
    if (busqueda) {
      const textoLower = busqueda.toLowerCase();
      return tarea.titulo.toLowerCase().includes(textoLower) ||
             tarea.descripcion.toLowerCase().includes(textoLower);
    }

    return true;
  });

  // 🆕 Estadísticas por curso
  const obtenerEstadisticasCurso = (cursoId) => {
    const tareasCurso = tareas.filter(t => t.curso?._id === cursoId);
    return {
      total: tareasCurso.length,
      abiertas: tareasCurso.filter(t => obtenerEstado(t).valor === "abierta").length,
      cerradas: tareasCurso.filter(t => obtenerEstado(t).valor === "cerrada").length,
      proximas: tareasCurso.filter(t => obtenerEstado(t).valor === "proxima").length
    };
  };

  // 🆕 Limpiar filtros
  const limpiarFiltros = () => {
    setCursoFiltro("");
    setEstadoFiltro("todas");
    setBusqueda("");
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
    <Container className="mt-4 mb-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>📋 Gestión de Tareas</h2>
              <p className="text-muted mb-0">
                {tareasFiltradas.length} {tareasFiltradas.length === 1 ? "tarea" : "tareas"}
                {cursoFiltro && ` en ${cursos.find(c => c._id === cursoFiltro)?.titulo || cursos.find(c => c._id === cursoFiltro)?.nombre}`}
              </p>
            </div>
            <Link to="/dashboard/tareas/crear">
              <Button variant="success">
                ➕ Nueva Tarea
              </Button>
            </Link>
          </div>
        </Col>
      </Row>

      {/* Mensajes */}
      {mensaje && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 🆕 Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>📚 Filtrar por Curso</Form.Label>
                <Form.Select
                  value={cursoFiltro}
                  onChange={(e) => setCursoFiltro(e.target.value)}
                >
                  <option value="">Todos los cursos</option>
                  {cursos.map(curso => {
                    const stats = obtenerEstadisticasCurso(curso._id);
                    return (
                      <option key={curso._id} value={curso._id}>
                        {curso.titulo || curso.nombre} ({stats.total})
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>🔍 Estado</Form.Label>
                <Form.Select
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  <option value="abierta">Abiertas</option>
                  <option value="proxima">Próximas</option>
                  <option value="cerrada">Cerradas</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3 mb-md-0">
                <Form.Label>🔎 Buscar</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por título o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={1} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={limpiarFiltros}
                className="w-100"
                title="Limpiar filtros"
              >
                🔄
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 🆕 Estadísticas rápidas si hay filtro por curso */}
      {cursoFiltro && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3>{obtenerEstadisticasCurso(cursoFiltro).total}</h3>
                <p className="text-muted mb-0">Total</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-success">
              <Card.Body>
                <h3 className="text-success">{obtenerEstadisticasCurso(cursoFiltro).abiertas}</h3>
                <p className="text-muted mb-0">Abiertas</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-info">
              <Card.Body>
                <h3 className="text-info">{obtenerEstadisticasCurso(cursoFiltro).proximas}</h3>
                <p className="text-muted mb-0">Próximas</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-secondary">
              <Card.Body>
                <h3 className="text-secondary">{obtenerEstadisticasCurso(cursoFiltro).cerradas}</h3>
                <p className="text-muted mb-0">Cerradas</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Lista de tareas */}
      {tareasFiltradas.length === 0 ? (
        <Alert variant="info">
          <h5>📭 No hay tareas</h5>
          <p className="mb-0">
            {busqueda || cursoFiltro || estadoFiltro !== "todas" 
              ? "No se encontraron tareas con los filtros aplicados."
              : "Aún no has creado ninguna tarea. ¡Crea tu primera tarea!"}
          </p>
          {(busqueda || cursoFiltro || estadoFiltro !== "todas") && (
            <Button variant="outline-info" size="sm" onClick={limpiarFiltros} className="mt-2">
              Limpiar filtros
            </Button>
          )}
        </Alert>
      ) : (
        <Row>
          {tareasFiltradas.map((tarea) => {
            const estado = obtenerEstado(tarea);
            return (
              <Col key={tarea._id} md={6} lg={4} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0">{tarea.titulo}</h5>
                      <Badge bg={estado.variant}>{estado.texto}</Badge>
                    </div>

                    {/* 🆕 Mostrar curso */}
                    <div className="mb-2">
                      <small className="text-muted">
                        📚 {tarea.curso?.titulo || tarea.curso?.nombre || "Sin curso"}
                      </small>
                    </div>

                    <p className="text-muted small mb-3">
                      {tarea.descripcion.length > 100
                        ? tarea.descripcion.substring(0, 100) + "..."
                        : tarea.descripcion}
                    </p>

                    <div className="mb-3">
                      <small className="d-block">
                        <strong>📅 Apertura:</strong>{" "}
                        {new Date(tarea.fechaApertura).toLocaleDateString()}
                      </small>
                      <small className="d-block">
                        <strong>📅 Cierre:</strong>{" "}
                        {new Date(tarea.fechaCierre).toLocaleDateString()}
                      </small>
                      <small className="d-block">
                        <strong>📊 Puntaje:</strong> {tarea.puntajeMaximo} pts
                      </small>
                    </div>

                    {tarea.estadisticas && (
                      <div className="mb-3">
                        <small className="text-muted">
                          📤 {tarea.estadisticas.entregas?.reduce((sum, e) => sum + e.cantidad, 0) || 0} /{" "}
                          {tarea.estadisticas.totalInscritos || 0} entregas
                        </small>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <Link to={`/dashboard/tareas/${tarea._id}`} className="flex-fill">
                        <Button variant="primary" size="sm" className="w-100">
                          👁️ Ver
                        </Button>
                      </Link>
                      <Link to={`/dashboard/tareas/editar/${tarea._id}`}>
                        <Button variant="outline-primary" size="sm">
                          ✏️
                        </Button>
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
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