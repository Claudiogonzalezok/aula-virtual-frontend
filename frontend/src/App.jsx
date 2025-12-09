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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";
import DashboardInicio from "./pages/DashboardInicio";

// Gestión de Usuarios
import UsuariosList from "./pages/Usuarios/UsuariosList";
import UsuarioEdit from "./pages/Usuarios/UsuarioEdit";
import UsuarioForm from "./pages/Usuarios/UsuarioForm";

// Gestión de Cursos
import CursosList from "./pages/Cursos/CursosList";
import CursoForm from "./pages/Cursos/CursoForm";
import CourseDetail from "./pages/Cursos/CourseDetail";

// Gestión de Clases
import MisClases from "./pages/Clases/MisClases";

// Gestión de Exámenes
import ListaExamenes from "./pages/Examenes/ListaExamenes";
import FormularioExamen from "./pages/Examenes/FormularioExamen";
import RealizarExamen from "./pages/Examenes/RealizarExamen";
import EstadisticasExamen from "./pages/Examenes/EstadisticasExamen";
import CalificarExamen from "./pages/Examenes/CalificarExamen";
import VerIntento from "./pages/Examenes/VerIntento";
import DetalleExamen from "./pages/Examenes/DetalleExamen";

// 🆕 Gestión de Tareas
import TareasDocente from "./pages/Tareas/TareasDocente";
import TareasAlumno from "./pages/Tareas/TareasAlumno";
import CrearEditarTarea from "./pages/Tareas/CrearTarea";
import DetalleTarea from "./pages/Tareas/DetalleTarea";
import CalificarEntregas from "./pages/Tareas/CalificarEntrega";

// Gestion de reportes, comunicacion y notificaciones
import ReportesGeneral from "./pages/Reportes/ReportesGeneral";
import Foros from "./pages/Comunicacion/Foros";
import ForoDetalle from "./pages/Comunicacion/ForoDetalle";
import Mensajes from "./pages/Comunicacion/Mensajes";
import CentroNotificaciones from "./pages/Notificaciones/CentroNotificaciones";

// Gestion de calificaciones
import CalificacionesAlumnos from "./pages/Calificaciones/CalificacionesAlumnos";

// Gestion de notas
import MisNotas from "./pages/Notas/MisNotas";
//Gestion de Perfil
import Perfil from "./pages/Perfil/Perfil";

//Gestion de inscripciones
import SolicitarInscripcion from "./pages/Inscripciones/SolicitarInscripcion";
import GestionSolicitudes from "./pages/Inscripciones/GestionSolicitudes";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
      <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  return (    
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- RUTA RAÍZ - Redirección --- */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* 🆕 NUEVAS RUTAS DE VERIFICACIÓN */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerification />} />

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

            {/* ========== GESTIÓN DE CLASES ========== */}
            <Route
              path="clases"
              element={
                <ProtectedRoute>
                  <MisClases />
                </ProtectedRoute>
              }
            />

            {/* ========== GESTIÓN DE EXÁMENES ========== */}
            {/* Lista de exámenes - Todos los roles */}
            <Route
              path="examenes"
              element={
                <ProtectedRoute>
                  <ListaExamenes />
                </ProtectedRoute>
              }
            />

            {/* Crear examen - Solo docentes/admin */}
            <Route
              path="examenes/crear"
              element={
                <DocenteRoute>
                  <FormularioExamen />
                </DocenteRoute>
              }
            />

            {/* Ver examen - detalle de examen */}

            <Route 
              path="examenes/:id"
              element={
                <DetalleExamen />
              } 
            />

            {/* Editar examen - Solo docentes/admin */}
            <Route
              path="examenes/:id/editar"
              element={
                <DocenteRoute>
                  <FormularioExamen />
                </DocenteRoute>
              }
            />

            {/* Realizar examen - Alumnos */}
            <Route
              path="examenes/:id/realizar"
              element={
                <ProtectedRoute>
                  <RealizarExamen />
                </ProtectedRoute>
              }
            />

            {/* Estadísticas - Solo docentes/admin */}
            <Route
              path="examenes/:id/estadisticas"
              element={
                <DocenteRoute>
                  <EstadisticasExamen />
                </DocenteRoute>
              }
            />

            {/* Calificar intento - Solo docentes/admin */}
            <Route
              path="examenes/:id/intento/:intentoId/calificar"
              element={
                <DocenteRoute>
                  <CalificarExamen />
                </DocenteRoute>
              }
            />

            {/* Ver intento - Todos (alumno ve solo los suyos) */}
            <Route
              path="examenes/:id/intento/:intentoId/ver"
              element={
                <ProtectedRoute>
                  <VerIntento />
                </ProtectedRoute>
              }
            />

            {/* ========== 🆕 GESTIÓN DE TAREAS ========== */}
            
            {/* Lista de tareas - Docentes/Admin */}
            <Route
              path="tareas"
              element={
                <DocenteRoute>
                  <TareasDocente />
                </DocenteRoute>
              }
            />

            {/* Crear tarea - Solo docentes/admin */}
            <Route
              path="tareas/crear"
              element={
                <DocenteRoute>
                  <CrearEditarTarea />
                </DocenteRoute>
              }
            />

            {/* Editar tarea - Solo docentes/admin */}
            <Route
              path="tareas/editar/:id"
              element={
                <DocenteRoute>
                  <CrearEditarTarea />
                </DocenteRoute>
              }
            />

            {/* Calificar entregas - Solo docentes/admin */}
            <Route
              path="tareas/:id/calificar"
              element={
                <DocenteRoute>
                  <CalificarEntregas />
                </DocenteRoute>
              }
            />

            {/* Mis tareas (vista alumno) */}
            <Route
              path="mis-tareas"
              element={
                <ProtectedRoute>
                  <TareasAlumno />
                </ProtectedRoute>
              }
            />

            {/* Detalle de tarea - Todos los roles */}
            <Route
              path="tareas/:id"
              element={
                <ProtectedRoute>
                  <DetalleTarea />
                </ProtectedRoute>
              }
            />

            {/* Gestion de reportes mensajes y comunicaciones */}
          <Route path="reportes" element={<DocenteRoute><ReportesGeneral /></DocenteRoute>} />
          <Route path="foros/:cursoId" element={<ProtectedRoute><Foros /></ProtectedRoute>} />
          <Route path="foros/:id/detalle" element={<ProtectedRoute><ForoDetalle /></ProtectedRoute>} />
          <Route path="mensajes" element={<ProtectedRoute><Mensajes /></ProtectedRoute>} />
          <Route path="notificaciones" element={<ProtectedRoute><CentroNotificaciones /></ProtectedRoute>} />

                    {/* ========== CALIFICACIONES DE ALUMNOS ========== */}
          <Route
            path="calificaciones"
            element={
              <DocenteRoute>
                <CalificacionesAlumnos />
              </DocenteRoute>
            }
          />

          <Route path="notas" element={<ProtectedRoute><MisNotas /></ProtectedRoute>} />

          <Route path="perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />

                    // Rutas:
          <Route path="inscripcion" element={<ProtectedRoute><SolicitarInscripcion /></ProtectedRoute>} />
          <Route path="solicitudes-inscripcion" element={<ProtectedRoute><GestionSolicitudes /></ProtectedRoute>} />

            {/* ========== OTRAS RUTAS FUTURAS ========== */}
            {/* Aquí puedes agregar: Notas, Foros, etc. */}
          </Route>

          {/* --- RUTA 404 - Página no encontrada --- */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;