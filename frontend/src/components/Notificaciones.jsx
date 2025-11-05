// src/components/Notificaciones.js
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

const socket = io("http://localhost:5000"); // URL de tu backend

const Notificaciones = ({ cursoId }) => {
  const { usuario } = useContext(AuthContext);
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    socket.emit("joinCourse", cursoId);

    socket.on("notificacion", (n) => {
      setNotificaciones((prev) => [n, ...prev]);
    });

    return () => socket.off("notificacion");
  }, [cursoId]);

  return (
    <div className="p-2 border rounded max-w-md mx-auto mb-4">
      <h3 className="font-bold mb-2">Notificaciones</h3>
      {notificaciones.length === 0 ? (
        <p className="text-gray-500">No hay notificaciones</p>
      ) : (
        <ul>
          {notificaciones.map((n, i) => (
            <li key={i} className="border-b py-1">
              {n.tipo === "examen" ? (
                <Link to={`/examenes/${n.examenId}/rendir`} className="text-blue-600">
                  {n.mensaje}
                </Link>
              ) : (
                n.mensaje
              )}
              <span className="text-gray-400 text-xs ml-2">({new Date(n.fecha).toLocaleTimeString()})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notificaciones;

