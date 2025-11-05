// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DocenteRoute from "./components/DocenteRoute";

// Layout
import DashboardLayout from "./components/DashboardLayout";

// Páginas principales
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardInicio from "./pages/DashboardInicio";

// Gestión de Usuarios
import UsuariosList from "./pages/Usuarios/UsuariosList";
import UsuarioEdit from "./pages/Usuarios/UsuarioEdit";
import UsuarioForm from "./pages/Usuarios/UsuarioForm";

// Gestión de Cursos
import CursosList from "./pages/Cursos/CursosList";
import CursoForm from "./pages/Cursos/CursoForm";
import CourseDetail from "./pages/Cursos/CourseDetail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- RUTA RAÍZ - Redirección --- */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- RUTAS PROTEGIDAS (Dashboard) --- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Página principal del dashboard */}
            <Route index element={<DashboardInicio />} />

            {/* ========== GESTIÓN DE USUARIOS ========== */}
            <Route
              path="usuarios"
              element={
                <DocenteRoute>
                  <UsuariosList />
                </DocenteRoute>
              }
            />
            <Route
              path="usuarios/nuevo"
              element={
                <DocenteRoute>
                  <UsuarioForm />
                </DocenteRoute>
              }
            />
            <Route
              path="usuarios/editar/:id"
              element={
                <DocenteRoute>
                  <UsuarioEdit />
                </DocenteRoute>
              }
            />

            {/* ========== GESTIÓN DE CURSOS ========== */}
            <Route
              path="cursos"
              element={
                <ProtectedRoute>
                  <CursosList />
                </ProtectedRoute>
              }
            />
            <Route
              path="cursos/nuevo"
              element={
                <DocenteRoute>
                  <CursoForm />
                </DocenteRoute>
              }
            />
            <Route
              path="cursos/editar/:id"
              element={
                <DocenteRoute>
                  <CursoForm />
                </DocenteRoute>
              }
            />
            <Route
              path="cursos/:id"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />

            {/* ========== OTRAS RUTAS FUTURAS ========== */}
            {/* Aquí puedes agregar: Inscripciones, Exámenes, Tareas, etc. */}
          </Route>

          {/* --- RUTA 404 - Página no encontrada --- */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
