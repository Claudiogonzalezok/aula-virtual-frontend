// frontend/src/components/Reportes/TablaCalificaciones.jsx
import { Table, Badge, Card } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const TablaCalificaciones = ({ calificaciones, mostrarPromedio = true }) => {
  const obtenerColorNota = (nota) => {
    if (nota >= 90) return "success";
    if (nota >= 70) return "primary";
    if (nota >= 60) return "warning";
    return "danger";
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case "aprobado":
        return <FaCheckCircle className="text-success" />;
      case "reprobado":
        return <FaTimesCircle className="text-danger" />;
      case "pendiente":
        return <FaClock className="text-warning" />;
      default:
        return null;
    }
  };

  const calcularPromedio = () => {
    if (!calificaciones || calificaciones.length === 0) return 0;
    const suma = calificaciones.reduce((acc, cal) => acc + (cal.nota || 0), 0);
    return (suma / calificaciones.length).toFixed(2);
  };

  if (!calificaciones || calificaciones.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <p className="text-muted mb-0">No hay calificaciones disponibles</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">📊 Calificaciones</h5>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table striped hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Evaluación</th>
                <th>Tipo</th>
                <th className="text-center">Calificación</th>
                <th className="text-center">Estado</th>
                <th>Fecha</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {calificaciones.map((cal, index) => (
                <tr key={cal._id || index}>
                  <td className="fw-bold">
                    {cal.nombre || cal.evaluacion || "Sin nombre"}
                  </td>
                  <td>
                    <Badge bg="secondary">{cal.tipo || "N/A"}</Badge>
                  </td>
                  <td className="text-center">
                    <Badge
                      bg={obtenerColorNota(cal.nota)}
                      className="fs-6 px-3 py-2"
                    >
                      {cal.nota ? cal.nota.toFixed(2) : "N/A"}
                    </Badge>
                  </td>
                  <td className="text-center">
                    {obtenerIconoEstado(cal.estado)}
                    <span className="ms-2">
                      {cal.estado === "aprobado"
                        ? "Aprobado"
                        : cal.estado === "reprobado"
                        ? "Reprobado"
                        : "Pendiente"}
                    </span>
                  </td>
                  <td>
                    {cal.fecha
                      ? new Date(cal.fecha).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <small className="text-muted">
                      {cal.observaciones || "-"}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
            {mostrarPromedio && (
              <tfoot className="table-light">
                <tr>
                  <td colSpan="2" className="fw-bold text-end">
                    PROMEDIO GENERAL:
                  </td>
                  <td className="text-center">
                    <Badge
                      bg={obtenerColorNota(calcularPromedio())}
                      className="fs-6 px-3 py-2"
                    >
                      {calcularPromedio()}
                    </Badge>
                  </td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            )}
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TablaCalificaciones;