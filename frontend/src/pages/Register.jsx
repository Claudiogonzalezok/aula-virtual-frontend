// frontend/src/pages/Register.jsx
import { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";

const Register = () => {
  const [form, setForm] = useState({ nombre: "", email: "", password: "", confirmarPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validarFormulario = () => {
    if (!form.nombre.trim()) {
      setError("Por favor, ingresa tu nombre completo");
      return false;
    }

    if (!form.email.trim()) {
      setError("Por favor, ingresa tu correo electrónico");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      return false;
    }

    if (!form.password) {
      setError("Por favor, crea una contraseña");
      return false;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(form.password)) {
      setError("La contraseña debe contener al menos una letra y un número");
      return false;
    }

    if (!form.confirmarPassword) {
      setError("Por favor, confirma tu contraseña");
      return false;
    }

    if (form.password !== form.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const { data } = await API.post("/usuarios/register", {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password
      });
      
      setSuccess(true);
      setForm({ nombre: "", email: "", password: "", confirmarPassword: "" });
    } catch (err) {
      const mensaje = err.response?.data?.msg || "Error al registrar el usuario. Intenta nuevamente.";
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-success">Crear Cuenta</h3>
                <p className="text-muted">Únete a nuestra comunidad educativa</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success">
                  <div className="text-center">
                    <i className="bi bi-check-circle-fill" style={{ fontSize: "3rem" }}></i>
                    <h5 className="mt-3">¡Registro exitoso!</h5>
                    <p className="mb-2">
                      <strong>Por favor, verifica tu email</strong> para activar tu cuenta.
                    </p>
                    <p className="mb-0 small">
                      Te hemos enviado un correo a <strong>{form.email}</strong>.
                      Revisa tu bandeja de entrada y la carpeta de spam.
                    </p>
                    <hr />
                    <p className="mb-0 small text-muted">
                      ¿No recibiste el email?{" "}
                      <Link to="/resend-verification" className="fw-semibold">
                        Reenviar verificación
                      </Link>
                    </p>
                  </div>
                </Alert>
              )}

              {!success && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="nombre">
                    <Form.Label>Nombre completo</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      placeholder="Juan Pérez"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="tu@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      Debe contener al menos una letra y un número
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="confirmarPassword">
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmarPassword"
                      placeholder="Repite tu contraseña"
                      value={form.confirmarPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <div className="d-grid mb-3">
                    <Button 
                      type="submit" 
                      variant="success" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Creando cuenta...
                        </>
                      ) : (
                        "Registrarse"
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <small className="text-muted">
                      ¿Ya tenés una cuenta?{" "}
                      <Link to="/login" className="text-decoration-none text-success fw-semibold">
                        Iniciar sesión
                      </Link>
                    </small>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;