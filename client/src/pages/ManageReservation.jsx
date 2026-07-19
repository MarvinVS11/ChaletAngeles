import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { contact } from '../data/content';

const statusLabels = {
  pending: 'Pendiente de confirmación',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
};

function toDateInput(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function ManageReservation() {
  const { token } = useParams();
  const [reservation, setReservation] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function load() {
    setLoading(true);
    api
      .get(`/reservations/manage/${token}`)
      .then((res) => {
        setReservation(res.data);
        setForm({
          phone: res.data.phone,
          checkIn: toDateInput(res.data.checkIn),
          checkOut: toDateInput(res.data.checkOut),
          guests: res.data.guests,
          message: res.data.message || '',
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    setSubmitting(true);

    try {
      const res = await api.put(`/reservations/manage/${token}`, {
        ...form,
        guests: Number(form.guests),
      });
      setReservation(res.data);
      setStatus({
        type: 'success',
        message: 'Tu reserva se actualizó y quedó pendiente de reconfirmación. Te avisaremos por correo.',
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'No se pudo actualizar la reserva.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('¿Seguro que querés cancelar tu reserva? Esta acción no se puede deshacer.')) {
      return;
    }

    setStatus({ type: null, message: '' });
    setSubmitting(true);

    try {
      const res = await api.post(`/reservations/manage/${token}/cancel`);
      setReservation((prev) => ({ ...prev, status: res.data.status, editable: false }));
      setStatus({ type: 'success', message: 'Tu reserva fue cancelada.' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'No se pudo cancelar la reserva.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="status-message">Cargando...</p>;

  if (notFound) {
    return (
      <div className="page">
        <div className="page-hero">
          <h1>Mi reserva</h1>
          <p>No encontramos ninguna reserva con ese enlace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Mi reserva</h1>
        <p>Hola {reservation.name}, acá podés revisar el estado de tu reserva.</p>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h2>Estado</h2>
          <p>{statusLabels[reservation.status]}</p>
        </div>
        <div className="info-card">
          <h2>Huéspedes</h2>
          <p>{reservation.guests}</p>
        </div>
      </div>

      {status.type && <p className={`status-message ${status.type}`}>{status.message}</p>}

      {reservation.editable ? (
        <form onSubmit={handleSubmit} className="reservation-form">
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
            Mensaje (opcional)
            <textarea name="message" value={form.message} onChange={handleChange} rows="4" />
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            disabled={submitting}
            onClick={handleCancel}
          >
            Cancelar mi reserva
          </button>
        </form>
      ) : (
        <div className="status-message error">
          <p>
            {reservation.status === 'cancelled'
              ? 'Esta reserva ya está cancelada.'
              : 'Esta reserva ya no se puede modificar online porque faltan menos de 48 horas para el check-in.'}
          </p>
          <p>Si necesitás hacer un cambio, escribinos directamente:</p>
          <a className="btn-secondary" href={contact.whatsappUrl} target="_blank" rel="noreferrer">
            Contactar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

export default ManageReservation;
