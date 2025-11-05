import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Table,
  Badge,
  InputGroup,
  FormControl,
  Spinner,
  Alert,
} from "react-bootstrap";
import { BsSearch, BsPersonPlus, BsPersonDash } from "react-icons/bs";
import API from "../../services/api";

const GestionInscripciones = ({ show, onHide, curso, onActualizar }) => {
  const [alumnos, setAlumnos] = useState([]);
  const [alumnosInscritos, setAlumnosInscritos] = useState([]);
  const [alumnosFiltrados, setAlumnosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ show: false, texto: "", tipo: "" });

  useEffect(() => {
    if (show && curso) {
      cargarAlumnos();
      setAlumnosInscritos(curso.alumnos || []);
    }
  }, [show, curso]);

  useEffect(() => {
    filtrarAlumnos();
  }, [busqueda, alumnos, alumnosInscritos]);

  const cargarAlumnos = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/usuarios");
      const todosLosAlumnos = (data.usuarios || data).filter(
        (u) => u.rol === "alumno"
      );
      setAlumnos(todosLosAlumnos);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
      mostrarMensaje("Error al cargar alumnos", "danger");
    } finally {
      setLoading(false);
    }
  };

  const filtrarAlumnos = () => {
    if (!busqueda.trim()) {
      setAlumnosFiltrados(alumnos);
      return;
    }

    const termino = busqueda.toLowerCase();
    const filtrados = alumnos.filter(
      (alumno) =>
        alumno.nombre?.toLowerCase().includes(termino) ||
        alumno.email?.toLowerCase().includes(termino)
    );
    setAlumnosFiltrados(filtrados);
  };

  const estaInscrito = (alumnoId) => {
    return alumnosInscritos.some((a) => a._id === alumnoId);
  };

  const inscribirAlumno = async (alumnoId) => {
    try {
      const { data } = await API.post(`/cursos/${curso._id}/inscribir`, {
        alumnoId,
      });

      setAlumnosInscritos(data.curso.alumnos);
      mostrarMensaje("Alumno inscrito exitosamente", "success");
      if (onActualizar) onActualizar();
    } catch (error) {
      console.error("Error al inscribir alumno:", error);
      mostrarMensaje(
        error.response?.data?.msg || "Error al inscribir alumno",
        "danger"
      );
    }
  };

  const desinscribirAlumno = async (alumnoId) => {
    if (!window.confirm("¿Seguro que deseas desinscribir este alumno?")) return;

    try {
      const { data } = await API.post(`/cursos/${curso._id}/desinscribir`, {
        alumnoId,
      });

      setAlumnosInscritos(data.curso.alumnos);
      mostrarMensaje("Alumno desinscrito exitosamente", "success");
      if (onActualizar) onActualizar();
    } catch (error) {
      console.error("Error al desinscribir alumno:", error);
      mostrarMensaje(
        error.response?.data?.msg || "Error al desinscribir alumno",
        "danger"
      );
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ show: true, texto, tipo });
    setTimeout(() => setMensaje({ show: false, texto: "", tipo: "" }), 3000);
  };

  const alumnosNoInscritos = alumnosFiltrados.filter(
    (alumno) => !estaInscrito(alumno._id)
  );
  const alumnosInscritosFiltrados = alumnosFiltrados.filter((alumno) =>
    estaInscrito(alumno._id)
  );

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Gestión de Inscripciones - {curso?.titulo}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mensaje.show && (
          <Alert
            variant={mensaje.tipo}
            dismissible
            onClose={() => setMensaje({ ...mensaje, show: false })}
          >
            {mensaje.texto}
          </Alert>
        )}

        {/* Buscador */}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <BsSearch />
          </InputGroup.Text>
          <FormControl
            placeholder="Buscar alumno por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </InputGroup>

        {/* Estadísticas */}
        <div className="d-flex gap-3 mb-3">
          <Badge bg="success" className="p-2">
            Inscritos: {alumnosInscritos.length}
          </Badge>
          <Badge bg="secondary" className="p-2">
            Disponibles: {alumnosNoInscritos.length}
          </Badge>
          <Badge bg="primary" className="p-2">
            Total alumnos: {alumnos.length}
          </Badge>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            {/* Alumnos Inscritos */}
            {alumnosInscritosFiltrados.length > 0 && (
              <div className="mb-4">
                <h6 className="text-success mb-3">
                  ✅ Alumnos Inscritos ({alumnosInscritosFiltrados.length})
                </h6>
                <Table striped bordered hover size="sm">
                  <thead className="table-success">
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th style={{ width: "100px" }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnosInscritosFiltrados.map((alumno) => (
                      <tr key={alumno._id}>
                        <td>{alumno.nombre}</td>
                        <td>{alumno.email}</td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => desinscribirAlumno(alumno._id)}
                            title="Desinscribir"
                          >
                            <BsPersonDash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Alumnos No Inscritos */}
            {alumnosNoInscritos.length > 0 ? (
              <div>
                <h6 className="text-secondary mb-3">
                  📋 Alumnos Disponibles ({alumnosNoInscritos.length})
                </h6>
                <Table striped bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th style={{ width: "100px" }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnosNoInscritos.map((alumno) => (
                      <tr key={alumno._id}>
                        <td>{alumno.nombre}</td>
                        <td>{alumno.email}</td>
                        <td className="text-center">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => inscribirAlumno(alumno._id)}
                            title="Inscribir"
                          >
                            <BsPersonPlus />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <Alert variant="info" className="text-center">
                {busqueda
                  ? "No se encontraron alumnos disponibles con ese criterio"
                  : "Todos los alumnos ya están inscritos en este curso"}
              </Alert>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GestionInscripciones;