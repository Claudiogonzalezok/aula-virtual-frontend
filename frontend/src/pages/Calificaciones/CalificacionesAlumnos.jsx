// frontend/src/pages/Calificaciones/CalificacionesAlumnos.jsx
import { useState, useEffect, useContext } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Table,
  Button,
  Spinner,
  Badge,
  Alert,
  InputGroup,
  Modal,
  OverlayTrigger,
  Tooltip,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import {
  FaSearch,
  FaFileExcel,
  FaFilePdf,
  FaUser,
  FaChartBar,
  FaFilter,
  FaEye,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUsers
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-toastify";

const CalificacionesAlumnos = () => {
  const { usuario } = useContext(AuthContext);
  
  // Estados principales
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [calificaciones, setCalificaciones] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCursos, setLoadingCursos] = useState(true);
  
  // Estados de filtro y búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  
  // Estados del modal de detalle
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [alumnoDetalle, setAlumnoDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  
  // Estados de exportación
  const [exportando, setExportando] = useState(false);

  // Cargar cursos del docente al montar
  useEffect(() => {
    cargarCursos();
  }, []);

  // Cargar calificaciones cuando se selecciona un curso
  useEffect(() => {
    if (cursoSeleccionado) {
      cargarCalificaciones();
    } else {
      setCalificaciones(null);
    }
  }, [cursoSeleccionado]);

  const cargarCursos = async () => {
    try {
      setLoadingCursos(true);
      const { data } = await API.get("/calificaciones/cursos");
      setCursos(data);
      
      // Si solo hay un curso, seleccionarlo automáticamente
      if (data.length === 1) {
        setCursoSeleccionado(data[0]._id);
      }
    } catch (error) {
      console.error("Error al cargar cursos:", error);
      toast.error("Error al cargar los cursos");
    } finally {
      setLoadingCursos(false);
    }
  };

  const cargarCalificaciones = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/calificaciones/curso/${cursoSeleccionado}`);
      setCalificaciones(data);
      setAlumnosSeleccionados([]);
    } catch (error) {
      console.error("Error al cargar calificaciones:", error);
      toast.error("Error al cargar las calificaciones");
    } finally {
      setLoading(false);
    }
  };

  const verDetalleAlumno = async (alumno) => {
    try {
      setLoadingDetalle(true);
      setShowDetalleModal(true);
      const { data } = await API.get(
        `/calificaciones/curso/${cursoSeleccionado}/alumno/${alumno._id}`
      );
      setAlumnoDetalle(data);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      toast.error("Error al cargar el detalle del alumno");
      setShowDetalleModal(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // Filtrar alumnos
  const alumnosFiltrados = calificaciones?.calificaciones?.filter(item => {
    const coincideBusqueda = 
      item.alumno.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.alumno.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (item.alumno.legajo && item.alumno.legajo.toLowerCase().includes(busqueda.toLowerCase()));

    if (filtroEstado === "todos") return coincideBusqueda;
    
    const promedio = parseFloat(item.promedios.general);
    if (filtroEstado === "aprobados") return coincideBusqueda && promedio >= 60;
    if (filtroEstado === "desaprobados") return coincideBusqueda && promedio !== null && promedio < 60;
    if (filtroEstado === "sin_calificar") return coincideBusqueda && promedio === null;
    
    return coincideBusqueda;
  }) || [];

  // Manejar selección de alumnos
  const toggleSeleccionAlumno = (alumnoId) => {
    setAlumnosSeleccionados(prev => {
      if (prev.includes(alumnoId)) {
        return prev.filter(id => id !== alumnoId);
      }
      return [...prev, alumnoId];
    });
  };

  const seleccionarTodos = () => {
    if (alumnosSeleccionados.length === alumnosFiltrados.length) {
      setAlumnosSeleccionados([]);
    } else {
      setAlumnosSeleccionados(alumnosFiltrados.map(a => a.alumno._id));
    }
  };

  // Exportar a Excel
  const exportarExcel = async (tipo) => {
    try {
      setExportando(true);
      
      let alumnosIds = [];
      if (tipo === "seleccionados") {
        if (alumnosSeleccionados.length === 0) {
          toast.warning("Selecciona al menos un alumno para exportar");
          return;
        }
        alumnosIds = alumnosSeleccionados;
      }

      const { data } = await API.post(
        `/calificaciones/curso/${cursoSeleccionado}/exportar`,
        { alumnosIds }
      );

      // Generar Excel en el cliente
      await generarExcel(data);
      toast.success("Archivo Excel generado exitosamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al generar el archivo Excel");
    } finally {
      setExportando(false);
    }
  };

  const generarExcel = async (datos) => {
    // Importar SheetJS dinámicamente
    const XLSX = await import("xlsx");
    
    // Crear datos para la hoja
    const filas = [];
    
    // Encabezados
    const encabezados = ["Nombre", "Email", "Legajo"];
    datos.columnas.examenes.forEach(e => encabezados.push(`Examen: ${e.titulo}`));
    datos.columnas.tareas.forEach(t => encabezados.push(`Tarea: ${t.titulo}`));
    encabezados.push("Prom. Exámenes", "Prom. Tareas", "Prom. General");
    filas.push(encabezados);

    // Datos de alumnos
    datos.datos.forEach(alumno => {
      const fila = [alumno.nombre, alumno.email, alumno.legajo];
      
      datos.columnas.examenes.forEach(e => {
        const nota = alumno[`examen_${e.id}`];
        fila.push(nota !== null ? `${nota.toFixed(1)}%` : "Sin realizar");
      });
      
      datos.columnas.tareas.forEach(t => {
        const nota = alumno[`tarea_${t.id}`];
        fila.push(nota !== null ? `${nota.toFixed(1)}%` : "Sin entregar");
      });
      
      fila.push(
        alumno.promedioExamenes ? `${alumno.promedioExamenes}%` : "N/A",
        alumno.promedioTareas ? `${alumno.promedioTareas}%` : "N/A",
        alumno.promedioGeneral ? `${alumno.promedioGeneral}%` : "N/A"
      );
      
      filas.push(fila);
    });

    // Crear libro y hoja
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(filas);
    
    // Ajustar anchos de columna
    const colWidths = encabezados.map(h => ({ wch: Math.max(h.length, 15) }));
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");
    
    // Descargar
    const nombreArchivo = `Calificaciones_${datos.curso.codigo}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  };

  // Exportar a PDF
  const exportarPDF = async (tipo) => {
    try {
      setExportando(true);
      
      let alumnosIds = [];
      if (tipo === "seleccionados") {
        if (alumnosSeleccionados.length === 0) {
          toast.warning("Selecciona al menos un alumno para exportar");
          return;
        }
        alumnosIds = alumnosSeleccionados;
      }

      const { data } = await API.post(
        `/calificaciones/curso/${cursoSeleccionado}/exportar`,
        { alumnosIds }
      );

      await generarPDF(data);
      toast.success("Archivo PDF generado exitosamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("Error al generar el archivo PDF");
    } finally {
      setExportando(false);
    }
  };

  const generarPDF = async (datos) => {
    // Importar jsPDF dinámicamente
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    
    const doc = new jsPDF("landscape");
    
    // Título
    doc.setFontSize(18);
    doc.text(`Calificaciones - ${datos.curso.titulo}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Código: ${datos.curso.codigo} | Docente: ${datos.curso.docente}`, 14, 28);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-AR")}`, 14, 35);

    // Preparar datos para la tabla
    const encabezados = [["Nombre", "Legajo"]];
    datos.columnas.examenes.forEach(e => encabezados[0].push(e.titulo.substring(0, 15)));
    datos.columnas.tareas.forEach(t => encabezados[0].push(t.titulo.substring(0, 15)));
    encabezados[0].push("Prom.");

    const filas = datos.datos.map(alumno => {
      const fila = [alumno.nombre, alumno.legajo || "N/A"];
      
      datos.columnas.examenes.forEach(e => {
        const nota = alumno[`examen_${e.id}`];
        fila.push(nota !== null ? `${nota.toFixed(0)}%` : "-");
      });
      
      datos.columnas.tareas.forEach(t => {
        const nota = alumno[`tarea_${t.id}`];
        fila.push(nota !== null ? `${nota.toFixed(0)}%` : "-");
      });
      
      fila.push(alumno.promedioGeneral ? `${alumno.promedioGeneral}%` : "N/A");
      
      return fila;
    });

    // Generar tabla
    autoTable(doc, {
      head: encabezados,
      body: filas,
      startY: 42,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [40, 167, 69], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20 }
      }
    });

    // Guardar
    const nombreArchivo = `Calificaciones_${datos.curso.codigo}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
  };

  // Renderizar badge de estado
  const renderEstadoBadge = (promedio) => {
    if (promedio === null) {
      return <Badge bg="secondary">Sin calificar</Badge>;
    }
    const valor = parseFloat(promedio);
    if (valor >= 80) return <Badge bg="success">Excelente</Badge>;
    if (valor >= 60) return <Badge bg="primary">Aprobado</Badge>;
    return <Badge bg="danger">Desaprobado</Badge>;
  };

  // Renderizar icono de estado
  const renderEstadoIcono = (estado) => {
    switch (estado) {
      case "calificado":
        return <FaCheckCircle className="text-success" />;
      case "completado":
        return <FaClock className="text-warning" />;
      case "sin_realizar":
      case "pendiente":
        return <FaTimesCircle className="text-secondary" />;
      default:
        return null;
    }
  };

  return (
    <Container fluid className="py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-success fw-bold mb-1">
            <FaUsers className="me-2" />
            Calificaciones de Alumnos
          </h2>
          <p className="text-muted mb-0">
            Consulta y exporta las calificaciones de tus alumnos
          </p>
        </div>
      </div>

      {/* Selector de Curso */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Seleccionar Curso</Form.Label>
                {loadingCursos ? (
                  <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Cargando cursos...
                  </div>
                ) : cursos.length === 0 ? (
                  <Alert variant="info" className="mb-0">
                    No tienes cursos asignados
                  </Alert>
                ) : (
                  <Form.Select
                    value={cursoSeleccionado}
                    onChange={(e) => setCursoSeleccionado(e.target.value)}
                    size="lg"
                  >
                    <option value="">-- Seleccionar curso --</option>
                    {cursos.map((curso) => (
                      <option key={curso._id} value={curso._id}>
                        {curso.codigo} - {curso.titulo} ({curso.cantidadAlumnos} alumnos)
                      </option>
                    ))}
                  </Form.Select>
                )}
              </Form.Group>
            </Col>
            
            {calificaciones && (
              <Col md={6} className="text-md-end mt-3 mt-md-0">
                <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                  <Badge bg="success" className="p-2">
                    {calificaciones.resumen.totalAlumnos} Alumnos
                  </Badge>
                  <Badge bg="primary" className="p-2">
                    {calificaciones.resumen.totalExamenes} Exámenes
                  </Badge>
                  <Badge bg="warning" text="dark" className="p-2">
                    {calificaciones.resumen.totalTareas} Tareas
                  </Badge>
                </div>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* Contenido Principal */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Cargando calificaciones...</p>
        </div>
      ) : calificaciones ? (
        <>
          {/* Filtros y Acciones */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Buscar por nombre, email o legajo..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                
                <Col md={3}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaFilter />
                    </InputGroup.Text>
                    <Form.Select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="aprobados">Aprobados (≥60%)</option>
                      <option value="desaprobados">Desaprobados (&lt;60%)</option>
                      <option value="sin_calificar">Sin calificar</option>
                    </Form.Select>
                  </InputGroup>
                </Col>

                <Col md={5} className="text-md-end mt-3 mt-md-0">
                  <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                    {alumnosSeleccionados.length > 0 && (
                      <Badge bg="info" className="d-flex align-items-center py-2 px-3">
                        {alumnosSeleccionados.length} seleccionados
                      </Badge>
                    )}
                    
                    <DropdownButton
                      variant="success"
                      title={
                        <>
                          <FaFileExcel className="me-1" />
                          Excel
                        </>
                      }
                      disabled={exportando}
                    >
                      <Dropdown.Item onClick={() => exportarExcel("todos")}>
                        <FaUsers className="me-2" />
                        Exportar todos
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => exportarExcel("seleccionados")}
                        disabled={alumnosSeleccionados.length === 0}
                      >
                        <FaUser className="me-2" />
                        Exportar seleccionados ({alumnosSeleccionados.length})
                      </Dropdown.Item>
                    </DropdownButton>

                    <DropdownButton
                      variant="danger"
                      title={
                        <>
                          <FaFilePdf className="me-1" />
                          PDF
                        </>
                      }
                      disabled={exportando}
                    >
                      <Dropdown.Item onClick={() => exportarPDF("todos")}>
                        <FaUsers className="me-2" />
                        Exportar todos
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => exportarPDF("seleccionados")}
                        disabled={alumnosSeleccionados.length === 0}
                      >
                        <FaUser className="me-2" />
                        Exportar seleccionados ({alumnosSeleccionados.length})
                      </Dropdown.Item>
                    </DropdownButton>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Tabla de Calificaciones */}
          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="bg-dark text-white">
                    <tr>
                      <th className="py-3">
                        <Form.Check
                          type="checkbox"
                          checked={alumnosSeleccionados.length === alumnosFiltrados.length && alumnosFiltrados.length > 0}
                          onChange={seleccionarTodos}
                        />
                      </th>
                      <th className="py-3">Alumno</th>
                      <th className="py-3 text-center">Exámenes</th>
                      <th className="py-3 text-center">Tareas</th>
                      <th className="py-3 text-center">Prom. Exámenes</th>
                      <th className="py-3 text-center">Prom. Tareas</th>
                      <th className="py-3 text-center">Prom. General</th>
                      <th className="py-3 text-center">Estado</th>
                      <th className="py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          <p className="text-muted mb-0">
                            No se encontraron alumnos con los filtros aplicados
                          </p>
                        </td>
                      </tr>
                    ) : (
                      alumnosFiltrados.map((item) => (
                        <tr key={item.alumno._id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={alumnosSeleccionados.includes(item.alumno._id)}
                              onChange={() => toggleSeleccionAlumno(item.alumno._id)}
                            />
                          </td>
                          <td>
                            <div>
                              <strong>{item.alumno.nombre}</strong>
                              <br />
                              <small className="text-muted">{item.alumno.email}</small>
                              {item.alumno.legajo && (
                                <small className="text-muted d-block">
                                  Legajo: {item.alumno.legajo}
                                </small>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-1">
                              {item.examenes.slice(0, 3).map((ex, idx) => (
                                <OverlayTrigger
                                  key={idx}
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      {ex.titulo}: {ex.porcentaje !== null ? `${ex.porcentaje}%` : "Sin realizar"}
                                    </Tooltip>
                                  }
                                >
                                  <span className="cursor-pointer">
                                    {renderEstadoIcono(ex.estado)}
                                  </span>
                                </OverlayTrigger>
                              ))}
                              {item.examenes.length > 3 && (
                                <Badge bg="secondary">+{item.examenes.length - 3}</Badge>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-1">
                              {item.tareas.slice(0, 3).map((ta, idx) => (
                                <OverlayTrigger
                                  key={idx}
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      {ta.titulo}: {ta.porcentaje !== null ? `${ta.porcentaje}%` : "Sin entregar"}
                                    </Tooltip>
                                  }
                                >
                                  <span className="cursor-pointer">
                                    {renderEstadoIcono(ta.estado === "calificada" ? "calificado" : ta.estado)}
                                  </span>
                                </OverlayTrigger>
                              ))}
                              {item.tareas.length > 3 && (
                                <Badge bg="secondary">+{item.tareas.length - 3}</Badge>
                              )}
                            </div>
                          </td>
                          <td className="text-center">
                            {item.promedios.examenes !== null ? (
                              <span className={`fw-bold ${parseFloat(item.promedios.examenes) >= 60 ? "text-success" : "text-danger"}`}>
                                {item.promedios.examenes}%
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-center">
                            {item.promedios.tareas !== null ? (
                              <span className={`fw-bold ${parseFloat(item.promedios.tareas) >= 60 ? "text-success" : "text-danger"}`}>
                                {item.promedios.tareas}%
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-center">
                            {item.promedios.general !== null ? (
                              <span className={`fw-bold fs-5 ${parseFloat(item.promedios.general) >= 60 ? "text-success" : "text-danger"}`}>
                                {item.promedios.general}%
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="text-center">
                            {renderEstadoBadge(item.promedios.general)}
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => verDetalleAlumno(item.alumno)}
                            >
                              <FaEye className="me-1" />
                              Ver detalle
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      ) : cursoSeleccionado ? (
        <Alert variant="info">
          Selecciona un curso para ver las calificaciones
        </Alert>
      ) : null}

      {/* Modal de Detalle de Alumno */}
      <Modal
        show={showDetalleModal}
        onHide={() => setShowDetalleModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaUser className="me-2" />
            Detalle de Calificaciones
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetalle ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : alumnoDetalle ? (
            <>
              {/* Info del Alumno */}
              <Card className="mb-4 border-0 bg-light">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h5 className="mb-1">{alumnoDetalle.alumno.nombre}</h5>
                      <p className="text-muted mb-0">{alumnoDetalle.alumno.email}</p>
                      {alumnoDetalle.alumno.legajo && (
                        <small className="text-muted">Legajo: {alumnoDetalle.alumno.legajo}</small>
                      )}
                    </Col>
                    <Col md={6} className="text-md-end">
                      <div className="d-flex gap-3 justify-content-md-end">
                        <div className="text-center">
                          <small className="text-muted d-block">Exámenes</small>
                          <span className="fs-4 fw-bold text-primary">
                            {alumnoDetalle.estadisticas.promedioExamenes || "-"}%
                          </span>
                        </div>
                        <div className="text-center">
                          <small className="text-muted d-block">Tareas</small>
                          <span className="fs-4 fw-bold text-warning">
                            {alumnoDetalle.estadisticas.promedioTareas || "-"}%
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Exámenes */}
              <h6 className="fw-bold mb-3">
                <FaChartBar className="me-2 text-primary" />
                Exámenes ({alumnoDetalle.estadisticas.examenesRealizados}/{alumnoDetalle.estadisticas.examenesTotales})
              </h6>
              <Table striped bordered hover size="sm" className="mb-4">
                <thead className="table-primary">
                  <tr>
                    <th>Examen</th>
                    <th className="text-center">Mejor Nota</th>
                    <th className="text-center">Intentos</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnoDetalle.examenes.map((examen) => (
                    <tr key={examen.examenId}>
                      <td>{examen.titulo}</td>
                      <td className="text-center">
                        {examen.mejorCalificacion !== null ? (
                          <span className={examen.mejorCalificacion >= 60 ? "text-success fw-bold" : "text-danger fw-bold"}>
                            {examen.mejorCalificacion}%
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center">{examen.intentos.length}</td>
                      <td className="text-center">
                        {examen.intentos.length > 0 ? (
                          <Badge bg={examen.mejorCalificacion >= 60 ? "success" : "danger"}>
                            {examen.mejorCalificacion >= 60 ? "Aprobado" : "Desaprobado"}
                          </Badge>
                        ) : (
                          <Badge bg="secondary">Sin realizar</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Tareas */}
              <h6 className="fw-bold mb-3">
                <FaChartBar className="me-2 text-warning" />
                Tareas ({alumnoDetalle.estadisticas.tareasEntregadas}/{alumnoDetalle.estadisticas.tareasTotales})
              </h6>
              <Table striped bordered hover size="sm">
                <thead className="table-warning">
                  <tr>
                    <th>Tarea</th>
                    <th className="text-center">Calificación</th>
                    <th className="text-center">Fecha Entrega</th>
                    <th className="text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnoDetalle.tareas.map((tarea) => (
                    <tr key={tarea.tareaId}>
                      <td>{tarea.titulo}</td>
                      <td className="text-center">
                        {tarea.entrega?.calificacion != null ? (
                          <span className={parseFloat(tarea.entrega.porcentaje) >= 60 ? "text-success fw-bold" : "text-danger fw-bold"}>
                            {tarea.entrega.porcentaje}%
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center">
                        {tarea.entrega?.fechaEntrega ? (
                          <>
                            {new Date(tarea.entrega.fechaEntrega).toLocaleDateString("es-AR")}
                            {tarea.entrega.entregadaTarde && (
                              <Badge bg="warning" text="dark" className="ms-2">Tarde</Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-center">
                        {tarea.entrega ? (
                          <Badge bg={
                            tarea.entrega.estado === "calificada" ? "success" :
                            tarea.entrega.estado === "entregada" ? "info" : "secondary"
                          }>
                            {tarea.entrega.estado}
                          </Badge>
                        ) : (
                          <Badge bg="secondary">Pendiente</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetalleModal(false)}>
            Cerrar
          </Button>
          {alumnoDetalle && (
            <Button
              variant="success"
              onClick={async () => {
                const { data } = await API.post(
                  `/calificaciones/curso/${cursoSeleccionado}/exportar`,
                  { alumnosIds: [alumnoDetalle.alumno._id] }
                );
                await generarPDF(data);
                toast.success("Reporte del alumno generado");
              }}
            >
              <FaDownload className="me-1" />
              Exportar PDF
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Indicador de exportación */}
      {exportando && (
        <div 
          className="position-fixed top-50 start-50 translate-middle bg-white p-4 rounded shadow-lg"
          style={{ zIndex: 9999 }}
        >
          <Spinner animation="border" variant="success" className="me-2" />
          Generando archivo...
        </div>
      )}

      <style>{`
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Container>
  );
};

export default CalificacionesAlumnos;