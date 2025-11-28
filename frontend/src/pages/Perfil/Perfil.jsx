// frontend/src/pages/Perfil/Perfil.jsx
import { useState, useEffect, useContext, useRef } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Alert,
  Tab,
  Nav,
  Badge,
  Modal,
  ProgressBar
} from "react-bootstrap";
import {
  FaUser,
  FaLock,
  FaCog,
  FaCamera,
  FaSave,
  FaTrash,
  FaChartBar,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendar,
  FaIdCard,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaBell,
  FaMoon,
  FaGlobe
} from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { toast } from "react-toastify";

const Perfil = () => {
  const { usuario: usuarioAuth, actualizarUsuario } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  // Estados principales
  const [perfil, setPerfil] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  // Estados del formulario de perfil
  const [formPerfil, setFormPerfil] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    biografia: "",
    fechaNacimiento: ""
  });

  // Estados del formulario de contraseña
  const [formPassword, setFormPassword] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmarPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });

  // Estados de preferencias
  const [preferencias, setPreferencias] = useState({
    notificacionesEmail: true,
    notificacionesPush: true,
    temaOscuro: false,
    idioma: "es"
  });

  // Estados de imagen
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [showModalImagen, setShowModalImagen] = useState(false);

  useEffect(() => {
    cargarPerfil();
    cargarEstadisticas();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/perfil");
      setPerfil(data);
      setFormPerfil({
        nombre: data.nombre || "",
        telefono: data.telefono || "",
        direccion: data.direccion || "",
        biografia: data.biografia || "",
        fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.split("T")[0] : ""
      });
      setPreferencias(data.preferencias || {
        notificacionesEmail: true,
        notificacionesPush: true,
        temaOscuro: false,
        idioma: "es"
      });
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const { data } = await API.get("/perfil/estadisticas");
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Guardar perfil
  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      const { data } = await API.put("/perfil", formPerfil);
      setPerfil(data.usuario);
      
      // Actualizar contexto de autenticación si cambió el nombre
      if (actualizarUsuario && data.usuario.nombre !== usuarioAuth?.nombre) {
        actualizarUsuario({ ...usuarioAuth, nombre: data.usuario.nombre });
      }
      
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      toast.error(error.response?.data?.msg || "Error al guardar perfil");
    } finally {
      setGuardando(false);
    }
  };

  // Cambiar contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    
    if (formPassword.passwordNueva !== formPassword.confirmarPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setGuardando(true);
      await API.put("/perfil/password", formPassword);
      toast.success("Contraseña actualizada correctamente");
      setFormPassword({
        passwordActual: "",
        passwordNueva: "",
        confirmarPassword: ""
      });
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      toast.error(error.response?.data?.msg || "Error al cambiar contraseña");
    } finally {
      setGuardando(false);
    }
  };

  // Subir imagen
  const handleSeleccionarImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.error("Solo se permiten imágenes (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImagen(reader.result);
      setShowModalImagen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmarImagen = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return;

    try {
      setSubiendoImagen(true);
      const formData = new FormData();
      formData.append("imagen", file);

      const { data } = await API.post("/perfil/imagen", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setPerfil(prev => ({ ...prev, imagen: data.imagen }));
      toast.success("Imagen de perfil actualizada");
      setShowModalImagen(false);
      setPreviewImagen(null);
      
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      toast.error(error.response?.data?.msg || "Error al subir imagen");
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleEliminarImagen = async () => {
    if (!window.confirm("¿Estás seguro de eliminar tu imagen de perfil?")) return;

    try {
      await API.delete("/perfil/imagen");
      setPerfil(prev => ({ ...prev, imagen: null }));
      toast.success("Imagen de perfil eliminada");
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      toast.error("Error al eliminar imagen");
    }
  };

  // Guardar preferencias
  const handleGuardarPreferencias = async () => {
    try {
      setGuardando(true);
      await API.put("/perfil/preferencias", preferencias);
      toast.success("Preferencias actualizadas");
    } catch (error) {
      console.error("Error al guardar preferencias:", error);
      toast.error("Error al guardar preferencias");
    } finally {
      setGuardando(false);
    }
  };

  // Obtener iniciales del nombre
  const getIniciales = (nombre) => {
    if (!nombre) return "?";
    const partes = nombre.trim().split(" ");
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  // Obtener URL de la imagen
  const getImagenUrl = () => {
    if (perfil?.imagen) {
      // Si es una URL relativa, agregar el base URL
      if (perfil.imagen.startsWith("/")) {
        return `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${perfil.imagen}`;
      }
      return perfil.imagen;
    }
    return null;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando perfil...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-primary">
          <FaUser className="me-2" />
          Mi Perfil
        </h2>
        <p className="text-muted">Gestiona tu información personal y preferencias</p>
      </div>

      <Row>
        {/* Sidebar con foto y estadísticas */}
        <Col lg={4} className="mb-4">
          {/* Tarjeta de perfil */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="text-center py-4">
              {/* Imagen de perfil */}
              <div className="position-relative d-inline-block mb-3">
                {getImagenUrl() ? (
                  <img
                    src={getImagenUrl()}
                    alt="Perfil"
                    className="rounded-circle border border-3 border-primary"
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: "150px", height: "150px", fontSize: "3rem" }}
                  >
                    {getIniciales(perfil?.nombre)}
                  </div>
                )}
                
                {/* Botón para cambiar imagen */}
                <Button
                  variant="primary"
                  size="sm"
                  className="position-absolute bottom-0 end-0 rounded-circle"
                  style={{ width: "40px", height: "40px" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaCamera />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept="image/*"
                  onChange={handleSeleccionarImagen}
                />
              </div>

              <h4 className="mb-1">{perfil?.nombre}</h4>
              <p className="text-muted mb-2">{perfil?.email}</p>
              <Badge bg={
                perfil?.rol === "admin" ? "danger" :
                perfil?.rol === "docente" ? "success" : "primary"
              } className="px-3 py-2">
                {perfil?.rol?.charAt(0).toUpperCase() + perfil?.rol?.slice(1)}
              </Badge>

              {perfil?.imagen && (
                <div className="mt-3">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleEliminarImagen}
                  >
                    <FaTrash className="me-1" />
                    Eliminar imagen
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Estadísticas */}
          {estadisticas && (
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <FaChartBar className="me-2 text-info" />
                  Mis Estadísticas
                </h5>
              </Card.Header>
              <Card.Body>
                {perfil?.rol === "alumno" && (
                  <Row className="g-3">
                    <Col xs={6}>
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-primary">{estadisticas.cursosInscritos || 0}</h4>
                        <small className="text-muted">Cursos</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-success">{estadisticas.examenesRealizados || 0}</h4>
                        <small className="text-muted">Exámenes</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-warning">{estadisticas.tareasEntregadas || 0}</h4>
                        <small className="text-muted">Tareas</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-info">{estadisticas.promedioGeneral || "-"}%</h4>
                        <small className="text-muted">Promedio</small>
                      </div>
                    </Col>
                  </Row>
                )}

                {perfil?.rol === "docente" && (
                  <Row className="g-3">
                    <Col xs={6}>
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-primary">{estadisticas.cursosCreados || 0}</h4>
                        <small className="text-muted">Cursos</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-success">{estadisticas.totalAlumnos || 0}</h4>
                        <small className="text-muted">Alumnos</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-warning">{estadisticas.examenesCreados || 0}</h4>
                        <small className="text-muted">Exámenes</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-info">{estadisticas.tareasCreadas || 0}</h4>
                        <small className="text-muted">Tareas</small>
                      </div>
                    </Col>
                  </Row>
                )}

                {perfil?.rol === "admin" && (
                  <Row className="g-3">
                    <Col xs={6}>
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-primary">{estadisticas.totalUsuarios || 0}</h4>
                        <small className="text-muted">Usuarios</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-2 bg-light rounded">
                        <h4 className="mb-0 text-success">{estadisticas.totalCursos || 0}</h4>
                        <small className="text-muted">Cursos</small>
                      </div>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Contenido principal con tabs */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                <Nav variant="tabs" className="mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="perfil">
                      <FaUser className="me-2" />
                      Datos Personales
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password">
                      <FaLock className="me-2" />
                      Contraseña
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="preferencias">
                      <FaCog className="me-2" />
                      Preferencias
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  {/* Tab de Datos Personales */}
                  <Tab.Pane eventKey="perfil">
                    <Form onSubmit={handleGuardarPerfil}>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>
                              <FaUser className="me-2 text-muted" />
                              Nombre completo
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={formPerfil.nombre}
                              onChange={(e) => setFormPerfil({ ...formPerfil, nombre: e.target.value })}
                              required
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>
                              <FaEnvelope className="me-2 text-muted" />
                              Email
                            </Form.Label>
                            <Form.Control
                              type="email"
                              value={perfil?.email || ""}
                              disabled
                              className="bg-light"
                            />
                            <Form.Text className="text-muted">
                              El email no se puede cambiar
                            </Form.Text>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>
                              <FaPhone className="me-2 text-muted" />
                              Teléfono
                            </Form.Label>
                            <Form.Control
                              type="tel"
                              value={formPerfil.telefono}
                              onChange={(e) => setFormPerfil({ ...formPerfil, telefono: e.target.value })}
                              placeholder="Ej: +54 9 11 1234-5678"
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>
                              <FaCalendar className="me-2 text-muted" />
                              Fecha de nacimiento
                            </Form.Label>
                            <Form.Control
                              type="date"
                              value={formPerfil.fechaNacimiento}
                              onChange={(e) => setFormPerfil({ ...formPerfil, fechaNacimiento: e.target.value })}
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12}>
                          <Form.Group>
                            <Form.Label>
                              <FaMapMarkerAlt className="me-2 text-muted" />
                              Dirección
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={formPerfil.direccion}
                              onChange={(e) => setFormPerfil({ ...formPerfil, direccion: e.target.value })}
                              placeholder="Tu dirección"
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={12}>
                          <Form.Group>
                            <Form.Label>
                              <FaIdCard className="me-2 text-muted" />
                              Biografía
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={formPerfil.biografia}
                              onChange={(e) => setFormPerfil({ ...formPerfil, biografia: e.target.value })}
                              placeholder="Cuéntanos algo sobre ti..."
                              maxLength={500}
                            />
                            <Form.Text className="text-muted">
                              {formPerfil.biografia.length}/500 caracteres
                            </Form.Text>
                          </Form.Group>
                        </Col>

                        <Col xs={12}>
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={guardando}
                            className="px-4"
                          >
                            {guardando ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <FaSave className="me-2" />
                                Guardar cambios
                              </>
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Tab.Pane>

                  {/* Tab de Contraseña */}
                  <Tab.Pane eventKey="password">
                    <Alert variant="info" className="mb-4">
                      <FaLock className="me-2" />
                      Para tu seguridad, te recomendamos usar una contraseña única y segura.
                    </Alert>

                    <Form onSubmit={handleCambiarPassword}>
                      <Row className="g-3">
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Contraseña actual</Form.Label>
                            <div className="position-relative">
                              <Form.Control
                                type={showPasswords.actual ? "text" : "password"}
                                value={formPassword.passwordActual}
                                onChange={(e) => setFormPassword({ ...formPassword, passwordActual: e.target.value })}
                                required
                              />
                              <Button
                                variant="link"
                                className="position-absolute end-0 top-50 translate-middle-y text-muted"
                                onClick={() => setShowPasswords({ ...showPasswords, actual: !showPasswords.actual })}
                              >
                                {showPasswords.actual ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </div>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Nueva contraseña</Form.Label>
                            <div className="position-relative">
                              <Form.Control
                                type={showPasswords.nueva ? "text" : "password"}
                                value={formPassword.passwordNueva}
                                onChange={(e) => setFormPassword({ ...formPassword, passwordNueva: e.target.value })}
                                required
                                minLength={6}
                              />
                              <Button
                                variant="link"
                                className="position-absolute end-0 top-50 translate-middle-y text-muted"
                                onClick={() => setShowPasswords({ ...showPasswords, nueva: !showPasswords.nueva })}
                              >
                                {showPasswords.nueva ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </div>
                            <Form.Text className="text-muted">
                              Mínimo 6 caracteres, incluir letras y números
                            </Form.Text>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Confirmar nueva contraseña</Form.Label>
                            <div className="position-relative">
                              <Form.Control
                                type={showPasswords.confirmar ? "text" : "password"}
                                value={formPassword.confirmarPassword}
                                onChange={(e) => setFormPassword({ ...formPassword, confirmarPassword: e.target.value })}
                                required
                                isInvalid={formPassword.confirmarPassword && formPassword.passwordNueva !== formPassword.confirmarPassword}
                                isValid={formPassword.confirmarPassword && formPassword.passwordNueva === formPassword.confirmarPassword}
                              />
                              <Button
                                variant="link"
                                className="position-absolute end-0 top-50 translate-middle-y text-muted"
                                onClick={() => setShowPasswords({ ...showPasswords, confirmar: !showPasswords.confirmar })}
                              >
                                {showPasswords.confirmar ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </div>
                          </Form.Group>
                        </Col>

                        <Col xs={12}>
                          <Button
                            type="submit"
                            variant="warning"
                            disabled={guardando || !formPassword.passwordActual || !formPassword.passwordNueva || formPassword.passwordNueva !== formPassword.confirmarPassword}
                            className="px-4"
                          >
                            {guardando ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Cambiando...
                              </>
                            ) : (
                              <>
                                <FaLock className="me-2" />
                                Cambiar contraseña
                              </>
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Form>
                  </Tab.Pane>

                  {/* Tab de Preferencias */}
                  <Tab.Pane eventKey="preferencias">
                    <Row className="g-4">
                      <Col md={6}>
                        <Card className="border h-100">
                          <Card.Body>
                            <h6 className="fw-bold mb-3">
                              <FaBell className="me-2 text-primary" />
                              Notificaciones
                            </h6>
                            
                            <Form.Check
                              type="switch"
                              id="notif-email"
                              label="Notificaciones por email"
                              checked={preferencias.notificacionesEmail}
                              onChange={(e) => setPreferencias({ ...preferencias, notificacionesEmail: e.target.checked })}
                              className="mb-3"
                            />
                            
                            <Form.Check
                              type="switch"
                              id="notif-push"
                              label="Notificaciones push"
                              checked={preferencias.notificacionesPush}
                              onChange={(e) => setPreferencias({ ...preferencias, notificacionesPush: e.target.checked })}
                            />
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={6}>
                        <Card className="border h-100">
                          <Card.Body>
                            <h6 className="fw-bold mb-3">
                              <FaCog className="me-2 text-secondary" />
                              Apariencia
                            </h6>
                            
                            <Form.Check
                              type="switch"
                              id="tema-oscuro"
                              label={
                                <>
                                  <FaMoon className="me-2" />
                                  Tema oscuro
                                </>
                              }
                              checked={preferencias.temaOscuro}
                              onChange={(e) => setPreferencias({ ...preferencias, temaOscuro: e.target.checked })}
                              className="mb-3"
                            />
                            
                            <Form.Group>
                              <Form.Label>
                                <FaGlobe className="me-2" />
                                Idioma
                              </Form.Label>
                              <Form.Select
                                value={preferencias.idioma}
                                onChange={(e) => setPreferencias({ ...preferencias, idioma: e.target.value })}
                              >
                                <option value="es">Español</option>
                                <option value="en">English</option>
                              </Form.Select>
                            </Form.Group>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12}>
                        <Button
                          variant="primary"
                          onClick={handleGuardarPreferencias}
                          disabled={guardando}
                          className="px-4"
                        >
                          {guardando ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <FaSave className="me-2" />
                              Guardar preferencias
                            </>
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de confirmación de imagen */}
      <Modal show={showModalImagen} onHide={() => setShowModalImagen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar imagen de perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {previewImagen && (
            <img
              src={previewImagen}
              alt="Preview"
              className="rounded-circle mb-3"
              style={{ width: "200px", height: "200px", objectFit: "cover" }}
            />
          )}
          <p className="text-muted">¿Confirmas esta imagen como tu foto de perfil?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModalImagen(false);
            setPreviewImagen(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmarImagen}
            disabled={subiendoImagen}
          >
            {subiendoImagen ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Subiendo...
              </>
            ) : (
              <>
                <FaCheck className="me-2" />
                Confirmar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Perfil;