import { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      return;
    }

    setLoading(true);

    try {
      await API.post("/usuarios/forgot-password", { email: email.trim() });
      setSuccess(true);
      setEmail("");
    } catch (err) {
      const mensaje = err.response?.data?.msg || "Error al procesar la solicitud. Intenta nuevamente.";
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
                <h3 className="fw-bold text-dark">¿Olvidaste tu contraseña?</h3>
                <p className="text-muted">
                  Te enviaremos instrucciones para recuperarla
                </p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  <strong>¡Correo enviado!</strong>
                  <p className="mb-0 mt-1">
                    Si el email está registrado, recibirás un correo con instrucciones.
                    Revisa tu bandeja de entrada y spam.
                  </p>
                </Alert>
              )}

              {!success && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="email">
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoFocus
                    />
                    <Form.Text className="text-muted">
                      Ingresa el correo asociado a tu cuenta
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid mb-3">
                    <Button
                      type="submit"
                      variant="primary"
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
                          Enviando...
                        </>
                      ) : (
                        "Enviar instrucciones"
                      )}
                    </Button>
                  </div>
                </Form>
              )}

              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none text-primary">
                  Volver al inicio de sesión
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;