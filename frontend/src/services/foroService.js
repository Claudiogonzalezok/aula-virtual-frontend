// frontend/src/services/foroService.js
import API from "./api";

export const listarForos = async (cursoId) => {
  const { data } = await API.get(`/foros/curso/${cursoId}`);
  return data;
};

export const obtenerForo = async (id) => {
  const { data } = await API.get(`/foros/${id}`);
  return data;
};

export const crearForo = async (foroData) => {
  const { data } = await API.post("/foros", foroData);
  return data;
};

export const responderForo = async (foroId, mensaje) => {
  const { data } = await API.post(`/foros/${foroId}/responder`, { mensaje });
  return data;
};

export const eliminarForo = async (id) => {
  const { data } = await API.delete(`/foros/${id}`);
  return data;
};