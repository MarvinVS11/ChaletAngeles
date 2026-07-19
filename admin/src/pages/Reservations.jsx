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
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  function loadReservations() {
    setLoading(true);
    api
      .get('/reservations')
      .then((res) => {
        setReservations(res.data);
        setDrafts(Object.fromEntries(res.data.map((r) => [r._id, r.status])));
      })
      .catch(() => setError('No se pudieron cargar las reservas.'))
      .finally(() => setLoading(false));
  }

  function handleDraftChange(id, status) {
    setDrafts((prev) => ({ ...prev, [id]: status }));
    setSavedId(null);
  }

  async function handleSave(id) {
    setError('');
    setSavingId(id);
    try {
      const res = await api.patch(`/reservations/${id}/status`, { status: drafts[id] });
      setReservations((prev) => prev.map((r) => (r._id === id ? res.data : r)));
      setSavedId(id);
      setTimeout(() => setSavedId((current) => (current === id ? null : current)), 2500);
    } catch {
      setError('No se pudo actualizar el estado de la reserva. El cliente no fue notificado.');
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <p className="status-message">Cargando...</p>;

  return (
    <div className="page">
      <h1>Reservas</h1>
      <p className="description">
        Al guardar un cambio de estado, se le envía un correo automático al cliente avisándole.
      </p>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const dirty = drafts[r._id] !== r.status;
                return (
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
                        value={drafts[r._id] ?? r.status}
                        disabled={savingId === r._id}
                        onChange={(e) => handleDraftChange(r._id, e.target.value)}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={!dirty || savingId === r._id}
                        onClick={() => handleSave(r._id)}
                      >
                        {savingId === r._id ? 'Guardando...' : 'Guardar'}
                      </button>
                      {savedId === r._id && <span className="saved-hint">✓ Notificado</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Reservations;
