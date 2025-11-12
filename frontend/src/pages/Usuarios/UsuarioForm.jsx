import { useState } from "react";
import { Form, Button, Alert, InputGroup, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const UsuarioForm = () => {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "alumno",
  });

  const [tipoCreacion, setTipoCreacion] = useState("verificado"); // "verificado" o "sinVerificar"
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null); // Limpiar error al escribir
  };

  // Generar contraseña aleatoria segura
  const generarPasswordAleatoria = () => {
    const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const minusculas = "abcdefghijklmnopqrstuvwxyz";
    const numeros = "0123456789";
    const especiales = "!@#$%&*";
    const todos = mayusculas + minusculas + numeros + especiales;
    
    let password = "";
    // Asegurar al menos uno de cada tipo
    password += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length));
    password += minusculas.charAt(Math.floor(Math.random() * minusculas.length));
    password += numeros.charAt(Math.floor(Math.random() * numeros.length));
    password += especiales.charAt(Math.floor(Math.random() * especiales.length));
    
    // Completar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
      password += todos.charAt(Math.floor(Math.random() * todos.length));
    }
    
    // Mezclar los caracteres
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setForm({ ...form, password });
    setPasswordVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const datos = {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        rol: form.rol,
        requiereVerificacion: tipoCreacion === "sinVerificar" // true si requiere verificación
      };

      const response = await API.post("/usuarios", datos);
      
      const mensaje = tipoCreacion === "verificado" 
        ? response.data.emailEnviado 
          ? "Usuario creado y credenciales enviadas por email ✅"
          : "Usuario creado correctamente ✅ (email no enviado)"
        : "Usuario creado. Email de verificación enviado ✅";

      navigate("/dashboard/usuarios", { 
        state: { mensaje, tipo: "success" }
      });

    } catch (error) {
      console.error("Error al crear usuario:", error);
      const mensajeError = error.response?.data?.msg || "Error al crear usuario. Revisá los datos.";
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Nuevo Usuario</h2>

      {/* Mostrar error si existe */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Selector de tipo de creación */}
      <Alert variant="info" className="mb-4">
        <h6 className="mb-3">📋 Tipo de creación de cuenta:</h6>
        
        <Form.Check 
          type="radio"
          id="tipo-verificado"
          name="tipoCreacion"
          label={
            <div>
              <strong>✅ Usuario Verificado (con credenciales)</strong>
              <div className="text-muted small">
                La cuenta estará verificada y se enviarán las credenciales por email. 
                El usuario podrá iniciar sesión inmediatamente.
              </div>
            </div>
          }
          value="verificado"
          checked={tipoCreacion === "verificado"}
          onChange={(e) => setTipoCreacion(e.target.value)}
          className="mb-2"
        />
        
        <Form.Check 
          type="radio"
          id="tipo-sin-verificar"
          name="tipoCreacion"
          label={
            <div>
              <strong>📧 Usuario Sin Verificar (email de verificación)</strong>
              <div className="text-muted small">
                Se enviará un email de verificación. El usuario deberá verificar 
                su cuenta antes de poder iniciar sesión.
              </div>
            </div>
          }
          value="sinVerificar"
          checked={tipoCreacion === "sinVerificar"}
          onChange={(e) => setTipoCreacion(e.target.value)}
        />
      </Alert>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre Completo *</Form.Label>
          <Form.Control 
            name="nombre" 
            value={form.nombre} 
            onChange={handleChange} 
            required 
            placeholder="Ej: Juan Pérez"
            disabled={loading}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email *</Form.Label>
          <Form.Control 
            type="email" 
            name="email" 
            value={form.email} 
            onChange={handleChange} 
            required 
            placeholder="usuario@ejemplo.com"
            disabled={loading}
          />
        </Form.Group>

        {/* Campo de contraseña */}
        <Form.Group className="mb-3">
          <Form.Label>
            Contraseña Temporal *
            {tipoCreacion === "sinVerificar" && (
              <small className="text-muted ms-2">
                (El usuario la cambiará al verificar)
              </small>
            )}
          </Form.Label>
          <InputGroup>
            <Form.Control 
              type={passwordVisible ? "text" : "password"}
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              required 
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
            <Button 
              variant="outline-secondary"
              onClick={() => setPasswordVisible(!passwordVisible)}
              type="button"
              disabled={loading}
              title={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {passwordVisible ? "🙈" : "👁️"}
            </Button>
            <Button 
              variant="outline-primary"
              onClick={generarPasswordAleatoria}
              type="button"
              disabled={loading}
              title="Generar contraseña segura"
            >
              🎲 Generar
            </Button>
          </InputGroup>
          <Form.Text className="text-muted">
            {tipoCreacion === "verificado" 
              ? "Esta contraseña se enviará por email. Se recomienda que el usuario la cambie después del primer inicio de sesión."
              : "Esta será una contraseña temporal durante el proceso de verificación."
            }
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Rol *</Form.Label>
          <Form.Select 
            name="rol" 
            value={form.rol} 
            onChange={handleChange} 
            required
            disabled={loading}
          >
            <option value="alumno">Alumno</option>
            <option value="docente">Docente</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>

        <div className="d-flex gap-2">
          <Button 
            type="submit" 
            variant="success" 
            disabled={loading}
            className="d-flex align-items-center gap-2"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" />
                Creando...
              </>
            ) : (
              <>
                {tipoCreacion === "verificado" ? "✅ Crear y Enviar Credenciales" : "📧 Crear y Enviar Verificación"}
              </>
            )}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate("/dashboard/usuarios")}
            type="button"
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UsuarioForm;