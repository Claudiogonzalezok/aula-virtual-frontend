import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // 🔹 Cambiá si tu backend está en otro dominio

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    socket.on("nuevaNotificacion", (data) => {
      console.log("📢 Nueva notificación:", data);
      setNotificaciones((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("nuevaNotificacion");
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notificaciones.map((n, i) => (
        <div
          key={i}
          className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow-lg animate-fade-in"
        >
          <strong>{n.titulo || "Notificación"}</strong>
          <p>{n.mensaje}</p>
        </div>
      ))}
    </div>
  );
};

export default Notificaciones;
