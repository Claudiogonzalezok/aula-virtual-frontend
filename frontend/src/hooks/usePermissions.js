// src/hooks/usePermissions.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const usePermissions = () => {
  const { usuario } = useContext(AuthContext);

  const permissions = {
    // Gestión de usuarios
    canManageUsers: usuario?.rol === "admin",
    
    // Gestión de cursos
    canCreateCourse: ["admin", "docente"].includes(usuario?.rol),
    canEditCourse: (cursoDocenteId) => {
      if (usuario?.rol === "admin") return true;
      if (usuario?.rol === "docente") {
        return cursoDocenteId === usuario._id;
      }
      return false;
    },
    canDeleteCourse: usuario?.rol === "admin",
    
    // Gestión de inscripciones
    canManageInscriptions: usuario?.rol === "admin",
    
    // Gestión de clases
    canManageClasses: (cursoDocenteId) => {
      if (usuario?.rol === "admin") return true;
      if (usuario?.rol === "docente") {
        return cursoDocenteId === usuario._id;
      }
      return false;
    },
    
    // Ver alumnos
    canViewStudents: (cursoDocenteId) => {
      if (usuario?.rol === "admin") return true;
      if (usuario?.rol === "docente") {
        return cursoDocenteId === usuario._id;
      }
      return false;
    },
    
    // Gestión de exámenes y notas
    canManageExams: (cursoDocenteId) => {
      if (usuario?.rol === "admin") return true;
      if (usuario?.rol === "docente") {
        return cursoDocenteId === usuario._id;
      }
      return false;
    },
    
    // Gestión de materiales
    canManageMaterials: (cursoDocenteId) => {
      if (usuario?.rol === "admin") return true;
      if (usuario?.rol === "docente") {
        return cursoDocenteId === usuario._id;
      }
      return false;
    },
    
    // Realizar exámenes y tareas
    canTakeExams: usuario?.rol === "alumno",
    canSubmitTasks: usuario?.rol === "alumno",
    
    // Ver reportes
    canViewReports: ["admin", "docente"].includes(usuario?.rol),
  };

  return permissions;
};