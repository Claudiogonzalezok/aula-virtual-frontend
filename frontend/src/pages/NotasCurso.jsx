// src/pages/NotasCurso.js
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const NotasCurso = () => {
  const { cursoId } = useParams();
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    const fetchNotas = async () => {
      const { data } = await API.get(`/examenes/curso/${cursoId}`);
      // Filtramos y extraemos notas de todos los alumnos
      const todasNotas = [];
      for (let examen of data) {
        const { data: notasExamen } = await API.get(`/examenes/notas/${examen._id}`);
        notasExamen.forEach(n => todasNotas.push({ ...n, examen }));
      }
      setNotas(todasNotas);
    };
    fetchNotas();
  }, [cursoId]);

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Notas del curso</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Alumno</th>
            <th className="border px-2 py-1">Examen</th>
            <th className="border px-2 py-1">Puntaje</th>
            <th className="border px-2 py-1">Total</th>
            <th className="border px-2 py-1">Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          {notas.map((n) => (
            <tr key={n._id}>
              <td className="border px-2 py-1">{n.alumno.nombre}</td>
              <td className="border px-2 py-1">{n.examen.titulo}</td>
              <td className="border px-2 py-1">{n.puntaje}</td>
              <td className="border px-2 py-1">{n.total}</td>
              <td className="border px-2 py-1">{((n.puntaje/n.total)*100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotasCurso;
