// frontend/src/services/tareaService.js
import API from "./api";

// Listar tareas
export const listarTareas = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const { data } = await API.get(`/tareas?${queryString}`);
  return data;
};

// Obtener tarea por ID
export const obtenerTarea = async (id) => {
  const { data } = await API.get(`/tareas/${id}`);
  return data;
};

// Crear tarea
export const crearTarea = async (formData) => {
  const { data } = await API.post("/tareas", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// Actualizar tarea
export const actualizarTarea = async (id, formData) => {
  const { data } = await API.put(`/tareas/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// Eliminar tarea
export const eliminarTarea = async (id) => {
  const { data } = await API.delete(`/tareas/${id}`);
  return data;
};

// Obtener tareas por curso
export const obtenerTareasPorCurso = async (cursoId) => {
  const { data } = await API.get(`/tareas/curso/${cursoId}`);
  return data;
};

// Obtener tareas próximas
export const obtenerTareasProximas = async () => {
  const { data } = await API.get("/tareas/proximas");
  return data;
};

// Duplicar tarea
export const duplicarTarea = async (id) => {
  const { data } = await API.post(`/tareas/${id}/duplicar`);
  return data;
};