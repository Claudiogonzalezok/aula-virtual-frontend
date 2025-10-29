// src/pages/ReporteCurso.js
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import ReporteNotas from "../components/ReporteNotas";

const ReporteCurso = () => {
  const { cursoId } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchNotas = async () => {
      const { data: examenes } = await API.get(`/examenes/curso/${cursoId}`);
      const reporte = [];

      for (let examen of examenes) {
        const { data: notasExamen } = await API.get(`/examenes/notas/${examen._id}`);
        if (notasExamen.length === 0) continue;

        const promedio = notasExamen.reduce((acc, n) => acc + n.puntaje / n.total * 100, 0) / notasExamen.length;
        reporte.push({ examen: examen.titulo, promedio: parseFloat(promedio.toFixed(2)) });
      }

      setData(reporte);
    };

    fetchNotas();
  }, [cursoId]);

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Reporte de notas - Curso</h2>
      {data.length === 0 ? <p>No hay notas disponibles</p> : <ReporteNotas data={data} />}
    </div>
  );
};

export default ReporteCurso;
