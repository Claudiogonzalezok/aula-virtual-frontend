// src/components/DashboardLayout.js
import { Link, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Aula Virtual</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/cursos" className="hover:bg-gray-700 p-2 rounded">Cursos</Link>
          <Link to="/mis-notas" className="hover:bg-gray-700 p-2 rounded">Mis Notas</Link>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
