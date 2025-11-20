// frontend/src/components/Reportes/ExportarReporte.jsx
import { Button, Dropdown, Spinner } from "react-bootstrap";
import { FaDownload, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const ExportarReporte = ({ datos, nombreArchivo = "reporte", tipo = "completo" }) => {
  const [exportando, setExportando] = useState(false);

  const exportarPDF = () => {
    setExportando(true);
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text(`Reporte - ${nombreArchivo}`, 14, 22);

      // Fecha
      doc.setFontSize(11);
      doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30);

      // Contenido según tipo de datos
      if (Array.isArray(datos)) {
        // Si es un array, crear tabla
        const headers = Object.keys(datos[0] || {});
        const rows = datos.map((item) => headers.map((key) => item[key]));

        doc.autoTable({
          startY: 40,
          head: [headers],
          body: rows,
        });
      } else if (typeof datos === "object") {
        // Si es un objeto, mostrar pares clave-valor
        const entries = Object.entries(datos);
        const rows = entries.map(([key, value]) => [key, String(value)]);

        doc.autoTable({
          startY: 40,
          head: [["Campo", "Valor"]],
          body: rows,
        });
      }

      doc.save(`${nombreArchivo}.pdf`);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert("Error al exportar PDF");
    } finally {
      setExportando(false);
    }
  };

  const exportarExcel = () => {
    setExportando(true);
    try {
      let ws;

      if (Array.isArray(datos)) {
        ws = XLSX.utils.json_to_sheet(datos);
      } else if (typeof datos === "object") {
        const entries = Object.entries(datos).map(([key, value]) => ({
          Campo: key,
          Valor: String(value),
        }));
        ws = XLSX.utils.json_to_sheet(entries);
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");

      XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      alert("Error al exportar Excel");
    } finally {
      setExportando(false);
    }
  };

  const exportarCSV = () => {
    setExportando(true);
    try {
      let ws;

      if (Array.isArray(datos)) {
        ws = XLSX.utils.json_to_sheet(datos);
      } else if (typeof datos === "object") {
        const entries = Object.entries(datos).map(([key, value]) => ({
          Campo: key,
          Valor: String(value),
        }));
        ws = XLSX.utils.json_to_sheet(entries);
      }

      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${nombreArchivo}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al exportar CSV:", error);
      alert("Error al exportar CSV");
    } finally {
      setExportando(false);
    }
  };

  if (exportando) {
    return (
      <Button variant="secondary" disabled>
        <Spinner animation="border" size="sm" className="me-2" />
        Exportando...
      </Button>
    );
  }

  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary">
        <FaDownload className="me-2" />
        Exportar
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={exportarPDF}>
          <FaFilePdf className="me-2 text-danger" />
          Exportar como PDF
        </Dropdown.Item>
        <Dropdown.Item onClick={exportarExcel}>
          <FaFileExcel className="me-2 text-success" />
          Exportar como Excel
        </Dropdown.Item>
        <Dropdown.Item onClick={exportarCSV}>
          <FaFileExcel className="me-2 text-info" />
          Exportar como CSV
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ExportarReporte;