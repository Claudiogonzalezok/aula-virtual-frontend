import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import API from "../../services/api";

const ModalClase = ({ show, onHide, curso, claseEditar, onSuccess }) => {
  const [errores, setErrores] = useState([]);
  const [form, setForm] = useState({
    fecha: "",
    horaInicio: "",
    horaFin: "",
    tipo: "virtual",
    enlaceReunion: "",
    contenido: "",
  });

  useEffect(() => {
    if (claseEditar) {
      setForm({
        fecha: claseEditar.fecha?.split("T")[0] || "",
        horaInicio: claseEditar.horario?.inicio || "",
        horaFin: claseEditar.horario?.fin || "",
        tipo: claseEditar.ubicacion?.tipo || "virtual",
        enlaceReunion: claseEditar.ubicacion?.enlace || "",
        contenido: claseEditar.contenido || "",
      });
    } else {
      setForm({
        fecha: "",
        horaInicio: "",
        horaFin: "",
        tipo: "virtual",
        enlaceReunion: "",
        contenido: "",
      });
    }
    setErrores([]);
  }, [claseEditar, show]);

  if (!curso) return null;

  const guardar = async (e) => {
    e.preventDefault();

    const payload = {
      fecha: form.fecha,
      horario: {
        inicio: form.horaInicio,
        fin: form.horaFin,
      },
      ubicacion: {
        tipo: form.tipo,
        enlace: form.enlaceReunion || null,
      },
      contenido: form.contenido,
      cursoId: curso._id,
    };

    try {
      if (claseEditar) {
        await API.put(`/clases/${claseEditar._id}`, payload);
      } else {
        await API.post("/clases", payload);
      }
      onSuccess();
      onHide();
    } catch (error) {
      setErrores(["Error al guardar la clase"]);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {claseEditar ? "Editar Clase" : "Nueva Clase"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {errores.length > 0 && (
          <Alert variant="danger">
            {errores.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </Alert>
        )}

        <Form onSubmit={guardar}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha *</Form.Label>
                <Form.Control
                  type="date"
                  value={form.fecha}
                  onChange={(e) =>
                    setForm({ ...form, fecha: e.target.value })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Hora inicio *</Form.Label>
                <Form.Control
                  type="time"
                  value={form.horaInicio}
                  onChange={(e) =>
                    setForm({ ...form, horaInicio: e.target.value })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Hora fin *</Form.Label>
                <Form.Control
                  type="time"
                  value={form.horaFin}
                  onChange={(e) =>
                    setForm({ ...form, horaFin: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value })
              }
            >
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
              <option value="hibrida">Híbrida</option>
            </Form.Select>
          </Form.Group>

          {(form.tipo === "virtual" || form.tipo === "hibrida") && (
            <Form.Group className="mb-3">
              <Form.Label>Enlace *</Form.Label>
              <Form.Control
                type="url"
                value={form.enlaceReunion}
                onChange={(e) =>
                  setForm({ ...form, enlaceReunion: e.target.value })
                }
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Contenido</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.contenido}
              onChange={(e) =>
                setForm({ ...form, contenido: e.target.value })
              }
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button type="submit" variant="success">
              {claseEditar ? "Actualizar" : "Crear"}
            </Button>
            <Button variant="secondary" onClick={onHide}>
              Cancelar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ModalClase;
