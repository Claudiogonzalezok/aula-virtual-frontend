// src/pages/Examenes.js
import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Examenes = () => {
  const { cursoId } = useParams();
  const { usuario } = useContext(AuthContext);
  const [examenes, setExamenes] = useState([]);

  useEffect(() => {
    const fetchExamenes = async () => {
      const { data } = await API.get(`/examenes/curso/${cursoId}`);
      setExamenes(data);
    };
    fetchExamenes();
  }, [cursoId]);

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Exámenes</h2>
      <ul className="space-y-4">
        {examenes.map(e => (
          <li key={e._id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{e.titulo}</h3>
            <p>{e.descripcion}</p>
            {usuario?.rol === "alumno" && (
              <Link
                to={`/examenes/${e._id}/rendir`}
                className="bg-blue-500 text-white px-3 py-1 rounded mt-2 inline-block"
              >
                Rendir examen
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Examenes;
