// frontend/src/pages/tareas/TareasAlumno.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Alert, Tabs, Tab } from "react-bootstrap";
import { Link } from "react-router-dom";
import { listarTareas } from "../../services/tareaService";

const TareasAlumno = () => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabActiva, setTabActiva] = useState("pendientes");

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      const data = await listarTareas();

      setTareas(data.tareas || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al cargar tareas");
    } finally {
      setLoading(false);
    }
  };

  const obtenerEstadoEntrega = (tarea) => {
    if (!tarea.miEntrega) {
      return { texto: "Sin entregar", variant: "warning", icon: "⚠️" };
    }

    switch (tarea.miEntrega.estado) {
      case "entregada":
        return { texto: "Entregada", variant: "info", icon: "📤" };
      case "calificada":
        return { texto: `Calificada: ${tarea.miEntrega.calificacion}/${tarea.puntajeMaximo}`, variant: "success", icon: "✅" };
      case "devuelta":
        return { texto: "Devuelta", variant: "danger", icon: "🔄" };
      default:
        return { texto: "Pendiente", variant: "secondary", icon: "⏳" };
    }
  };

  const tareasPendientes = tareas.filter(t => 
    !t.miEntrega || t.miEntrega.estado === "pendiente" || t.miEntrega.estado === "devuelta"
  );

  const tareasEntregadas = tareas.filter(t => 
    t.miEntrega && (t.miEntrega.estado === "entregada" || t.miEntrega.estado === "calificada")
  );

  const tareasVencidas = tareas.filter(t => {
    const vencida = new Date() > new Date(t.fechaCierre);
    const sinEntregar = !t.miEntrega || t.miEntrega.estado === "pendiente";
    return vencida && sinEntregar;
  });

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando tareas...</p>
      </Container>
    );
  }

  const renderTarjeta = (tarea) => {
    const estado = obtenerEstadoEntrega(tarea);
    const vencida = new Date() > new Date(tarea.fechaCierre);
    
    return (
      <Col md={6} lg={4} key={tarea._id} className="mb-4">
        <Card className={`h-100 shadow-sm ${vencida && estado.texto === "Sin entregar" ? "border-danger" : ""}`}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h5 className="mb-0">{tarea.titulo}</h5>
              <Badge bg={estado.variant}>{estado.icon} {estado.texto}</Badge>
            </div>
            
            <p className="text-muted small mb-2">
            📚 {tarea.curso?.titulo || tarea.curso?.nombre || "Sin curso"}
            </p>
            
            <p className="text-truncate mb-2" style={{ maxHeight: "40px" }}>
              {tarea.descripcion}
            </p>
            
            <div className="mb-3">
              <small className={`${vencida ? "text-danger" : "text-muted"}`}>
                🗓️ Cierre: {new Date(tarea.fechaCierre).toLocaleDateString()} {new Date(tarea.fechaCierre).toLocaleTimeString()}
              </small>
              <br />
              <small className="text-muted">
                📊 Puntaje: {tarea.puntajeMaximo} pts
              </small>
              {tarea.miEntrega?.entregadaTarde && (
                <>
                  <br />
                  <small className="text-warning">
                    ⚠️ Entrega tardía
                  </small>
                </>
              )}
            </div>

            <Link to={`/dashboard/tareas/${tarea._id}`} className="btn btn-sm btn-primary w-100">
            {!tarea.miEntrega || 
            tarea.miEntrega.estado === "pendiente" || 
            (!tarea.miEntrega.archivosEntregados?.length && !tarea.miEntrega.comentarioAlumno)
                ? "📤 Entregar tarea" 
                : "👁️ Ver detalles"}
            </Link>
            
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>📋 Mis Tareas</h2>
          <p className="text-muted">Gestiona tus entregas y consulta tus calificaciones</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {tareasVencidas.length > 0 && (
        <Alert variant="danger">
          <strong>⚠️ Atención:</strong> Tienes {tareasVencidas.length} tarea(s) vencida(s) sin entregar.
        </Alert>
      )}

      <Tabs activeKey={tabActiva} onSelect={(k) => setTabActiva(k)} className="mb-4">
        <Tab eventKey="pendientes" title={`📝 Pendientes (${tareasPendientes.length})`}>
          <Row className="mt-3">
            {tareasPendientes.length === 0 ? (
              <Col>
                <Alert variant="success">
                  <h5>🎉 ¡Excelente!</h5>
                  <p>No tienes tareas pendientes.</p>
                </Alert>
              </Col>
            ) : (
              tareasPendientes.map(renderTarjeta)
            )}
          </Row>
        </Tab>

        <Tab eventKey="entregadas" title={`✅ Entregadas (${tareasEntregadas.length})`}>
          <Row className="mt-3">
            {tareasEntregadas.length === 0 ? (
              <Col>
                <Alert variant="info">
                  <p>Aún no has entregado ninguna tarea.</p>
                </Alert>
              </Col>
            ) : (
              tareasEntregadas.map(renderTarjeta)
            )}
          </Row>
        </Tab>

        <Tab eventKey="todas" title={`📚 Todas (${tareas.length})`}>
          <Row className="mt-3">
            {tareas.length === 0 ? (
              <Col>
                <Alert variant="info">
                  <p>No hay tareas disponibles en tus cursos.</p>
                </Alert>
              </Col>
            ) : (
              tareas.map(renderTarjeta)
            )}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default TareasAlumno;