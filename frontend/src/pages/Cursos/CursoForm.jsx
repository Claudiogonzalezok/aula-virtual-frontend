import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const CursoForm = () => {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    codigo: "",
    fechaInicio: "",
    fechaFin: "",
    duracionHoras: "",
    categoria: "General",
    imagen: "",
    estado: "activo",
    docente: "",
  });

  const [loading, setLoading] = useState(false);
  const [docentes, setDocentes] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  // Cargar docentes para el selector
  const cargarDocentes = async () => {
    try {
      const { data } = await API.get("/usuarios");
      const todosDocentes = (data.usuarios || data).filter(u => u.rol === "docente");
      setDocentes(todosDocentes);
    } catch (error) {
      console.error("Error al cargar docentes:", error);
    }
  };

  // Obtener usuario actual
  useEffect(() => {
    const usuarioLS = JSON.parse(localStorage.getItem('usuario'));
    setUsuario(usuarioLS);
    
    // Solo el admin puede crear cursos y asignar docentes
    if (usuarioLS?.rol === 'admin') {
      cargarDocentes();
    }
  }, []);

  // Cargar curso si es edición
  const cargarCurso = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/cursos/${id}`);
      
      // Verificar permisos: solo admin o el docente asignado puede editar
      const usuarioLS = JSON.parse(localStorage.getItem('usuario'));
      if (usuarioLS.rol !== 'admin' && data.docente._id !== usuarioLS.id) {
        alert("No tienes permiso para editar este curso");
        navigate("/dashboard/cursos");
        return;
      }
      
      setForm({
        titulo: data.titulo || "",
        descripcion: data.descripcion || "",
        codigo: data.codigo || "",
        fechaInicio: data.fechaInicio?.split("T")[0] || "",
        fechaFin: data.fechaFin?.split("T")[0] || "",
        duracionHoras: data.duracionHoras || "",
        categoria: data.categoria || "General",
        imagen: data.imagen || "",
        estado: data.estado || "activo",
        docente: data.docente._id || "",
      });
    } catch (error) {
      console.error("Error al cargar curso:", error);
      alert("Error al cargar el curso");
      navigate("/dashboard/cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (esEdicion) {
      cargarCurso();
    }
  }, [id]);

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (new Date(form.fechaInicio) > new Date(form.fechaFin)) {
      alert("La fecha de inicio no puede ser posterior a la fecha de fin");
      return;
    }

    // Validar que se haya seleccionado un docente
    if (usuario?.rol === 'admin' && !form.docente) {
      alert("Debes seleccionar un docente para el curso");
      return;
    }

    try {
      if (esEdicion) {
        await API.put(`/cursos/${id}`, form);
        navigate("/dashboard/cursos", {
          state: { mensaje: "Curso actualizado correctamente", tipo: "success" },
        });
      } else {
        await API.post("/cursos", form);
        navigate("/dashboard/cursos", {
          state: { mensaje: "Curso creado correctamente", tipo: "success" },
        });
      }
    } catch (error) {
      console.error("Error al guardar curso:", error.response?.data || error.message);
      alert(
        error.response?.data?.msg ||
          "Error al guardar el curso. Revisá los datos."
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">{esEdicion ? "Editar Curso" : "Nuevo Curso"}</h2>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={8}>
            <Form.Group className="mb-3">
              <Form.Label>Título del Curso *</Form.Label>
              <Form.Control
                name="titulo"
                value={form.titulo}
                onChange={handleInputChange}
                placeholder="Ej: Introducción a JavaScript"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="descripcion"
                value={form.descripcion}
                onChange={handleInputChange}
                placeholder="Describe el contenido del curso..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Código del Curso *</Form.Label>
                  <Form.Control
                    name="codigo"
                    value={form.codigo}
                    onChange={handleInputChange}
                    placeholder="Ej: JS101"
                    disabled={esEdicion}
                    required
                  />
                  {esEdicion && (
                    <Form.Text className="text-muted">
                      El código no puede modificarse
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Control
                    name="categoria"
                    value={form.categoria}
                    onChange={handleInputChange}
                    placeholder="Ej: Programación, Diseño, Marketing..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Inicio *</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaInicio"
                    value={form.fechaInicio}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Fin *</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaFin"
                    value={form.fechaFin}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Duración (horas)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duracionHoras"
                    value={form.duracionHoras}
                    onChange={handleInputChange}
                    placeholder="40"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>URL de Imagen</Form.Label>
              <Form.Control
                type="url"
                name="imagen"
                value={form.imagen}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </Form.Group>

            {/* Solo admin puede asignar docente */}
            {usuario?.rol === 'admin' && (
              <Form.Group className="mb-3">
                <Form.Label>Docente Asignado *</Form.Label>
                <Form.Select
                  name="docente"
                  value={form.docente}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar docente...</option>
                  {docentes.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      {doc.nombre} - {doc.email}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  El docente asignado podrá gestionar las clases y alumnos de este curso
                </Form.Text>
              </Form.Group>
            )}
          </Col>

          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="estado"
                value={form.estado}
                onChange={handleInputChange}
                required
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="finalizado">Finalizado</option>
              </Form.Select>
            </Form.Group>

            {form.imagen && (
              <div className="mb-3">
                <Form.Label>Vista previa</Form.Label>
                <img
                  src={form.imagen}
                  alt="Preview"
                  className="img-fluid rounded"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=Imagen+no+disponible";
                  }}
                />
              </div>
            )}
          </Col>
        </Row>

        <div className="d-flex gap-2 mt-4">
          <Button type="submit" variant="success">
            {esEdicion ? "💾 Actualizar Curso" : "➕ Crear Curso"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/dashboard/cursos")}
          >
            Cancelar
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CursoForm;