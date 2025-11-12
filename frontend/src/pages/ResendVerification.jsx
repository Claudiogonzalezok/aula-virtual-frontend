// frontend/src/pages/ResendVerification.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
      const { data } = await API.post("/usuarios/resend-verification", { email: email.trim() });
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.msg || "Error al enviar el email. Intenta nuevamente.");
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
                <div className="mb-3">
                  <i className="bi bi-envelope-fill text-primary" style={{ fontSize: "3rem" }}></i>
                </div>
                <h3 className="fw-bold text-dark">Reenviar Verificación</h3>
                <p className="text-muted">
                  Ingresa tu email y te enviaremos un nuevo enlace de verificación
                </p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill me-2" style={{ fontSize: "1.5rem" }}></i>
                    <div>
                      <strong>¡Email enviado!</strong>
                      <p className="mb-0 mt-1">
                        Si tu email está registrado y no verificado, recibirás un nuevo correo.
                        Revisa tu bandeja de entrada y spam.
                      </p>
                    </div>
                  </div>
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
                      Ingresa el correo con el que te registraste
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
                        <>
                          <i className="bi bi-envelope-fill me-2"></i>
                          Reenviar verificación
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              )}

              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none text-primary d-inline-flex align-items-center">
                  <i className="bi bi-arrow-left me-2"></i>
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

export default ResendVerification;