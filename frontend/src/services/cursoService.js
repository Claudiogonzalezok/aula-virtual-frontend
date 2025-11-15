// frontend/src/services/cursoService.js
import API from "./api";

// Listar cursos
export const listarCursos = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const { data } = await API.get(`/cursos?${queryString}`);
  return data;
};

// Obtener curso por ID
export const obtenerCurso = async (id) => {
  const { data } = await API.get(`/cursos/${id}`);
  return data;
};

// Crear curso
export const crearCurso = async (cursoData) => {
  const { data } = await API.post("/cursos", cursoData);
  return data;
};

// Actualizar curso
export const actualizarCurso = async (id, cursoData) => {
  const { data } = await API.put(`/cursos/${id}`, cursoData);
  return data;
};

// Eliminar curso
export const eliminarCurso = async (id) => {
  const { data } = await API.delete(`/cursos/${id}`);
  return data;
};

// Obtener cursos del docente
export const obtenerMisCursos = async () => {
  const { data } = await API.get("/cursos/mis-cursos");
  return data;
};

// Inscribirse a un curso (alumno)
export const inscribirseCurso = async (cursoId) => {
  const { data } = await API.post(`/cursos/${cursoId}/inscribirse`);
  return data;
};

// Obtener alumnos de un curso
export const obtenerAlumnosCurso = async (cursoId) => {
  const { data } = await API.get(`/cursos/${cursoId}/alumnos`);
  return data;
};