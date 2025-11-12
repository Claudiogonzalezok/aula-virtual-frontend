import { useState } from "react";
import API from "../services/api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const validarPassword = () => {
    if (!password) {
      setError("Por favor, ingresa tu nueva contraseña");
      return false;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      setError("La contraseña debe contener al menos una letra y un número");
      return false;
    }

    if (!confirmarPassword) {
      setError("Por favor, confirma tu nueva contraseña");
      return false;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validarPassword()) {
      return;
    }

    setLoading(true);

    try {
      await API.post(`/usuarios/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const mensaje = err.response?.data?.msg || "Error al restablecer la contraseña. Intenta nuevamente.";
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
                <h3 className="fw-bold text-dark">Restablecer Contraseña</h3>
                <p className="text-muted">
                  Crea una nueva contraseña segura
                </p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              {success ? (
                <Alert variant="success">
                  <div className="text-center">
                    <h5 className="mt-3">¡Contraseña actualizada!</h5>
                    <p className="mb-0">
                      Tu contraseña ha sido cambiada exitosamente.
                      <br />
                      Redirigiendo al inicio de sesión...
                    </p>
                  </div>
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Nueva contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoFocus
                    />
                    <Form.Text className="text-muted">
                      Debe contener al menos una letra y un número
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="confirmarPassword">
                    <Form.Label>Confirmar nueva contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
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
                          Actualizando...
                        </>
                      ) : (
                        "Restablecer contraseña"
                      )}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none text-muted">
                      Volver al inicio de sesión
                    </Link>
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

export default ResetPassword;