// frontend/src/pages/Reportes/ReportesGeneral.jsx
import { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Button, Form } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { obtenerEstadisticasGenerales } from "../../services/reporteService";
import GraficoRendimiento from "../../components/Reportes/GraficoRendimiento";
import { FaDownload, FaChartBar, FaUsers, FaBookOpen, FaTasks } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const ReportesGeneral = () => {
  const { usuario } = useContext(AuthContext);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroFecha, setFiltroFecha] = useState("mes");

  useEffect(() => {
    cargarEstadisticas();
  }, [filtroFecha]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await obtenerEstadisticasGenerales();
      setEstadisticas(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Reporte de Estadísticas Generales", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Usuario: ${usuario.nombre}`, 14, 36);
    
    // Tabla de resumen
    doc.autoTable({
      startY: 45,
      head: [["Métrica", "Valor"]],
      body: [
        ["Total Cursos", estadisticas.totalCursos],
        ["Total Alumnos", estadisticas.totalAlumnos],
        ["Tareas Pendientes", estadisticas.tareasPendientes],
        ["Exámenes Este Mes", estadisticas.examenesEsteMes],
      ],
    });

    doc.save("reporte-estadisticas.pdf");
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Métrica: "Total Cursos", Valor: estadisticas.totalCursos },
      { Métrica: "Total Alumnos", Valor: estadisticas.totalAlumnos },
      { Métrica: "Tareas Pendientes", Valor: estadisticas.tareasPendientes },
      { Métrica: "Exámenes Este Mes", Valor: estadisticas.examenesEsteMes },
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
    XLSX.writeFile(wb, "reporte-estadisticas.xlsx");
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando estadísticas...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
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
              <h2>📊 Reportes y Estadísticas</h2>
              <p className="text-muted">Panel de análisis general</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-danger" onClick={exportarPDF}>
                <FaDownload className="me-2" />
                PDF
              </Button>
              <Button variant="outline-success" onClick={exportarExcel}>
                <FaDownload className="me-2" />
                Excel
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Período</Form.Label>
                <Form.Select
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                >
                  <option value="semana">Última semana</option>
                  <option value="mes">Último mes</option>
                  <option value="trimestre">Último trimestre</option>
                  <option value="anio">Último año</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tarjetas de Resumen */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm border-primary">
            <Card.Body>
              <FaBookOpen size={40} className="text-primary mb-2" />
              <h3>{estadisticas.totalCursos}</h3>
              <p className="text-muted mb-0">Cursos Activos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-success">
            <Card.Body>
              <FaUsers size={40} className="text-success mb-2" />
              <h3>{estadisticas.totalAlumnos}</h3>
              <p className="text-muted mb-0">Alumnos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-warning">
            <Card.Body>
              <FaTasks size={40} className="text-warning mb-2" />
              <h3>{estadisticas.tareasPendientes}</h3>
              <p className="text-muted mb-0">Tareas Pendientes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-info">
            <Card.Body>
              <FaChartBar size={40} className="text-info mb-2" />
              <h3>{estadisticas.examenesEsteMes}</h3>
              <p className="text-muted mb-0">Exámenes Este Mes</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row>
        <Col md={6} className="mb-4">
          <GraficoRendimiento
            datos={estadisticas.rendimientoPorCurso}
            tipo="barras"
            titulo="📈 Rendimiento por Curso"
          />
        </Col>
        <Col md={6} className="mb-4">
          <GraficoRendimiento
            datos={estadisticas.distribucionNotas}
            tipo="torta"
            titulo="📊 Distribución de Calificaciones"
          />
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <GraficoRendimiento
            datos={estadisticas.evolucionTemporal}
            tipo="linea"
            titulo="📉 Evolución Temporal del Rendimiento"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ReportesGeneral;