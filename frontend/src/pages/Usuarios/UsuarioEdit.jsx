// src/pages/Usuarios/UsuarioEdit.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import API from "../../services/api";

const UsuarioEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const { data } = await API.get(`/usuarios/${id}`);
        setForm({
          nombre: data.nombre,
          email: data.email,
          rol: data.rol,
          password: "",
        });
      } catch (err) {
        console.error("Error al cargar usuario:", err);
        setError("No se pudo cargar la información del usuario.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/usuarios/${id}`, form);
        navigate("/dashboard/usuarios", { 
        state: { mensaje: "Usuario actualizado correctamente", tipo: "success" }
        });
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      setError("Error al guardar los cambios.");
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h2 className="mb-4">Editar Usuario</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Rol</Form.Label>
          <Form.Select name="rol" value={form.rol} onChange={handleChange}>
            <option value="alumno">Alumno</option>
            <option value="docente">Docente</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contraseña (dejar vacío para no cambiar)</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Nueva contraseña (opcional)"
          />
        </Form.Group>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={() => navigate("/dashboard/usuarios")}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar cambios
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UsuarioEdit;
