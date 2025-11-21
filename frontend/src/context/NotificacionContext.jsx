// frontend/src/context/NotificacionContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import { obtenerNotificaciones, obtenerNoLeidas } from "../services/notificacionService";

export const NotificacionContext = createContext();

export const NotificacionProvider = ({ children }) => {
  // ✅ CORREGIDO: Validar que AuthContext esté disponible
  const authContext = useContext(AuthContext);
  
  // Si AuthContext no está disponible, mostrar error claro
  if (!authContext) {
    throw new Error(
      "NotificacionProvider debe estar dentro de AuthProvider. " +
      "Verifica que <AuthProvider> envuelva a <NotificacionProvider> en App.jsx"
    );
  }

  const { usuario, accessToken } = authContext;
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);

  // ✅ Obtener URL correcta (VITE usa import.meta.env)
  const getSocketURL = () => {
    return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  };

  // Conectar socket cuando hay usuario
  useEffect(() => {
    // Solo intentar conectar si hay usuario Y token
    if (!usuario || !accessToken) {
      // Limpiar socket si existe
      if (socket) {
        console.log("🔌 Cerrando socket (sin usuario/token)...");
        socket.close();
        setSocket(null);
        setConectado(false);
      }
      return;
    }

    console.log("🔌 Intentando conectar Socket.IO...");
    
    const socketURL = getSocketURL();
    console.log("📡 Socket URL:", socketURL);

    let newSocket;
    
    try {
      newSocket = io(socketURL, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // ✅ Eventos de conexión
      newSocket.on("connect", () => {
        console.log("✅ Socket conectado:", newSocket.id);
        setConectado(true);
        newSocket.emit("join", usuario._id);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Socket desconectado:", reason);
        setConectado(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Error de conexión Socket:", error.message);
        setConectado(false);
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log("🔄 Socket reconectado después de", attemptNumber, "intentos");
        setConectado(true);
        // Re-join al reconectar
        newSocket.emit("join", usuario._id);
      });

      // ✅ Escuchar nuevas notificaciones
      newSocket.on("nueva-notificacion", (notificacion) => {
        console.log("🔔 Nueva notificación recibida:", notificacion);
        
        setNotificaciones((prev) => [notificacion, ...prev]);
        setNoLeidas((prev) => prev + 1);
        
        // Mostrar toast con icono según tipo
        const emoji = {
          examen: "📝",
          tarea: "📚",
          mensaje: "💬",
          curso: "🎓",
          alerta: "⚠️",
        }[notificacion.tipo] || "🔔";

        toast.info(`${emoji} ${notificacion.titulo}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      });

      // ✅ Escuchar mensajes nuevos
      newSocket.on("nuevo-mensaje", (mensaje) => {
        console.log("💬 Nuevo mensaje recibido:", mensaje);
        
        const nombreRemitente = mensaje.remitente?.nombre || "Alguien";
        toast.info(`💬 Nuevo mensaje de ${nombreRemitente}`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Actualizar contador de no leídas
        cargarNoLeidas();
      });

      setSocket(newSocket);

    } catch (error) {
      console.error("❌ Error al crear socket:", error);
      setConectado(false);
    }

    // ✅ Cleanup al desmontar
    return () => {
      if (newSocket) {
        console.log("🔌 Desconectando socket...");
        newSocket.close();
      }
    };
  }, [usuario?._id, accessToken]); // ✅ CORREGIDO: Dependencias específicas

  // ✅ CORREGIDO: Funciones con useCallback para evitar recreación
  const cargarNotificaciones = async () => {
    if (!accessToken) return;
    
    try {
      const data = await obtenerNotificaciones({ limit: 20 });
      setNotificaciones(data.notificaciones || data);
    } catch (err) {
      console.error("❌ Error al cargar notificaciones:", err);
      // No mostrar toast para evitar spam
    }
  };

  const cargarNoLeidas = async () => {
    if (!accessToken) return;
    
    try {
      const data = await obtenerNoLeidas();
      setNoLeidas(data.cantidad || data.count || 0);
    } catch (err) {
      console.error("❌ Error al cargar no leídas:", err);
      // No mostrar toast para evitar spam
    }
  };

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (!usuario || !accessToken) return;

    // Cargar datos iniciales
    cargarNotificaciones();
    cargarNoLeidas();
    
    // ✅ Actualizar cada 2 minutos como backup
    const interval = setInterval(() => {
      cargarNoLeidas();
    }, 120000);

    return () => clearInterval(interval);
  }, [usuario?._id, accessToken]); // ✅ CORREGIDO: Incluir accessToken

  // ✅ Método para emitir eventos personalizados
  const emitirEvento = (evento, data) => {
    if (socket && conectado) {
      socket.emit(evento, data);
    } else {
      console.warn("⚠️ Socket no conectado, no se puede emitir:", evento);
    }
  };

  return (
    <NotificacionContext.Provider
      value={{
        notificaciones,
        noLeidas,
        conectado,
        socket,
        cargarNotificaciones,
        cargarNoLeidas,
        emitirEvento,
      }}
    >
      {children}
    </NotificacionContext.Provider>
  );
};