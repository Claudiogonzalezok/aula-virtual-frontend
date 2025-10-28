// src/pages/CrearExamen.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

const CrearExamen = () => {
  const { cursoId } = useParams(); // ✅ obtengo el ID desde la URL
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [preguntas, setPreguntas] = useState([
    { pregunta: "", opciones: ["", "", ""], respuestaCorrecta: 0 },
  ]);
  const navigate = useNavigate();

  const agregarPregunta = () =>
    setPreguntas([
      ...preguntas,
      { pregunta: "", opciones: ["", "", ""], respuestaCorrecta: 0 },
    ]);

  const handleChangePregunta = (index, field, value) => {
    const newPreguntas = [...preguntas];
    if (field === "pregunta") newPreguntas[index].pregunta = value;
    else if (field.startsWith("opcion")) {
      const opIndex = parseInt(field.slice(-1));
      newPreguntas[index].opciones[opIndex] = value;
    } else if (field === "respuesta")
      newPreguntas[index].respuestaCorrecta = parseInt(value);
    setPreguntas(newPreguntas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔍 Validación simple
    const preguntasValidas = preguntas.filter(
      (p) => p.pregunta.trim() !== "" && p.opciones.some((o) => o.trim() !== "")
    );

    if (preguntasValidas.length === 0) {
      alert("Debe agregar al menos una pregunta válida");
      return;
    }

    try {
      await API.post("/examenes", {
        titulo,
        descripcion,
        curso: cursoId, // ✅ ahora tiene valor real
        preguntas: preguntasValidas,
      });

      alert("Examen creado correctamente ✅");
      navigate(`/cursos/${cursoId}/examenes`);
    } catch (err) {
      console.error(err);
      alert("Error al crear examen ❌");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl mb-4">Crear Examen</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="border p-2"
          required
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="border p-2"
        />
        {preguntas.map((p, i) => (
          <div key={i} className="border p-2 rounded">
            <input
              type="text"
              placeholder={`Pregunta ${i + 1}`}
              value={p.pregunta}
              onChange={(e) =>
                handleChangePregunta(i, "pregunta", e.target.value)
              }
              className="border p-1 w-full mb-1"
            />
            {p.opciones.map((op, j) => (
              <input
                key={j}
                type="text"
                placeholder={`Opción ${j + 1}`}
                value={op}
                onChange={(e) =>
                  handleChangePregunta(i, `opcion${j}`, e.target.value)
                }
                className="border p-1 w-full mb-1"
              />
            ))}
            <input
              type="number"
              min={0}
              max={p.opciones.length - 1}
              value={p.respuestaCorrecta}
              onChange={(e) =>
                handleChangePregunta(i, "respuesta", e.target.value)
              }
              className="border p-1 w-full"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={agregarPregunta}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Agregar pregunta
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white px-3 py-2 rounded"
        >
          Crear Examen
        </button>
      </form>
    </div>
  );
};

export default CrearExamen;

