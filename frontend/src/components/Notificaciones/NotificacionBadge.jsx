// frontend/src/components/Notificaciones/NotificacionBadge.jsx
import { useContext } from "react";
import { Badge, Dropdown } from "react-bootstrap";
import { FaBell } from "react-icons/fa";
import { Link } from "react-router-dom";
import { NotificacionContext } from "../../context/NotificacionContext";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const NotificacionBadge = () => {
  const { notificaciones, noLeidas } = useContext(NotificacionContext);

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" className="position-relative text-white">
        <FaBell size={20} />
        {noLeidas > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
          >
            {noLeidas > 99 ? "99+" : noLeidas}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: "350px", maxHeight: "400px", overflowY: "auto" }}>
        <Dropdown.Header>
          <div className="d-flex justify-content-between align-items-center">
            <span>Notificaciones</span>
            <Link to="/dashboard/notificaciones" className="small">
              Ver todas
            </Link>
          </div>
        </Dropdown.Header>
        
        {notificaciones.length === 0 ? (
          <Dropdown.ItemText className="text-center text-muted py-4">
            No hay notificaciones
          </Dropdown.ItemText>
        ) : (
          notificaciones.slice(0, 5).map((notif) => (
            <Dropdown.Item
              key={notif._id}
              as={Link}
              to={notif.enlace || "/dashboard"}
              className={!notif.leida ? "bg-light" : ""}
            >
              <div className="d-flex">
                <div className="flex-grow-1">
                  <div className="fw-bold">{notif.titulo}</div>
                  <small className="text-muted">{notif.mensaje}</small>
                  <br />
                  <small className="text-muted">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </small>
                </div>
                {!notif.leida && (
                  <Badge bg="primary" pill className="ms-2">
                    Nueva
                  </Badge>
                )}
              </div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificacionBadge;