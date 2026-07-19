import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  message: '',
  status: 'confirmed',
};

function NewReservation() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    setSubmitting(true);

    try {
      await api.post('/reservations/admin', {
        ...form,
        guests: Number(form.guests),
      });
      setStatus({
        type: 'success',
        message: 'Reserva cargada correctamente. Se le envió un correo al cliente avisándole.',
      });
      setForm(initialForm);
      setTimeout(() => navigate('/reservas'), 1200);
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg;
      setStatus({
        type: 'error',
        message: apiMessage || 'Ocurrió un error al cargar la reserva.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Cargar reserva manual</h1>
      <p className="description">
        Usá este formulario cuando un cliente pida reservar por WhatsApp u otro medio. Al guardar,
        se le envía un correo automático avisándole el estado de su reserva.
      </p>

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
            Estado inicial
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </label>
        </div>

        <label>
          Mensaje / notas (opcional)
          <textarea name="message" value={form.message} onChange={handleChange} rows="4" />
        </label>

        {status.type && <p className={`status-message ${status.type}`}>{status.message}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Cargar reserva'}
        </button>
      </form>
    </div>
  );
}

export default NewReservation;
