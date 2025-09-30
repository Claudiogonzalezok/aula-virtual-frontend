// src/pages/Cursos.js
import { useState, useEffect } from "react";
import API from "../services/api";

const Cursos = () => {
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    const fetchCursos = async () => {
      const { data } = await API.get("/cursos");
      setCursos(data);
    };
    fetchCursos();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Cursos disponibles</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cursos.map((c) => (
          <li key={c._id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{c.titulo}</h3>
            <p>{c.descripcion}</p>
            <p><strong>Docente:</strong> {c.docente.nombre}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cursos;
