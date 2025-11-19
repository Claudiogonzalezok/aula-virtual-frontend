// frontend/src/components/Reportes/GraficoRendimiento.jsx
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "react-bootstrap";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const GraficoRendimiento = ({ datos, tipo = "linea", titulo }) => {
  const renderGrafico = () => {
    switch (tipo) {
      case "linea":
        return (
          <LineChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="promedio" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        );
      
      case "barras":
        return (
          <BarChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad" fill="#82ca9d" />
          </BarChart>
        );
      
      case "torta":
        return (
          <PieChart>
            <Pie
              data={datos}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ nombre, porcentaje }) => `${nombre}: ${porcentaje}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="valor"
            >
              {datos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">{titulo}</h5>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          {renderGrafico()}
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default GraficoRendimiento;