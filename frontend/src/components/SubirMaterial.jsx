// src/components/SubirMaterial.js
import { useState } from "react";
import API from "../services/api";

const SubirMaterial = ({ claseId, onUpload }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    await API.post(`/clases/${claseId}/materiales`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setFile(null);
    onUpload();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="border p-1" />
      <button className="bg-blue-500 text-white px-3 py-1 rounded">Subir</button>
    </form>
  );
};

export default SubirMaterial;
