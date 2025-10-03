// src/pages/CrearCurso.js
import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const CrearCurso = () => {
  const [form, setForm] = useState({ titulo: "", descripcion: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/cursos", form); // el docente se asigna en backend
      alert("Curso creado con éxito");
      navigate("/cursos");
    } catch (error) {
      alert(error.response?.data?.msg || "Error al crear curso");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Crear nuevo curso</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          name="titulo"
          placeholder="Título del curso"
          value={form.titulo}
          onChange={handleChange}
          className="border p-2"
          required
        />
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          className="border p-2"
        />
        <button className="bg-blue-500 text-white p-2 rounded">
          Crear curso
        </button>
      </form>
    </div>
  );
};

export default CrearCurso;