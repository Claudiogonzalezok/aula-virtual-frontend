// src/pages/Inscripciones.js
import { useEffect, useState } from "react";
import API from "../services/api";

const Inscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);

  const fetchInscripciones = async () => {
    const { data } = await API.get("/inscripciones"); // Necesitamos endpoint GET
    setInscripciones(data);
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  const gestionar = async (id, estado) => {
    try {
      await API.put(`/inscripciones/${id}`, { estado });
      alert(`Inscripción ${estado}`);
      fetchInscripciones();
    } catch (error) {
      alert(error.response?.data?.msg || "Error al actualizar inscripción");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Gestión de inscripciones</h2>
      <ul className="space-y-4">
        {inscripciones.map((i) => (
          <li key={i._id} className="border p-4 rounded shadow">
            <p><strong>Alumno:</strong> {i.alumno.nombre}</p>
            <p><strong>Curso:</strong> {i.curso.titulo}</p>
            <p><strong>Estado:</strong> {i.estado}</p>
            {i.estado === "pendiente" && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => gestionar(i._id, "aprobada")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => gestionar(i._id, "rechazada")}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Rechazar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inscripciones;
