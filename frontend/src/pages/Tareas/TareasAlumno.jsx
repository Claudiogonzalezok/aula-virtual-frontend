// frontend/src/pages/tareas/TareasAlumno.jsx
import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  Tabs,
  Tab,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { listarTareas } from "../../services/tareaService";
import API from "../../services/api";
import { toast } from "react-toastify";

const TareasAlumno = () => {
  const [tareas, setTareas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState("pendientes");
  const [cursoFiltro, setCursoFiltro] = useState("todos");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar tareas y cursos en paralelo
      const [tareasData, cursosData] = await Promise.all([
        listarTareas(),
        API.get("/cursos"), // Ya filtra por rol automáticamente
      ]);

      setTareas(tareasData.tareas || []);
      setCursos(cursosData.data || []);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  // Función helper para obtener el ID del curso
  const getCursoId = (tarea) => {
    if (!tarea.curso) return null;
    return typeof tarea.curso === "object" ? tarea.curso._id : tarea.curso;
  };

  // Función helper para obtener el título del curso
  const getCursoTitulo = (tarea) => {
    if (!tarea.curso) return "Sin curso";
    if (typeof tarea.curso === "object") {
      return tarea.curso.titulo || tarea.curso.nombre || "Sin nombre";
    }
    return "Curso no disponible";
  };

  // Función helper para verificar si una tarea está sin entregar
  const estaSinEntregar = (tarea) => {
    if (!tarea.miEntrega) return true;
    if (tarea.miEntrega.estado === "pendiente") return true;
    if (tarea.miEntrega.estado === "devuelta") return true;
    return false;
  };

  // Función helper para verificar si la tarea está vencida
  const estaVencida = (tarea) => {
    return new Date() > new Date(tarea.fechaCierre);
  };

  // Filtrar tareas por curso seleccionado
  const tareasFiltradas = useMemo(() => {
    if (cursoFiltro === "todos") {
      return tareas;
    }
    return tareas.filter((t) => getCursoId(t) === cursoFiltro);
  }, [tareas, cursoFiltro]);

  // Contar tareas por curso
  const contarTareasPorCurso = (cursoId) => {
    return tareas.filter((t) => getCursoId(t) === cursoId).length;
  };

  const obtenerEstadoEntrega = (tarea) => {
    if (!tarea.miEntrega) {
      return { texto: "Sin entregar", variant: "warning", icon: "⚠️" };
    }

    switch (tarea.miEntrega.estado) {
      case "entregada":
        return { texto: "Entregada", variant: "info", icon: "📤" };
      case "calificada":
        return {
          texto: `Calificada: ${tarea.miEntrega.calificacion}/${tarea.puntajeMaximo}`,
          variant: "success",
          icon: "✅",
        };
      case "devuelta":
        return { texto: "Devuelta", variant: "danger", icon: "🔄" };
      case "pendiente":
        return { texto: "Sin entregar", variant: "warning", icon: "⚠️" };
      default:
        return { texto: "Pendiente", variant: "secondary", icon: "⏳" };
    }
  };

  // Tareas pendientes: sin entregar Y que aún NO están vencidas
  const tareasPendientes = useMemo(() => {
    return tareasFiltradas.filter((t) => {
      return estaSinEntregar(t) && !estaVencida(t);
    });
  }, [tareasFiltradas]);

  // Tareas entregadas o calificadas
  const tareasEntregadas = useMemo(() => {
    return tareasFiltradas.filter((t) => {
      return (
        t.miEntrega &&
        (t.miEntrega.estado === "entregada" || t.miEntrega.estado === "calificada")
      );
    });
  }, [tareasFiltradas]);

  // Tareas vencidas sin entregar
  const tareasNoEntregadas = useMemo(() => {
    return tareasFiltradas.filter((t) => {
      return estaVencida(t) && estaSinEntregar(t);
    });
  }, [tareasFiltradas]);

  // Obtener nombre del curso seleccionado
  const getNombreCursoSeleccionado = () => {
    if (cursoFiltro === "todos") return null;
    const curso = cursos.find((c) => c._id === cursoFiltro);
    return curso?.titulo || curso?.nombre || "Curso";
  };

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
    const vencida = estaVencida(tarea);
    const sinEntregar = estaSinEntregar(tarea);

    return (
      <Col md={6} lg={4} key={tarea._id} className="mb-4">
        <Card
          className={`h-100 shadow-sm ${
            vencida && sinEntregar ? "border-danger" : ""
          }`}
        >
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h5 className="mb-0">{tarea.titulo}</h5>
              <Badge bg={estado.variant}>
                {estado.icon} {estado.texto}
              </Badge>
            </div>

            <p className="text-muted small mb-2">📚 {getCursoTitulo(tarea)}</p>

            <p className="text-truncate mb-2" style={{ maxHeight: "40px" }}>
              {tarea.descripcion}
            </p>

            <div className="mb-3">
              <small className={`${vencida ? "text-danger fw-bold" : "text-muted"}`}>
                🗓️ Cierre: {new Date(tarea.fechaCierre).toLocaleDateString()}{" "}
                {new Date(tarea.fechaCierre).toLocaleTimeString()}
              </small>
              <br />
              <small className="text-muted">📊 Puntaje: {tarea.puntajeMaximo} pts</small>
              {tarea.miEntrega?.entregadaTarde && (
                <>
                  <br />
                  <small className="text-warning">⚠️ Entrega tardía</small>
                </>
              )}
            </div>

            <Link
              to={`/dashboard/tareas/${tarea._id}`}
              className="btn btn-sm btn-primary w-100"
            >
              {sinEntregar ? "📤 Entregar tarea" : "👁️ Ver detalles"}
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
          <p className="text-muted">
            Gestiona tus entregas y consulta tus calificaciones
          </p>
        </Col>
      </Row>

      {/* Filtro por curso */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>🎓 Filtrar por curso:</Form.Label>
            <Form.Select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
            >
              <option value="todos">
                Todos los cursos ({tareas.length} tareas)
              </option>
              {cursos.map((curso) => {
                const cantidadTareas = contarTareasPorCurso(curso._id);
                return (
                  <option key={curso._id} value={curso._id}>
                    {curso.titulo || curso.nombre} ({cantidadTareas} tareas)
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={8} className="d-flex align-items-end">
          {cursoFiltro !== "todos" && (
            <Badge
              bg="secondary"
              className="mb-2 p-2"
              style={{ cursor: "pointer" }}
              onClick={() => setCursoFiltro("todos")}
            >
              ✕ Limpiar filtro
            </Badge>
          )}
        </Col>
      </Row>

      {/* Mensaje cuando el curso no tiene tareas */}
      {cursoFiltro !== "todos" && tareasFiltradas.length === 0 && (
        <Alert variant="info">
          <strong>📚 {getNombreCursoSeleccionado()}</strong>
          <p className="mb-0 mt-2">
            Este curso aún no tiene tareas asignadas. ¡Aprovecha para repasar el
            material! 📖
          </p>
        </Alert>
      )}

      {/* Alerta de tareas no entregadas */}
      {tareasNoEntregadas.length > 0 && (
        <Alert variant="danger">
          <strong>⚠️ Atención:</strong> Tienes {tareasNoEntregadas.length} tarea(s)
          vencida(s) sin entregar.
          <Alert.Link
            className="ms-2"
            onClick={() => setTabActiva("noEntregadas")}
            style={{ cursor: "pointer" }}
          >
            Ver tareas →
          </Alert.Link>
        </Alert>
      )}

      <Tabs
        activeKey={tabActiva}
        onSelect={(k) => setTabActiva(k)}
        className="mb-4"
      >
        {/* Pendientes: tareas que aún se pueden entregar */}
        <Tab
          eventKey="pendientes"
          title={
            <span>
              📝 Pendientes{" "}
              <Badge bg="primary" pill>
                {tareasPendientes.length}
              </Badge>
            </span>
          }
        >
          <Row className="mt-3">
            {tareasPendientes.length === 0 ? (
              <Col>
                <Alert variant="success">
                  <h5>🎉 ¡Excelente!</h5>
                  <p className="mb-0">
                    {cursoFiltro !== "todos"
                      ? `No tienes tareas pendientes en ${getNombreCursoSeleccionado()}.`
                      : "No tienes tareas pendientes por entregar."}
                  </p>
                </Alert>
              </Col>
            ) : (
              tareasPendientes.map(renderTarjeta)
            )}
          </Row>
        </Tab>

        {/* Entregadas */}
        <Tab
          eventKey="entregadas"
          title={
            <span>
              ✅ Entregadas{" "}
              <Badge bg="success" pill>
                {tareasEntregadas.length}
              </Badge>
            </span>
          }
        >
          <Row className="mt-3">
            {tareasEntregadas.length === 0 ? (
              <Col>
                <Alert variant="info">
                  <p className="mb-0">
                    {cursoFiltro !== "todos"
                      ? `Aún no has entregado tareas en ${getNombreCursoSeleccionado()}.`
                      : "Aún no has entregado ninguna tarea."}
                  </p>
                </Alert>
              </Col>
            ) : (
              tareasEntregadas.map(renderTarjeta)
            )}
          </Row>
        </Tab>

        {/* No entregadas (vencidas) */}
        <Tab
          eventKey="noEntregadas"
          title={
            <span className={tareasNoEntregadas.length > 0 ? "text-danger" : ""}>
              ❌ No entregadas{" "}
              <Badge
                bg={tareasNoEntregadas.length > 0 ? "danger" : "secondary"}
                pill
              >
                {tareasNoEntregadas.length}
              </Badge>
            </span>
          }
        >
          <Row className="mt-3">
            {tareasNoEntregadas.length === 0 ? (
              <Col>
                <Alert variant="success">
                  <h5>👏 ¡Muy bien!</h5>
                  <p className="mb-0">
                    {cursoFiltro !== "todos"
                      ? `No tienes tareas vencidas sin entregar en ${getNombreCursoSeleccionado()}.`
                      : "No tienes tareas vencidas sin entregar. ¡Sigue así!"}
                  </p>
                </Alert>
              </Col>
            ) : (
              <>
                <Col xs={12} className="mb-3">
                  <Alert variant="warning">
                    <strong>📌 Nota:</strong> Estas tareas ya vencieron. Consulta
                    con tu docente si aún puedes entregarlas.
                  </Alert>
                </Col>
                {tareasNoEntregadas.map(renderTarjeta)}
              </>
            )}
          </Row>
        </Tab>

        {/* Todas */}
        <Tab
          eventKey="todas"
          title={
            <span>
              📚 Todas{" "}
              <Badge bg="secondary" pill>
                {tareasFiltradas.length}
              </Badge>
            </span>
          }
        >
          <Row className="mt-3">
            {tareasFiltradas.length === 0 ? (
              <Col>
                <Alert variant="info">
                  <p className="mb-0">
                    {cursoFiltro !== "todos"
                      ? `No hay tareas en ${getNombreCursoSeleccionado()}.`
                      : "No hay tareas disponibles en tus cursos."}
                  </p>
                </Alert>
              </Col>
            ) : (
              tareasFiltradas.map(renderTarjeta)
            )}
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default TareasAlumno;