// src/pages/RendirExamen.js
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const RendirExamen = () => {
  const { examenId } = useParams();
  const { usuario } = useContext(AuthContext);
  const [examen, setExamen] = useState(null);
  const [respuestas, setRespuestas] = useState([]);

  useEffect(() => {
    const fetchExamen = async () => {
      const { data } = await API.get(`/examenes/curso/${examenId}`);
      const exam = data.find(e => e._id === examenId);
      setExamen(exam);
      setRespuestas(Array(exam.preguntas.length).fill(null));
    };
    fetchExamen();
  }, [examenId]);

  const handleChange = (index, value) => {
    const newRespuestas = [...respuestas];
    newRespuestas[index] = parseInt(value);
    setRespuestas(newRespuestas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Calcular puntaje
    let puntaje = 0;
    examen.preguntas.forEach((p, i) => {
      if(respuestas[i] === p.respuestaCorrecta) puntaje++;
    });
    const total = examen.preguntas.length;

    // Guardar nota
    await API.post("/examenes/notas", {
      alumno: usuario._id,
      examenId: examen._id,
      puntaje,
      total
    });

    alert(`Examen completado. Puntaje: ${puntaje} / ${total}`);
  };

  if(!examen) return <p>Cargando examen...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl mb-4">{examen.titulo}</h2>
      <p className="mb-4">{examen.descripcion}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {examen.preguntas.map((p, i) => (
          <div key={i} className="border p-2 rounded">
            <p className="font-bold">{p.pregunta}</p>
            {p.opciones.map((op, j) => (
              <label key={j} className="block">
                <input
                  type="radio"
                  name={`pregunta-${i}`}
                  value={j}
                  checked={respuestas[i] === j}
                  onChange={() => handleChange(i, j)}
                  className="mr-2"
                />
                {op}
              </label>
            ))}
          </div>
        ))}
        <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded">
          Enviar examen
        </button>
      </form>
    </div>
  );
};

export default RendirExamen;
