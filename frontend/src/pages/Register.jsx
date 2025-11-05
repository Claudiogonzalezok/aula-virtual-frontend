// src/pages/Register.js
import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

const Register = () => {
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      await API.post("/usuarios/register", form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Error al registrar el usuario. Intente nuevamente.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4 fw-bold text-success">Crear Cuenta</h3>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Registro exitoso. Redirigiendo...</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="nombre">
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    placeholder="Ingrese su nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Ingrese su correo"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Cree una contraseña segura"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button type="submit" variant="success" size="lg">
                    Registrarse
                  </Button>
                </div>

                <div className="text-center">
                  <small>
                    ¿Ya tenés una cuenta?{" "}
                    <Link to="/login" className="text-decoration-none text-success fw-semibold">
                      Iniciar sesión
                    </Link>
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;

