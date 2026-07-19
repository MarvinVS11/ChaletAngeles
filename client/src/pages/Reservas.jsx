import { useState } from 'react';
import api from '../api/client';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  message: '',
};

function Reservas() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    setSubmitting(true);

    try {
      await api.post('/reservations', {
        ...form,
        guests: Number(form.guests),
      });
      setStatus({
        type: 'success',
        message: '¡Reserva enviada con éxito! Te contactaremos para confirmarla.',
      });
      setForm(initialForm);
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg;
      setStatus({
        type: 'error',
        message: apiMessage || 'Ocurrió un error al enviar la reserva. Intentá nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page reservas">
      <div className="page-hero">
        <h1>Reservá tu estadía</h1>
        <p>Completá tus datos y te contactaremos para confirmar disponibilidad.</p>
      </div>
      <form onSubmit={handleSubmit} className="reservation-form">
        <label>
          Nombre completo
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Teléfono
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
        </label>

        <div className="form-row">
          <label>
            Check-in
            <input type="date" name="checkIn" value={form.checkIn} onChange={handleChange} required />
          </label>
          <label>
            Check-out
            <input type="date" name="checkOut" value={form.checkOut} onChange={handleChange} required />
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
          {submitting ? 'Enviando...' : 'Enviar solicitud de reserva'}
        </button>

        {status.type && <p className={`status-message ${status.type}`}>{status.message}</p>}
      </form>

      <p className="description" style={{ marginTop: 24 }}>
        ¿Tenés problemas para completar la reserva desde este formulario?{' '}
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfNUsv-CBeK7bAdPdV6voZPBC3fZNnBbrRsK2bT8lXVGq5JCw/viewform"
          target="_blank"
          rel="noreferrer"
        >
          Probá con este formulario alternativo
        </a>
        .
      </p>
    </div>
  );
}

export default Reservas;
