// src/components/EntregarTarea.js
import { useState } from "react";
import API from "../services/api";

const EntregarTarea = ({ tareaId, onEntregado }) => {
  const [archivo, setArchivo] = useState(null);
  const [texto, setTexto] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (archivo) formData.append("archivo", archivo);
    formData.append("texto", texto);

    await API.post(`/tareas/${tareaId}/entregar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setArchivo(null);
    setTexto("");
    onEntregado();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
      <textarea
        placeholder="Escribe tu entrega..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="border p-2 rounded"
      />
      <input type="file" onChange={(e) => setArchivo(e.target.files[0])} className="border p-2 rounded" />
      <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded">
        Entregar
      </button>
    </form>
  );
};

export default EntregarTarea;
