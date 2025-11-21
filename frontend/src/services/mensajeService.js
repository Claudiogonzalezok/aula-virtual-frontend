// frontend/src/services/mensajeService.js
import API from "./api";

export const obtenerConversaciones = async () => {
  const { data } = await API.get("/mensajes/conversaciones");
  return data;
};

export const obtenerMensajes = async (usuarioId) => {
  const { data } = await API.get(`/mensajes/conversacion/${usuarioId}`);
  return data;
};

export const enviarMensaje = async (destinatarioId, contenido) => {
  const { data } = await API.post("/mensajes", { destinatarioId, contenido });
  return data;
};

export const marcarComoLeido = async (mensajeId) => {
  const { data } = await API.put(`/mensajes/${mensajeId}/leido`);
  return data;
};

