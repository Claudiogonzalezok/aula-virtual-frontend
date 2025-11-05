// src/pages/Cursos.js
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Cursos = () => {
  const { usuario } = useContext(AuthContext);
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    const fetchCursos = async () => {
      const { data } = await API.get("/cursos");
      setCursos(data);
    };
    fetchCursos();
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-4">Cursos</h2>
      <ul className="space-y-2">
        {cursos.map((c) => (
          <li key={c._id} className="border p-3 rounded bg-white shadow flex justify-between items-center">
            <span>{c.titulo}</span>
            <div className="flex gap-2 flex-wrap">
              <Link to={`/cursos/${c._id}/clases`} className="bg-blue-500 text-white px-3 py-1 rounded">Clases</Link>
              <Link to={`/cursos/${c._id}/examenes`} className="bg-green-500 text-white px-3 py-1 rounded">Exámenes</Link>
              <Link to={`/curso/${c._id}/chat`} className="bg-purple-500 text-white px-3 py-1 rounded">Chat</Link>
              <Link to={`/cursos/${c._id}/tareas`} className="bg-indigo-500 text-white px-3 py-1 rounded">Tareas</Link>
              {usuario?.rol !== "alumno" && (
                <Link to={`/reporte-curso/${c._id}`} className="bg-yellow-500 text-white px-3 py-1 rounded">Reporte</Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cursos;


