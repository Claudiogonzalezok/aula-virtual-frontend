// src/pages/Login.js
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await API.post("/usuarios/login", { email, password });
    login(data);
    navigate("/dashboard");
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-xl mb-4">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="border p-2" />
        <input type="password" placeholder="Contraseña"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="border p-2" />
        <button className="bg-blue-500 text-white p-2 rounded">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
