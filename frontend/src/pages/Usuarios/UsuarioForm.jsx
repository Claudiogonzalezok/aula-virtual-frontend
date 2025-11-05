import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const UsuarioForm = () => {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "alumno",
  });

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/usuarios", form);
        navigate("/dashboard/usuarios", { 
        state: { mensaje: "Usuario creado correctamente", tipo: "success" }
        });

    } catch (error) {
      console.error("Error al crear usuario:", error.response?.data || error.message);
      alert("Error al crear usuario. Revisá los datos o el token.");
    }
  };

  return (
    <div>
      <h2>Nuevo Usuario</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control name="nombre" value={form.nombre} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Rol</Form.Label>
          <Form.Select name="rol" value={form.rol} onChange={handleChange} required>
            <option value="alumno">Alumno</option>
            <option value="docente">Docente</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" variant="success">Guardar</Button>
      </Form>
    </div>
  );
};

export default UsuarioForm;

