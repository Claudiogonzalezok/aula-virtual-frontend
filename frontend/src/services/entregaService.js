// frontend/src/services/entregaService.js
import API from "./api";

// Obtener mis entregas (alumno)
export const obtenerMisEntregas = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const { data } = await API.get(`/entregas/mis-entregas?${queryString}`);
  return data;
};

// Obtener entregas por tarea (docente)
export const obtenerEntregasPorTarea = async (tareaId) => {
  const { data } = await API.get(`/entregas/tarea/${tareaId}`);
  return data;
};

// Obtener entrega por ID
export const obtenerEntrega = async (id) => {
  const { data } = await API.get(`/entregas/${id}`);
  return data;
};

// Crear entrega
export const crearEntrega = async (formData) => {
  const { data } = await API.post("/entregas", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// Actualizar entrega
export const actualizarEntrega = async (id, formData) => {
  const { data } = await API.put(`/entregas/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// Calificar entrega
export const calificarEntrega = async (id, formData) => {
  const { data } = await API.post(`/entregas/${id}/calificar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// Devolver entrega
export const devolverEntrega = async (id, comentario) => {
  const { data } = await API.post(`/entregas/${id}/devolver`, { comentarioDocente: comentario });
  return data;
};

// Exportar calificaciones
export const exportarCalificaciones = async (tareaId) => {
  const { data } = await API.get(`/entregas/tarea/${tareaId}/exportar`);
  return data;
};