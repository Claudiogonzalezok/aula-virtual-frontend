// frontend/src/services/anuncioService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// ==================== ANUNCIOS ====================

// Obtener anuncios de un curso
export const obtenerAnunciosPorCurso = async (cursoId) => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/curso/${cursoId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Obtener un anuncio específico
export const obtenerAnuncioPorId = async (anuncioId) => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/${anuncioId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Crear un anuncio (solo docente)
export const crearAnuncio = async (anuncioData) => {
  try {
    const response = await axios.post(
      `${API_URL}/anuncios`,
      anuncioData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Actualizar un anuncio
export const actualizarAnuncio = async (anuncioId, anuncioData) => {
  try {
    const response = await axios.put(
      `${API_URL}/anuncios/${anuncioId}`,
      anuncioData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Eliminar un anuncio
export const eliminarAnuncio = async (anuncioId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/anuncios/${anuncioId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== ANUNCIOS GLOBALES ====================

// Obtener anuncios globales (administrador)
export const obtenerAnunciosGlobales = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/globales`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Crear anuncio global (solo admin)
export const crearAnuncioGlobal = async (anuncioData) => {
  try {
    const response = await axios.post(
      `${API_URL}/anuncios/globales`,
      anuncioData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== ESTADO DE ANUNCIOS ====================

// Marcar anuncio como leído
export const marcarAnuncioLeido = async (anuncioId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/anuncios/${anuncioId}/leido`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Obtener anuncios no leídos
export const obtenerAnunciosNoLeidos = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/no-leidos`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Obtener cantidad de anuncios no leídos
export const obtenerCantidadNoLeidos = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/no-leidos/cantidad`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== FILTROS Y BÚSQUEDA ====================

// Obtener anuncios por prioridad
export const obtenerAnunciosPorPrioridad = async (cursoId, prioridad) => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/curso/${cursoId}/prioridad/${prioridad}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Obtener anuncios recientes
export const obtenerAnunciosRecientes = async (limit = 5) => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/recientes`,
      {
        params: { limit },
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Buscar anuncios
export const buscarAnuncios = async (cursoId, query) => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/curso/${cursoId}/buscar`,
      {
        params: { q: query },
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== FIJAR/DESTACAR ====================

// Fijar/Desfijar anuncio
export const toggleFijarAnuncio = async (anuncioId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/anuncios/${anuncioId}/fijar`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Obtener anuncios fijados de un curso
export const obtenerAnunciosFijados = async (cursoId) => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/curso/${cursoId}/fijados`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== ADJUNTOS ====================

// Crear anuncio con archivo adjunto
export const crearAnuncioConAdjunto = async (formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/anuncios/con-adjunto`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Descargar adjunto de anuncio
export const descargarAdjuntoAnuncio = async (anuncioId, adjuntoId) => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/${anuncioId}/adjuntos/${adjuntoId}`,
      {
        headers: getAuthHeader(),
        responseType: 'blob',
      }
    );
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `adjunto_${adjuntoId}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== PROGRAMACIÓN ====================

// Programar anuncio para publicación futura
export const programarAnuncio = async (anuncioData) => {
  try {
    const response = await axios.post(
      `${API_URL}/anuncios/programado`,
      anuncioData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Obtener anuncios programados
export const obtenerAnunciosProgramados = async (cursoId) => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/curso/${cursoId}/programados`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cancelar anuncio programado
export const cancelarAnuncioProgramado = async (anuncioId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/anuncios/${anuncioId}/cancelar`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== ESTADÍSTICAS ====================

// Obtener estadísticas de lectura de un anuncio
export const obtenerEstadisticasAnuncio = async (anuncioId) => {
  try {
    const response = await axios.get(
      `${API_URL}/anuncios/${anuncioId}/estadisticas`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  // CRUD básico
  obtenerAnunciosPorCurso,
  obtenerAnuncioPorId,
  crearAnuncio,
  actualizarAnuncio,
  eliminarAnuncio,
  // Globales
  obtenerAnunciosGlobales,
  crearAnuncioGlobal,
  // Estado
  marcarAnuncioLeido,
  obtenerAnunciosNoLeidos,
  obtenerCantidadNoLeidos,
  // Filtros
  obtenerAnunciosPorPrioridad,
  obtenerAnunciosRecientes,
  buscarAnuncios,
  // Fijar
  toggleFijarAnuncio,
  obtenerAnunciosFijados,
  // Adjuntos
  crearAnuncioConAdjunto,
  descargarAdjuntoAnuncio,
  // Programación
  programarAnuncio,
  obtenerAnunciosProgramados,
  cancelarAnuncioProgramado,
  // Estadísticas
  obtenerEstadisticasAnuncio,
};