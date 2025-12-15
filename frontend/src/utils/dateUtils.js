// frontend/src/utils/dateUtils.js

/**
 * Utilidades para manejo de fechas
 * Resuelve el problema de zona horaria donde las fechas UTC
 * se muestran un día menos al convertir a hora local
 */

/**
 * Formatea una fecha ignorando la zona horaria (para fechas sin hora)
 * Evita el problema de que se reste un día por la conversión UTC
 */
export const formatearFecha = (fecha, opciones = {}) => {
  if (!fecha) return "";

  const fechaObj = new Date(fecha);
  const fechaAjustada = new Date(
    fechaObj.getTime() + fechaObj.getTimezoneOffset() * 60000
  );

  const opcionesPorDefecto = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  return fechaAjustada.toLocaleDateString("es-AR", {
    ...opcionesPorDefecto,
    ...opciones,
  });
};

/**
 * Formatea fecha con nombre del día y mes
 * Ej: "lunes, 15 de diciembre de 2024"
 */
export const formatearFechaLarga = (fecha) => {
  if (!fecha) return "";

  const fechaObj = new Date(fecha);
  const fechaAjustada = new Date(
    fechaObj.getTime() + fechaObj.getTimezoneOffset() * 60000
  );

  return fechaAjustada.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/**
 * Formatea fecha corta: "15/12/2024"
 */
export const formatearFechaCorta = (fecha) => {
  if (!fecha) return "";

  const fechaObj = new Date(fecha);
  const fechaAjustada = new Date(
    fechaObj.getTime() + fechaObj.getTimezoneOffset() * 60000
  );

  return fechaAjustada.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Obtiene un objeto Date ajustado para comparaciones de solo fecha
 * Útil para comparar fechas sin considerar la hora
 */
export const obtenerFechaAjustada = (fecha) => {
  if (!fecha) return new Date();

  const fechaObj = new Date(fecha);
  return new Date(
    fechaObj.getTime() + fechaObj.getTimezoneOffset() * 60000
  );
};

/**
 * Combina fecha + hora en un objeto Date correcto
 * Para clases y exámenes que tienen fecha y hora separados
 * IMPORTANTE: Esta función crea la fecha en hora LOCAL
 */
export const combinarFechaHora = (fecha, hora) => {
  if (!fecha || !hora) return new Date();

  // Extraer solo la parte de la fecha (YYYY-MM-DD)
  const fechaStr = fecha.split("T")[0];

  // Crear fecha en hora local (no UTC)
  const [year, month, day] = fechaStr.split("-").map(Number);
  const [hours, minutes] = hora.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

/**
 * Verifica si una fecha es hoy
 */
export const esHoy = (fecha) => {
  if (!fecha) return false;

  const hoy = new Date();
  const fechaAjustada = obtenerFechaAjustada(fecha);

  return (
    fechaAjustada.getDate() === hoy.getDate() &&
    fechaAjustada.getMonth() === hoy.getMonth() &&
    fechaAjustada.getFullYear() === hoy.getFullYear()
  );
};

/**
 * Formatea para input type="date" (YYYY-MM-DD)
 * Corrige el problema de zona horaria
 */
export const formatearParaInput = (fecha) => {
  if (!fecha) return "";

  const fechaObj = new Date(fecha);
  const fechaAjustada = new Date(
    fechaObj.getTime() + fechaObj.getTimezoneOffset() * 60000
  );

  const year = fechaAjustada.getFullYear();
  const month = String(fechaAjustada.getMonth() + 1).padStart(2, "0");
  const day = String(fechaAjustada.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Formatea fecha y hora para mostrar (ej: "15/12/2024 14:30")
 * Útil para exámenes que tienen fecha y hora de apertura/cierre
 * NOTA: Para datetime SÍ usamos la conversión normal porque
 * la hora es relevante y debe mostrarse en hora local
 */
export const formatearFechaHora = (fecha) => {
  if (!fecha) return "";

  return new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formatea para input type="datetime-local"
 */
export const formatearParaInputDateTime = (fecha) => {
  if (!fecha) return "";

  const fechaObj = new Date(fecha);

  const year = fechaObj.getFullYear();
  const month = String(fechaObj.getMonth() + 1).padStart(2, "0");
  const day = String(fechaObj.getDate()).padStart(2, "0");
  const hours = String(fechaObj.getHours()).padStart(2, "0");
  const minutes = String(fechaObj.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Verifica si una fecha ya pasó
 */
export const fechaPasada = (fecha) => {
  if (!fecha) return false;
  return new Date(fecha) < new Date();
};

/**
 * Verifica si una fecha está en el futuro
 */
export const fechaFutura = (fecha) => {
  if (!fecha) return false;
  return new Date(fecha) > new Date();
};

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const diasEntre = (fecha1, fecha2) => {
  const f1 = obtenerFechaAjustada(fecha1);
  const f2 = obtenerFechaAjustada(fecha2);
  const diffTime = Math.abs(f2 - f1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ============================================
// FUNCIONES PARA DATETIME (Exámenes)
// ============================================

/**
 * Convierte un valor de datetime-local a ISO string para enviar al backend
 * El input datetime-local devuelve "2024-12-15T10:00" sin timezone
 * Esta función lo convierte a ISO string con la timezone correcta
 */
export const datetimeLocalToISO = (datetimeLocal) => {
  if (!datetimeLocal) return "";
  
  // El datetime-local viene como "2024-12-15T10:00"
  // Creamos un Date en hora local y lo convertimos a ISO
  const fecha = new Date(datetimeLocal);
  return fecha.toISOString();
};

/**
 * Convierte una fecha ISO del backend a formato datetime-local para el input
 * Importante: convierte UTC a hora local para mostrar correctamente
 */
export const isoToDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  
  const fecha = new Date(isoString);
  
  // Formatear en hora local
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  const hours = String(fecha.getHours()).padStart(2, "0");
  const minutes = String(fecha.getMinutes()).padStart(2, "0");
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formatea una fecha ISO para mostrar con fecha y hora en formato argentino
 * Ej: "15/12/2024 10:00"
 */
export const formatearFechaHoraCompleta = (fecha) => {
  if (!fecha) return "";
  
  return new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Verifica si un examen está disponible (entre apertura y cierre)
 */
export const examenDisponible = (fechaApertura, fechaCierre, estado = "publicado") => {
  if (estado !== "publicado") return false;
  
  const ahora = new Date();
  const apertura = new Date(fechaApertura);
  const cierre = new Date(fechaCierre);
  
  return ahora >= apertura && ahora <= cierre;
};

/**
 * Obtiene el estado temporal de un examen
 * @returns "pendiente" | "disponible" | "cerrado"
 */
export const estadoTemporalExamen = (fechaApertura, fechaCierre) => {
  const ahora = new Date();
  const apertura = new Date(fechaApertura);
  const cierre = new Date(fechaCierre);
  
  if (ahora < apertura) return "pendiente";
  if (ahora > cierre) return "cerrado";
  return "disponible";
};