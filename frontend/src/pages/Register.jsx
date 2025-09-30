// src/pages/Register.js
import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/usuarios/register", form);
    navigate("/login");
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-xl mb-4">Registro</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="border p-2" />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2" />
        <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} className="border p-2" />
        <button className="bg-green-500 text-white p-2 rounded">Registrarse</button>
      </form>
    </div>
  );
};

export default Register;
