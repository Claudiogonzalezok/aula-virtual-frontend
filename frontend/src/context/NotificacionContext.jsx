// frontend/src/context/NotificacionContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import { obtenerNotificaciones, obtenerNoLeidas } from "../services/notificacionService";

export const NotificacionContext = createContext();

export const NotificacionProvider = ({ children }) => {
  const { usuario, accessToken } = useContext(AuthContext);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [socket, setSocket] = useState(null);

  // Conectar socket cuando hay usuario
  useEffect(() => {
    if (usuario && accessToken) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        auth: { token: accessToken },
      });

      newSocket.on("connect", () => {
        console.log("🔌 Socket conectado");
        newSocket.emit("join", usuario._id);
      });

      newSocket.on("nueva-notificacion", (notificacion) => {
        setNotificaciones((prev) => [notificacion, ...prev]);
        setNoLeidas((prev) => prev + 1);
        
        // Mostrar toast
        toast.info(notificacion.mensaje, {
          position: "top-right",
          autoClose: 5000,
        });
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [usuario, accessToken]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (usuario) {
      cargarNotificaciones();
      cargarNoLeidas();
    }
  }, [usuario]);

  const cargarNotificaciones = async () => {
    try {
      const data = await obtenerNotificaciones({ limit: 20 });
      setNotificaciones(data.notificaciones);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
    }
  };

  const cargarNoLeidas = async () => {
    try {
      const data = await obtenerNoLeidas();
      setNoLeidas(data.cantidad);
    } catch (err) {
      console.error("Error al cargar no leídas:", err);
    }
  };

  return (
    <NotificacionContext.Provider
      value={{
        notificaciones,
        noLeidas,
        cargarNotificaciones,
        cargarNoLeidas,
      }}
    >
      {children}
    </NotificacionContext.Provider>
  );
};