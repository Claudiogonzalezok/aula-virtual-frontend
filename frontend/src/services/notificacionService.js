// frontend/src/services/notificacionService.js
import API from "./api";

export const obtenerNotificaciones = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const { data } = await API.get(`/notificaciones?${queryString}`);
  return data;
};

export const marcarComoLeida = async (id) => {
  const { data } = await API.put(`/notificaciones/${id}/leida`);
  return data;
};

export const marcarTodasLeidas = async () => {
  const { data } = await API.put("/notificaciones/marcar-todas-leidas");
  return data;
};

export const eliminarNotificacion = async (id) => {
  const { data } = await API.delete(`/notificaciones/${id}`);
  return data;
};

export const obtenerNoLeidas = async () => {
  const { data } = await API.get("/notificaciones/no-leidas/count");
  return data;
};