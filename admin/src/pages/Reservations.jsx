import { useEffect, useState } from 'react';
import api from '../api/client';

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-CR');
}

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  function loadReservations() {
    setLoading(true);
    api
      .get('/reservations')
      .then((res) => setReservations(res.data))
      .catch(() => setError('No se pudieron cargar las reservas.'))
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    try {
      const res = await api.patch(`/reservations/${id}/status`, { status });
      setReservations((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch {
      setError('No se pudo actualizar el estado de la reserva.');
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <p className="status-message">Cargando...</p>;

  return (
    <div className="page">
      <h1>Reservas</h1>
      {error && <p className="status-message error">{error}</p>}

      {reservations.length === 0 ? (
        <p>No hay reservas registradas todavía.</p>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Huésped</th>
                <th>Contacto</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Huéspedes</th>
                <th>Mensaje</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>
                    {r.email}
                    <br />
                    {r.phone}
                  </td>
                  <td>{formatDate(r.checkIn)}</td>
                  <td>{formatDate(r.checkOut)}</td>
                  <td>{r.guests}</td>
                  <td>{r.message || '—'}</td>
                  <td>
                    <select
                      value={r.status}
                      disabled={updatingId === r._id}
                      onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Reservations;
