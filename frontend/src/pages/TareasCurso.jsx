// src/pages/TareasCurso.js
import TareasCurso from "../components/TareasCurso";
import EntregarTarea from "../components/EntregarTarea";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const TareasPage = ({ cursoId }) => {
  const { usuario } = useContext(AuthContext);
  const [refresh, setRefresh] = useState(false);

  return (
    <div>
      {usuario.rol === "alumno" && <EntregarTarea tareaId={null} onEntregado={() => setRefresh(!refresh)} />}
      <TareasCurso cursoId={cursoId} key={refresh} />
    </div>
  );
};

export default TareasPage;
