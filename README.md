# 🎨 Aula Virtual - Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Bootstrap-5.x-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io">
</p>

Interfaz de usuario para el sistema de gestión de aulas virtuales desarrollada con React y Vite.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Componentes Principales](#-componentes-principales)
- [Rutas](#-rutas)
- [Contextos](#-contextos)
- [Servicios](#-servicios)
- [Despliegue](#-despliegue)

---

## ✨ Características

- ✅ Interfaz moderna y responsive
- ✅ Dashboards personalizados por rol
- ✅ Notificaciones en tiempo real
- ✅ Calendario interactivo de clases
- ✅ Sistema de exámenes con timer
- ✅ Gestión de tareas con entregas
- ✅ Toast notifications profesionales
- ✅ Temas claro/oscuro (próximamente)
- ✅ PWA ready (próximamente)

---

## 📦 Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0

---

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/aula-virtual.git

# Navegar al directorio del frontend
cd aula-virtual/frontend

# Instalar dependencias
npm install
```

---

## ⚙️ Configuración

Crear un archivo `.env` en la raíz del directorio `frontend`:

```env
# URL de la API del backend
VITE_API_URL=http://localhost:5000/api

# URL para WebSockets
VITE_SOCKET_URL=http://localhost:5000

# Nombre de la aplicación (opcional)
VITE_APP_NAME=Aula Virtual
```

### Variables de entorno para producción:

```env
VITE_API_URL=https://tu-backend.onrender.com/api
VITE_SOCKET_URL=https://tu-backend.onrender.com
```

---

## 📁 Estructura del Proyecto

```
frontend/
├── public/
│   ├── favicon.ico
│   └── ...
│
├── src/
│   ├── components/              # Componentes reutilizables
│   │   ├── common/              # Componentes genéricos
│   │   │   ├── Loading.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   └── ...
│   │   ├── Notificaciones/
│   │   │   ├── NotificacionBadge.jsx
│   │   │   └── NotificacionLista.jsx
│   │   ├── DashboardLayout.jsx  # Layout principal
│   │   ├── NavbarDashboard.jsx  # Navbar
│   │   └── ...
│   │
│   ├── context/                 # Contextos de React
│   │   ├── AuthContext.jsx      # Autenticación
│   │   └── SocketContext.jsx    # WebSockets
│   │
│   ├── pages/                   # Páginas de la aplicación
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Registro.jsx
│   │   │   ├── RecuperarPassword.jsx
│   │   │   └── VerificarEmail.jsx
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DocenteDashboard.jsx
│   │   │   └── AlumnoDashboard.jsx
│   │   │
│   │   ├── Cursos/
│   │   │   ├── ListaCursos.jsx
│   │   │   ├── DetalleCurso.jsx
│   │   │   ├── FormularioCurso.jsx
│   │   │   └── InscripcionCursos.jsx
│   │   │
│   │   ├── Clases/
│   │   │   ├── MisClases.jsx
│   │   │   ├── FormularioClase.jsx
│   │   │   └── DetalleClase.jsx
│   │   │
│   │   ├── Tareas/
│   │   │   ├── ListaTareas.jsx
│   │   │   ├── TareasAlumno.jsx
│   │   │   ├── FormularioTarea.jsx
│   │   │   ├── EntregarTarea.jsx
│   │   │   └── CalificarEntregas.jsx
│   │   │
│   │   ├── Examenes/
│   │   │   ├── ListaExamenes.jsx
│   │   │   ├── FormularioExamen.jsx
│   │   │   ├── RealizarExamen.jsx
│   │   │   ├── CalificarExamen.jsx
│   │   │   └── ResultadosExamen.jsx
│   │   │
│   │   ├── Usuarios/
│   │   │   ├── ListaUsuarios.jsx
│   │   │   ├── FormularioUsuario.jsx
│   │   │   └── Perfil.jsx
│   │   │
│   │   ├── Calificaciones/
│   │   │   ├── MisNotas.jsx
│   │   │   └── GestionCalificaciones.jsx
│   │   │
│   │   ├── Mensajes/
│   │   │   └── Mensajes.jsx
│   │   │
│   │   └── Reportes/
│   │       └── Reportes.jsx
│   │
│   ├── services/
│   │   └── api.js               # Configuración de Axios
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.js
│   │   └── useSocket.js
│   │
│   ├── utils/                   # Utilidades
│   │   ├── dateHelpers.js
│   │   └── validators.js
│   │
│   ├── App.jsx                  # Componente principal
│   ├── main.jsx                 # Punto de entrada
│   └── index.css                # Estilos globales
│
├── index.html
├── vite.config.js
├── package.json
└── .env
```

---

## 🧩 Componentes Principales

### DashboardLayout

Layout principal que incluye:
- Navbar con usuario y notificaciones
- Sidebar con navegación por rol
- Área de contenido principal
- Footer

```jsx
<DashboardLayout>
  <Outlet /> {/* Contenido de la página */}
</DashboardLayout>
```

### NavbarDashboard

Barra de navegación superior con:
- Logo y nombre de la app
- Badge de notificaciones
- Menú de usuario con foto de perfil
- Botón de logout

### NotificacionBadge

Componente que muestra el contador de notificaciones no leídas y se conecta en tiempo real via Socket.io.

### Dashboards por Rol

Cada rol tiene su propio dashboard personalizado:

- **AdminDashboard**: Estadísticas del sistema, usuarios activos, cursos
- **DocenteDashboard**: Mis cursos, tareas pendientes de calificar, clases próximas
- **AlumnoDashboard**: Promedio, entregas pendientes, clases del día, progreso

---

## 🛤️ Rutas

### Rutas Públicas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Home | Página de inicio |
| `/login` | Login | Iniciar sesión |
| `/registro` | Registro | Crear cuenta |
| `/verificar-email/:token` | VerificarEmail | Verificar email |
| `/recuperar-password` | RecuperarPassword | Solicitar recuperación |
| `/reset-password/:token` | ResetPassword | Nueva contraseña |

### Rutas Protegidas (Dashboard)

| Ruta | Componente | Roles |
|------|------------|-------|
| `/dashboard` | Dashboard (por rol) | Todos |
| `/dashboard/usuarios` | ListaUsuarios | Admin |
| `/dashboard/cursos` | ListaCursos | Todos |
| `/dashboard/cursos/nuevo` | FormularioCurso | Admin |
| `/dashboard/cursos/:id` | DetalleCurso | Todos |
| `/dashboard/clases` | MisClases | Todos |
| `/dashboard/tareas` | ListaTareas | Admin/Docente |
| `/dashboard/mis-tareas` | TareasAlumno | Alumno |
| `/dashboard/examenes` | ListaExamenes | Todos |
| `/dashboard/examenes/:id/realizar` | RealizarExamen | Alumno |
| `/dashboard/notas` | MisNotas | Alumno |
| `/dashboard/calificaciones` | GestionCalificaciones | Admin/Docente |
| `/dashboard/mensajes` | Mensajes | Todos |
| `/dashboard/notificaciones` | Notificaciones | Todos |
| `/dashboard/perfil` | Perfil | Todos |
| `/dashboard/inscripcion` | InscripcionCursos | Alumno |

---

## 🔄 Contextos

### AuthContext

Maneja la autenticación del usuario:

```jsx
const { usuario, login, logout, loading } = useContext(AuthContext);

// Propiedades disponibles
usuario: {
  _id: string,
  nombre: string,
  email: string,
  rol: 'admin' | 'docente' | 'alumno',
  imagen: string
}

// Métodos
login(email, password, recordar): Promise
logout(): void
actualizarUsuario(datos): void
```

### SocketContext

Maneja la conexión WebSocket:

```jsx
const { socket, conectado } = useContext(SocketContext);

// Escuchar eventos
useEffect(() => {
  socket?.on('nueva-notificacion', (notificacion) => {
    // Manejar notificación
  });

  return () => socket?.off('nueva-notificacion');
}, [socket]);
```

---

## 📡 Servicios

### API (Axios)

Configuración centralizada de Axios:

```javascript
// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Interceptor para agregar token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
```

### Uso del servicio API:

```javascript
import API from '../services/api';

// GET
const { data } = await API.get('/cursos');

// POST
const { data } = await API.post('/cursos', { titulo, descripcion });

// PUT
await API.put(`/cursos/${id}`, datos);

// DELETE
await API.delete(`/cursos/${id}`);

// Upload de archivos
const formData = new FormData();
formData.append('archivo', file);
await API.post('/tareas/entregar', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## 🎨 Estilos

### Bootstrap + React Bootstrap

```jsx
import { Button, Card, Form, Modal } from 'react-bootstrap';

<Card className="shadow-sm">
  <Card.Body>
    <Card.Title>Título</Card.Title>
  </Card.Body>
</Card>
```

### Iconos con React Icons

```jsx
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { BsHouseDoor, BsBook } from 'react-icons/bs';

<FaUser className="text-primary me-2" size={20} />
```

### Toast Notifications

```jsx
import { toast } from 'react-toastify';

// Tipos de toast
toast.success('Operación exitosa');
toast.error('Ocurrió un error');
toast.warning('Advertencia');
toast.info('Información');

// Con opciones
toast.success('Guardado', {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false
});
```

### Estilos personalizados

```jsx
// Inline styles
<div style={{ backgroundColor: '#f8f9fa', padding: '1rem' }}>

// CSS Modules (si se usan)
import styles from './Component.module.css';
<div className={styles.container}>

// Template literals para estilos dinámicos
<style>{`
  .clase-en-curso {
    animation: pulso 1.5s infinite;
  }
  
  @keyframes pulso {
    0% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); }
    100% { box-shadow: 0 0 0 10px rgba(25, 135, 84, 0); }
  }
`}</style>
```

---

## 📱 Responsive Design

El proyecto utiliza Bootstrap Grid para diseño responsive:

```jsx
<Row>
  <Col xs={12} md={6} lg={4}>
    {/* Contenido */}
  </Col>
</Row>
```

### Breakpoints:
- `xs`: < 576px (móvil)
- `sm`: ≥ 576px
- `md`: ≥ 768px (tablet)
- `lg`: ≥ 992px (desktop)
- `xl`: ≥ 1200px
- `xxl`: ≥ 1400px

---

## 🚀 Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Ejecutar ESLint |

---

## 🌐 Despliegue

### Vercel (Recomendado)

1. Importar proyecto en [Vercel](https://vercel.com)
2. Configurar:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Agregar variables de entorno:
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   VITE_SOCKET_URL=https://tu-backend.onrender.com
   ```
4. Deploy

### Netlify

1. Conectar repositorio en [Netlify](https://netlify.com)
2. Configurar:
   - **Base directory**: frontend
   - **Build command**: `npm run build`
   - **Publish directory**: frontend/dist
3. Agregar variables de entorno
4. Crear archivo `_redirects` en `public/`:
   ```
   /*    /index.html   200
   ```

### Build manual

```bash
# Generar build
npm run build

# El resultado estará en la carpeta dist/
# Subir contenido de dist/ a cualquier hosting estático
```

---

## 🐛 Solución de Problemas

### Error de CORS

Verificar que `VITE_API_URL` apunte al backend correcto y que el backend tenga configurado CORS.

### Socket.io no conecta

Verificar que `VITE_SOCKET_URL` sea correcto (sin `/api` al final).

### Build falla

```bash
# Limpiar cache y reinstalar
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### Imágenes no cargan

Verificar que la URL base del backend esté correcta en el servicio API.

---

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "react-bootstrap": "^2.x",
    "bootstrap": "^5.x",
    "axios": "^1.x",
    "socket.io-client": "^4.x",
    "react-toastify": "^9.x",
    "react-icons": "^4.x",
    "@fullcalendar/react": "^6.x",
    "recharts": "^2.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "vite": "^5.x",
    "eslint": "^8.x"
  }
}
```

---

## 📄 Licencia

MIT License - ver [LICENSE](../LICENSE)

---

## 👨‍💻 Autor

**Claudio Gonzalez** - UTN-FRT

---

<p align="center">
  Desarrollado para Habilitación Profesional - UTN FRT
</p>
