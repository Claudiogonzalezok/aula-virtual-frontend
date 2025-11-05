// src/components/ListaMateriales.js
import { useEffect, useState } from "react";
import API from "../services/api";

const ListaMateriales = ({ cursoId }) => {
  const [materiales, setMateriales] = useState([]);

  const fetchMateriales = async () => {
    const { data } = await API.get(`/materiales/${cursoId}`);
    setMateriales(data);
  };

  useEffect(() => { fetchMateriales(); }, [cursoId]);

  return (
    <div>
      <h3 className="font-bold mb-2">Materiales del curso</h3>
      <ul className="list-disc pl-5">
        {materiales.map((m) => (
          <li key={m._id}>
            <a
              href={`http://localhost:5000/uploads/${m.archivo}`}
              target="_blank"
              className="text-blue-600"
            >
              {m.nombre}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaMateriales;
