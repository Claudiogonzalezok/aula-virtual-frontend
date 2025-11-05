// src/components/SubirMaterial.js
import { useState } from "react";
import API from "../services/api";

const SubirMaterial = ({ cursoId, onSubido }) => {
  const [archivo, setArchivo] = useState(null);
  const [nombre, setNombre] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return;

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombre", nombre);

    await API.post(`/materiales/${cursoId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setArchivo(null);
    setNombre("");
    onSubido();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
      <input
        type="text"
        placeholder="Nombre del material"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="file"
        onChange={(e) => setArchivo(e.target.files[0])}
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded">
        Subir material
      </button>
    </form>
  );
};

export default SubirMaterial;

