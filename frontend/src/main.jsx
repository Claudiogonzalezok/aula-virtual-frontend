// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { NotificacionProvider } from "./context/NotificacionContext"; // 🆕
import { ToastContainer } from 'react-toastify'; // 🆕
import 'react-toastify/dist/ReactToastify.css'; // 🆕
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificacionProvider> {/* 🆕 Envolver con NotificacionProvider */}
        <App />
        <ToastContainer /> {/* 🆕 Agregar ToastContainer */}
      </NotificacionProvider>
    </AuthProvider>
  </React.StrictMode>
);
