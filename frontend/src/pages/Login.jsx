// frontend/src/pages/Login.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState("");
  const [emailNoVerificado, setEmailNoVerificado] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailNoVerificado(false);
    setLoading(true);

    try {
      const { data } = await API.post("/usuarios/login", { 
        email, 
        password,
        recordarme 
      });
      
      login(data);
      navigate("/dashboard");
    } catch (err) {
      const mensaje = err.response?.data?.msg || "Error al iniciar sesión. Intenta nuevamente.";
      const requiresVerification = err.response?.data?.requiresVerification;
      
      setError(mensaje);
      
      // Si el email no está verificado, mostrar opción de reenviar
      if (requiresVerification) {
        setEmailNoVerificado(true);
      }
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
                <h3 className="fw-bold text-primary">Iniciar Sesión</h3>
                <p className="text-muted">Bienvenido de nuevo</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                  {error}
                  {emailNoVerificado && (
                    <div className="mt-2">
                      <hr />
                      <Link to="/resend-verification" className="btn btn-sm btn-outline-danger w-100">
                        <i className="bi bi-envelope-fill me-2"></i>
                        Reenviar email de verificación
                      </Link>
                    </div>
                  )}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Form.Check
                    type="checkbox"
                    id="recordarme"
                    label="Recuérdame"
                    checked={recordarme}
                    onChange={(e) => setRecordarme(e.target.checked)}
                    disabled={loading}
                  />
                  <Link 
                    to="/forgot-password" 
                    className="text-decoration-none text-primary"
                    style={{ fontSize: "0.9rem" }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

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
                        Iniciando sesión...
                      </>
                    ) : (
                      "Ingresar"
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <small className="text-muted">
                    ¿No tenés una cuenta?{" "}
                    <Link to="/register" className="text-decoration-none text-primary fw-semibold">
                      Registrate aquí
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

export default Login;