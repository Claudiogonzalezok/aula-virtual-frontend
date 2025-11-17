// frontend/src/services/examenService.js
import API from "./api";

// Listar exámenes
export const listarExamenes = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const { data } = await API.get(`/examenes?${queryString}`);
  return data;
};

// Obtener examen por ID
export const obtenerExamen = async (id) => {
  const { data } = await API.get(`/examenes/${id}`);
  return data;
};

// Crear examen
export const crearExamen = async (examenData) => {
  const { data } = await API.post("/examenes", examenData);
  return data;
};

// Actualizar examen
export const actualizarExamen = async (id, examenData) => {
  const { data } = await API.put(`/examenes/${id}`, examenData);
  return data;
};

// Eliminar examen
export const eliminarExamen = async (id) => {
  const { data } = await API.delete(`/examenes/${id}`);
  return data;
};

// Iniciar intento
export const iniciarIntento = async (examenId) => {
  const { data } = await API.post(`/examenes/${examenId}/iniciar`);
  return data;
};

// Enviar respuestas
export const enviarRespuestas = async (examenId, respuestasData) => {
  const { data } = await API.post(`/examenes/${examenId}/enviar`, respuestasData);
  return data;
};

// Calificar manualmente
export const calificarManualmente = async (examenId, calificacionData) => {
  const { data } = await API.post(`/examenes/${examenId}/calificar`, calificacionData);
  return data;
};

// Obtener estadísticas
export const obtenerEstadisticas = async (examenId) => {
  const { data } = await API.get(`/examenes/${examenId}/estadisticas`);
  return data;
};