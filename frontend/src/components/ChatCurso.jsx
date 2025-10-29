// src/components/ChatCurso.js
import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // URL de tu backend

const ChatCurso = ({ cursoId }) => {
  const { usuario } = useContext(AuthContext);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const messagesEndRef = useRef();

  useEffect(() => {
    socket.emit("joinCourse", cursoId);

    socket.on("nuevoMensaje", (m) => {
      setMensajes((prev) => [...prev, m]);
    });

    return () => socket.off("nuevoMensaje");
  }, [cursoId]);

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    socket.emit("mensajeCurso", { cursoId, mensaje, usuario: usuario.nombre });
    setMensaje("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  return (
    <div className="border p-4 rounded max-w-md mx-auto flex flex-col h-96">
      <div className="flex-1 overflow-y-auto mb-2">
        {mensajes.map((m, i) => (
          <div key={i} className="mb-1">
            <strong>{m.usuario}</strong>: {m.mensaje} <span className="text-gray-400 text-xs">({new Date(m.fecha).toLocaleTimeString()})</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={enviarMensaje} className="flex gap-2">
        <input
          type="text"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-3 rounded">Enviar</button>
      </form>
    </div>
  );
};

export default ChatCurso;
