// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Cursos from "./pages/Cursos";
import CrearCurso from "./pages/CrearCurso";
import DocenteRoute from "./components/DocenteRoute";
import Inscripciones from "./pages/Inscripciones";
import Clases from "./pages/Clases";
import CrearExamen from "./pages/CrearExamen";
import ListaExamenes from "./pages/ListaExamenes";
import RendirExamen from "./pages/RendirExamen";
function App() {
  return (
    <AuthProvider>
      
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/cursos" element={
            <ProtectedRoute><Cursos /></ProtectedRoute>
          } />
          <Route path="/crear-curso"
            element={
              <ProtectedRoute>
                <DocenteRoute>
                  <CrearCurso />
                </DocenteRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/inscripciones"
            element={
              <ProtectedRoute>
                <DocenteRoute>
                  <Inscripciones />
                </DocenteRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/cursos/:cursoId/examenes/nuevo"
            element={
              <ProtectedRoute>
                <CrearExamen />
              </ProtectedRoute>
            }
          />
          <Route path="/cursos/:cursoId/examenes" element={<ListaExamenes />} />

          <Route path="/examenes/:examenId/rendir"
            element={
              <ProtectedRoute>
                <RendirExamen />
              </ProtectedRoute>
            }
          />          
          <Route path="/cursos/:cursoId/clases"
            element={
              <ProtectedRoute>
                <Clases />
              </ProtectedRoute>
            }
          />
          
        </Routes>
    
    </AuthProvider>
  );
}

export default App;