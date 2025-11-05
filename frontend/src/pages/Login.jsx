// src/pages/Login.js
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/usuarios/login", { email, password });
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4 fw-bold text-primary">Iniciar Sesión</h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingrese su correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button type="submit" variant="primary" size="lg">
                    Ingresar
                  </Button>
                </div>

                <div className="text-center">
                  <small>
                    ¿No tenés una cuenta?{" "}
                    <Link to="/register" className="text-decoration-none text-primary fw-semibold">
                      Registrate
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
