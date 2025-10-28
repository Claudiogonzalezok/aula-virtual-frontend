// src/pages/Cursos.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Cursos = () => {
  const [cursos, setCursos] = useState([]);
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  // Cargar cursos desde backend
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const { data } = await API.get("/cursos");
        setCursos(data);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
      }
    };
    fetchCursos();
  }, []);

  // Inscribirse en un curso (solo alumnos)
  const inscribirse = async (cursoId) => {
    try {
      await API.post("/inscripciones", { curso: cursoId });
      alert("Solicitud de inscripción enviada ✅");
    } catch (error) {
      alert(error.response?.data?.msg || "Error al inscribirse ❌");
    }
  };

  // Ver clases de un curso
  const verClases = (cursoId) => {
    navigate(`/cursos/${cursoId}/clases`);
  };

  // Crear nueva clase
  const crearClase = (cursoId) => {
    navigate(`/cursos/${cursoId}/clases?crear=1`);
  };

  // Crear nuevo examen
  const crearExamen = (cursoId) => {
    navigate(`/cursos/${cursoId}/examenes/nuevo`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Cursos disponibles</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cursos.map((c) => (
          <li key={c._id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{c.titulo}</h3>
            <p>{c.descripcion}</p>
            <p>
              <strong>Docente:</strong> {c.docente.nombre}
            </p>

            {/* Opciones para alumnos */}
            {usuario?.rol === "alumno" && (
              <button
                onClick={() => inscribirse(c._id)}
                className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
              >
                Solicitar inscripción
              </button>
            )}

            {/* Opciones para docentes */}
            {usuario?.rol === "docente" && (
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => verClases(c._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Ver clases
                  </button>
                  <button
                    onClick={() => crearClase(c._id)}
                    className="bg-purple-500 text-white px-3 py-1 rounded"
                  >
                    Crear clase
                  </button>
                  <button
                    onClick={() => crearExamen(c._id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Crear examen
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cursos;



