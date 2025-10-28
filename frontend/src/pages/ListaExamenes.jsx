// src/pages/ListaExamenes.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const ListaExamenes = () => {
  const { cursoId } = useParams();
  const [examenes, setExamenes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamenes = async () => {
      try {
        const { data } = await API.get(`/examenes/curso/${cursoId}`);
        setExamenes(data);
      } catch (error) {
        console.error(error);
        alert("Error al cargar exámenes");
      }
    };
    fetchExamenes();
  }, [cursoId]);

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Exámenes del curso</h2>
      <button
        onClick={() => navigate(`/cursos/${cursoId}/examenes/nuevo`)}
        className="bg-green-500 text-white px-3 py-1 rounded mb-4"
      >
        Crear nuevo examen
      </button>

      {examenes.length === 0 ? (
        <p>No hay exámenes cargados.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examenes.map((ex) => (
            <li key={ex._id} className="border p-4 rounded shadow">
              <h3 className="font-bold">{ex.titulo}</h3>
              <p>{ex.descripcion}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListaExamenes;
