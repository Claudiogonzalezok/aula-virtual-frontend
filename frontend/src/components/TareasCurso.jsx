// src/components/TareasCurso.js
import { useEffect, useState } from "react";
import API from "../services/api";

const TareasCurso = ({ cursoId }) => {
  const [tareas, setTareas] = useState([]);

  const fetchTareas = async () => {
    const { data } = await API.get(`/tareas/${cursoId}`);
    setTareas(data);
  };

  useEffect(() => { fetchTareas(); }, [cursoId]);

  return (
    <div>
      <h3 className="font-bold mb-2">Tareas</h3>
      <ul className="list-disc pl-5 space-y-1">
        {tareas.map((t) => (
          <li key={t._id}>
            <strong>{t.titulo}</strong> - Entrega: {new Date(t.fechaEntrega).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TareasCurso;
