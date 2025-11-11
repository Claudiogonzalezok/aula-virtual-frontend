import { useEffect, useState, useContext } from "react";
import {
  Table,
  Button,
  Spinner,
  Badge,
  Card,
  Row,
  Col,
  Tabs,
  Tab,
  Form,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

moment.locale("es");
const localizer = momentLocalizer(moment);

const MisClases = () => {
  const { usuario } = useContext(AuthContext);
  const [clases, setClases] = useState([]);
  const [clasesFiltradas, setClasesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [filtroCurso, setFiltroCurso] = useState("todos");
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    cargarClases();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtroEstado, filtroCurso, clases]);

  const cargarClases = async () => {
    setLoading(true);
    try {
      const { data: cursosData } = await API.get("/cursos");
      setCursos(cursosData);

      // Obtener todas las clases de todos los cursos del docente
      const promesasClases = cursosData.map((curso) =>
        API.get(`/clases/curso/${curso._id}`)
      );

      const respuestasClases = await Promise.all(promesasClases);
      const todasLasClases = respuestasClases.flatMap((res) => res.data);

      setClases(todasLasClases);
    } catch (error) {
      console.error("Error al cargar clases:", error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...clases];

    // Filtrar por estado
    if (filtroEstado !== "todas") {
      resultado = resultado.filter((clase) => clase.estado === filtroEstado);
    }

    // Filtrar por curso
    if (filtroCurso !== "todos") {
      resultado = resultado.filter(
        (clase) => clase.curso._id === filtroCurso
      );
    }

    setClasesFiltradas(resultado);
  };

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

  const getBadgeEstado = (estado) => {
    const badges = {
      programada: "primary",
      en_curso: "success",
      finalizada: "secondary",
      cancelada: "danger",
    };
    return badges[estado] || "secondary";
  };

  // Convertir clases para el calendario
  const eventosCalendario = clasesFiltradas.map((clase) => {
    const fecha = new Date(clase.fecha);
    const [horaInicio, minutoInicio] = clase.horaInicio.split(":");
    const [horaFin, minutoFin] = clase.horaFin.split(":");

    const inicio = new Date(fecha);
    inicio.setHours(parseInt(horaInicio), parseInt(minutoInicio));

    const fin = new Date(fecha);
    fin.setHours(parseInt(horaFin), parseInt(minutoFin));

    return {
      id: clase._id,
      title: `${clase.curso.titulo} - ${clase.titulo}`,
      start: inicio,
      end: fin,
      resource: clase,
    };
  });

  // Estilos para eventos del calendario
  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad";
    const estado = event.resource.estado;

    switch (estado) {
      case "programada":
        backgroundColor = "#0d6efd";
        break;
      case "en_curso":
        backgroundColor = "#198754";
        break;
      case "finalizada":
        backgroundColor = "#6c757d";
        break;
      case "cancelada":
        backgroundColor = "#dc3545";
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const mensajesCalendario = {
    allDay: "Todo el día",
    previous: "Anterior",
    next: "Siguiente",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Clase",
    noEventsInRange: "No hay clases en este rango",
    showMore: (total) => `+ Ver más (${total})`,
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
      <div className="mb-4">
        <h2 className="fw-bold">📚 Mis Clases</h2>
        <p className="text-muted">
          Visualiza y gestiona todas tus clases programadas
        </p>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label className="fw-bold small">Filtrar por Estado</Form.Label>
              <Form.Select
                size="sm"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todas">Todas</option>
                <option value="programada">Programadas</option>
                <option value="en_curso">En Curso</option>
                <option value="finalizada">Finalizadas</option>
                <option value="cancelada">Canceladas</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label className="fw-bold small">Filtrar por Curso</Form.Label>
              <Form.Select
                size="sm"
                value={filtroCurso}
                onChange={(e) => setFiltroCurso(e.target.value)}
              >
                <option value="todos">Todos los cursos</option>
                {cursos.map((curso) => (
                  <option key={curso._id} value={curso._id}>
                    {curso.codigo} - {curso.titulo}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <div className="w-100">
                <div className="text-muted small">
                  <strong>Total:</strong> {clasesFiltradas.length} clase(s)
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tabs defaultActiveKey="tabla" className="mb-3">
        {/* Vista de Tabla */}
        <Tab eventKey="tabla" title="📋 Vista de Tabla">
          {clasesFiltradas.length === 0 ? (
            <Card className="shadow-sm">
              <Card.Body className="text-center text-muted py-5">
                <h5>No hay clases que coincidan con los filtros</h5>
                <p>Prueba ajustando los filtros o crea una nueva clase</p>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <Table striped bordered hover responsive className="mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>Curso</th>
                    <th>Clase</th>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clasesFiltradas.map((clase) => (
                    <tr key={clase._id}>
                      <td>
                        <div>
                          <strong>{clase.curso.codigo}</strong>
                          <br />
                          <small className="text-muted">
                            {clase.curso.titulo}
                          </small>
                        </div>
                      </td>
                      <td>
                        <strong>{clase.titulo}</strong>
                        {clase.descripcion && (
                          <>
                            <br />
                            <small className="text-muted">
                              {clase.descripcion.substring(0, 50)}
                              {clase.descripcion.length > 50 && "..."}
                            </small>
                          </>
                        )}
                      </td>
                      <td>{formatearFechaCorta(clase.fecha)}</td>
                      <td>
                        {clase.horaInicio} - {clase.horaFin}
                      </td>
                      <td>
                        <Badge bg="info">{clase.tipo}</Badge>
                      </td>
                      <td>
                        <Badge bg={getBadgeEstado(clase.estado)}>
                          {clase.estado?.replace("_", " ")}
                        </Badge>
                      </td>
                      <td>
                        <Link to={`/dashboard/cursos/${clase.curso._id}`}>
                          <Button variant="primary" size="sm">
                            Ver Curso
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}
        </Tab>

        {/* Vista de Calendario */}
        <Tab eventKey="calendario" title="📅 Vista de Calendario">
          <Card className="shadow-sm">
            <Card.Body style={{ height: "700px" }}>
              {clasesFiltradas.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <h5>No hay clases que coincidan con los filtros</h5>
                  <p>Prueba ajustando los filtros</p>
                </div>
              ) : (
                <Calendar
                  localizer={localizer}
                  events={eventosCalendario}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  messages={mensajesCalendario}
                  eventPropGetter={eventStyleGetter}
                  views={["month", "week", "day", "agenda"]}
                  defaultView="month"
                  onSelectEvent={(event) => {
                    window.location.href = `/dashboard/cursos/${event.resource.curso._id}`;
                  }}
                  popup
                />
              )}
            </Card.Body>
          </Card>

          {/* Leyenda */}
          <Card className="shadow-sm mt-3">
            <Card.Body>
              <Row className="g-2">
                <Col xs={12}>
                  <strong>Leyenda:</strong>
                </Col>
                <Col xs={6} md={3}>
                  <Badge bg="primary" className="me-2">
                    ⬤
                  </Badge>
                  Programada
                </Col>
                <Col xs={6} md={3}>
                  <Badge bg="success" className="me-2">
                    ⬤
                  </Badge>
                  En Curso
                </Col>
                <Col xs={6} md={3}>
                  <Badge bg="secondary" className="me-2">
                    ⬤
                  </Badge>
                  Finalizada
                </Col>
                <Col xs={6} md={3}>
                  <Badge bg="danger" className="me-2">
                    ⬤
                  </Badge>
                  Cancelada
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* Vista de Lista Agrupada por Curso */}
        <Tab eventKey="lista" title="📑 Vista por Curso">
          {cursos.length === 0 ? (
            <Card className="shadow-sm">
              <Card.Body className="text-center text-muted py-5">
                <h5>No tienes cursos asignados</h5>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {cursos.map((curso) => {
                const clasesCurso = clasesFiltradas.filter(
                  (clase) => clase.curso._id === curso._id
                );

                if (filtroCurso !== "todos" && filtroCurso !== curso._id)
                  return null;

                return (
                  <Col key={curso._id} xs={12} className="mb-4">
                    <Card className="shadow-sm">
                      <Card.Header className="bg-primary text-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-0">{curso.titulo}</h5>
                            <small>{curso.codigo}</small>
                          </div>
                          <Badge bg="light" text="dark">
                            {clasesCurso.length} clase(s)
                          </Badge>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        {clasesCurso.length === 0 ? (
                          <div className="text-center text-muted py-3">
                            No hay clases que coincidan con los filtros
                          </div>
                        ) : (
                          <Table striped hover responsive size="sm">
                            <thead>
                              <tr>
                                <th>Fecha</th>
                                <th>Clase</th>
                                <th>Horario</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clasesCurso.map((clase) => (
                                <tr key={clase._id}>
                                  <td>{formatearFechaCorta(clase.fecha)}</td>
                                  <td>
                                    <strong>{clase.titulo}</strong>
                                  </td>
                                  <td>
                                    {clase.horaInicio} - {clase.horaFin}
                                  </td>
                                  <td>
                                    <Badge bg="info" className="text-white">
                                      {clase.tipo}
                                    </Badge>
                                  </td>
                                  <td>
                                    <Badge bg={getBadgeEstado(clase.estado)}>
                                      {clase.estado?.replace("_", " ")}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </Card.Body>
                      <Card.Footer className="bg-white text-center">
                        <Link
                          to={`/dashboard/cursos/${curso._id}`}
                          className="text-decoration-none"
                        >
                          Ver detalles del curso →
                        </Link>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Tab>
      </Tabs>

      {/* CSS personalizado */}
      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-toolbar button {
          color: #495057;
          border: 1px solid #dee2e6;
        }
        .rbc-toolbar button:active,
        .rbc-toolbar button.rbc-active {
          background-color: #0d6efd;
          color: white;
          border-color: #0d6efd;
        }
        .rbc-toolbar button:hover {
          background-color: #e9ecef;
        }
        .rbc-event {
          padding: 2px 5px;
          font-size: 0.85em;
        }
        .rbc-today {
          background-color: #fff3cd;
        }
        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default MisClases;