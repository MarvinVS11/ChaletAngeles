import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

function toDateInput(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function EditReservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/reservations')
      .then((res) => {
        const reservation = res.data.find((r) => r._id === id);
        if (!reservation) {
          setStatus({ type: 'error', message: 'No se encontró la reserva.' });
          return;
        }
        setForm({
          name: reservation.name,
          email: reservation.email,
          phone: reservation.phone,
          checkIn: toDateInput(reservation.checkIn),
          checkOut: toDateInput(reservation.checkOut),
          guests: reservation.guests,
          message: reservation.message || '',
          status: reservation.status,
        });
      })
      .catch(() => setStatus({ type: 'error', message: 'No se pudo cargar la reserva.' }))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    setSubmitting(true);

    try {
      await api.put(`/reservations/${id}`, {
        ...form,
        guests: Number(form.guests),
      });
      setStatus({ type: 'success', message: 'Reserva actualizada correctamente.' });
      setTimeout(() => navigate('/reservas'), 1000);
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg;
      setStatus({ type: 'error', message: apiMessage || 'Ocurrió un error al guardar los cambios.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="status-message">Cargando...</p>;

  if (!form) {
    return (
      <div className="page">
        <h1>Editar reserva</h1>
        <p className="status-message error">{status.message}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Editar reserva</h1>

      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Nombre completo
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Email del cliente
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Teléfono
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
        </label>

        <div className="form-row">
          <label>
            Check-in
            <input
              type="date"
              name="checkIn"
              value={form.checkIn}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Check-out
            <input
              type="date"
              name="checkOut"
              value={form.checkOut}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Huéspedes
            <input
              type="number"
              name="guests"
              min="1"
              value={form.guests}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Estado
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </label>
        </div>

        <label>
          Mensaje / notas
          <textarea name="message" value={form.message} onChange={handleChange} rows="4" />
        </label>

        {status.type && <p className={`status-message ${status.type}`}>{status.message}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/reservas')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditReservation;
