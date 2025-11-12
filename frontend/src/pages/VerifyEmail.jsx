// frontend/src/pages/VerifyEmail.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";

const VerifyEmail = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();
  const haVerificado = useRef(false); // 🆕 Bandera para evitar doble ejecución

  useEffect(() => {
    const verificarEmail = async () => {
      // 🆕 Si ya se verificó, no hacer nada
      if (haVerificado.current) {
        console.log("⚠️ Ya se intentó verificar, saltando...");
        return;
      }
      
      haVerificado.current = true; // 🆕 Marcar como verificado
      try {
        // Decodificar el token por si tiene caracteres especiales
        const decodedToken = decodeURIComponent(token);
        
        const { data } = await API.get(`/usuarios/verify-email/${decodedToken}`);
        setSuccess(true);
        setError("");
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setSuccess(false);
        
        // Si el error es 400, puede ser que ya esté verificado o token inválido
        if (err.response?.status === 400) {
          setError(err.response?.data?.msg || "El enlace de verificación es inválido o ha expirado.");
        } else {
          setError(err.response?.data?.msg || "Error al verificar el email. Por favor, intenta nuevamente.");
        }
      } finally {
        setLoading(false);
      }
    };

    verificarEmail();
  }, [token, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              {loading && (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" className="mb-3" />
                  <h4>Verificando tu email...</h4>
                  <p className="text-muted">Por favor espera un momento</p>
                </div>
              )}

              {!loading && success && (
                <div className="text-center">
                  <div className="mb-3">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
                  </div>
                  <Alert variant="success">
                    <h4 className="mb-3">¡Email verificado exitosamente!</h4>
                    <p className="mb-0">
                      Tu cuenta ha sido activada. Serás redirigido al inicio de sesión en unos segundos...
                    </p>
                  </Alert>
                  <Link to="/login" className="btn btn-primary mt-3">
                    Ir al Login
                  </Link>
                </div>
              )}

              {!loading && error && (
                <div className="text-center">
                  <div className="mb-3">
                    <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "4rem" }}></i>
                  </div>
                  <Alert variant="danger">
                    <h5 className="mb-3">Error en la verificación</h5>
                    <p>{error}</p>
                  </Alert>
                  <div className="mt-3">
                    <Link to="/resend-verification" className="btn btn-primary me-2">
                      Reenviar email de verificación
                    </Link>
                    <Link to="/login" className="btn btn-outline-primary">
                      Volver al Login
                    </Link>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyEmail;