// src/pages/Clases.js// src/pages/Clases.js
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import SubirMaterial from "../components/SubirMaterial";

const Clases = () => {
  const { cursoId } = useParams();
  const { usuario } = useContext(AuthContext);
  const [clases, setClases] = useState([]);
  const [form, setForm] = useState({ titulo: "", descripcion: "" });

  const fetchClases = async () => {
    const { data } = await API.get(`/clases/${cursoId}`);
    setClases(data);
  };

  useEffect(() => {
    fetchClases();
  }, [cursoId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const crearClase = async (e) => {
    e.preventDefault();
    await API.post("/clases", { ...form, curso: cursoId });
    setForm({ titulo: "", descripcion: "" });
    fetchClases();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Clases del curso</h2>

      {(usuario?.rol === "docente" || usuario?.rol === "admin") && (
        
        <form onSubmit={crearClase} className="mb-6 flex flex-col gap-2 border p-4 rounded">
          <h3 className="font-bold">Crear nueva clase</h3>
          <input
            name="titulo"
            placeholder="Título"
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
          <button className="bg-green-500 text-white p-2 rounded">Guardar</button>
        </form>
      )}

      <ul className="space-y-4">
        {clases.map((clase) => (
          <li key={clase._id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{clase.titulo}</h3>
            <p>{clase.descripcion}</p>

            {(usuario?.rol === "docente" || usuario?.rol === "admin") && (
                <SubirMaterial claseId={clase._id} onUpload={fetchClases} />
            )}
            {clase.materiales.length > 0 && (
              <ul className="mt-2">
                {clase.materiales.map((m, i) => (
                  <li key={i}>
                    📄 <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      {m.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clases;

