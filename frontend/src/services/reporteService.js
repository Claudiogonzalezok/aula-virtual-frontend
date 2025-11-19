// frontend/src/services/reporteService.js
import API from "./api";

// Obtener estadísticas generales del dashboard
export const obtenerEstadisticasGenerales = async () => {
  const { data } = await API.get("/reportes/estadisticas-generales");
  return data;
};

// Obtener reporte de un curso específico
export const obtenerReporteCurso = async (cursoId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const { data } = await API.get(`/reportes/curso/${cursoId}?${queryString}`);
  return data;
};

// Obtener reporte individual de un alumno
export const obtenerReporteAlumno = async (alumnoId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const { data } = await API.get(`/reportes/alumno/${alumnoId}?${queryString}`);
  return data;
};

// Obtener estadísticas de rendimiento
export const obtenerEstadisticasRendimiento = async (cursoId) => {
  const { data } = await API.get(`/reportes/rendimiento/${cursoId}`);
  return data;
};

// Exportar reporte a PDF
export const exportarReportePDF = async (tipo, id) => {
  const { data } = await API.get(`/reportes/exportar/pdf/${tipo}/${id}`, {
    responseType: "blob",
  });
  return data;
};

// Exportar reporte a Excel
export const exportarReporteExcel = async (tipo, id) => {
  const { data } = await API.get(`/reportes/exportar/excel/${tipo}/${id}`, {
    responseType: "blob",
  });
  return data;
};