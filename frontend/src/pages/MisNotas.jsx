// src/pages/MisNotas.js
import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const MisNotas = () => {
  const { usuario } = useContext(AuthContext);
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    const fetchNotas = async () => {
      const { data } = await API.get(`/examenes/notas/${usuario._id}`);
      setNotas(data);
    };
    fetchNotas();
  }, [usuario._id]);

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Mis notas</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Curso</th>
            <th className="border px-2 py-1">Examen</th>
            <th className="border px-2 py-1">Puntaje</th>
            <th className="border px-2 py-1">Total</th>
            <th className="border px-2 py-1">Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          {notas.map((n) => (
            <tr key={n._id}>
              <td className="border px-2 py-1">{n.examen.curso.titulo}</td>
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

export default MisNotas;
