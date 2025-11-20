// frontend/src/components/Comunicacion/FormAnuncio.jsx
import { useState, useEffect } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { crearAnuncio, actualizarAnuncio } from "../../services/anuncioService";

const FormAnuncio = ({ cursoId, anuncioEditar, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    prioridad: "normal",
    fijado: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (anuncioEditar) {
      setFormData({
        titulo: anuncioEditar.titulo || "",
        contenido: anuncioEditar.contenido || "",
        prioridad: anuncioEditar.prioridad || "normal",
        fijado: anuncioEditar.fijado || false,
      });
    }
  }, [anuncioEditar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const dataToSend = { ...formData, cursoId };

      if (anuncioEditar) {
        await actualizarAnuncio(anuncioEditar._id, dataToSend);
      } else {
        await crearAnuncio(dataToSend);
      }

      // Reset form
      setFormData({
        titulo: "",
        contenido: "",
        prioridad: "normal",
        fijado: false,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.msg || "Error al guardar el anuncio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Título *</Form.Label>
            <Form.Control
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              placeholder="Título del anuncio"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contenido *</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="contenido"
              value={formData.contenido}
              onChange={handleChange}
              required
              placeholder="Escribe el contenido del anuncio..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prioridad</Form.Label>
            <Form.Select
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
            >
              <option value="baja">Baja</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="fijado"
              label="Fijar anuncio (se mostrará destacado)"
              checked={formData.fijado}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? "Guardando..."
                : anuncioEditar
                ? "Actualizar"
                : "Publicar"}
            </Button>
            {onCancel && (
              <Button variant="secondary" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormAnuncio;