import { useEffect, useState } from 'react';
import api from '../api/client';
import { fileToDataUrl, estimatePayloadSize, MAX_PAYLOAD_BYTES } from '../utils/fileToDataUrl';

const emptyForm = {
  title: '',
  description: '',
  location: '',
  pricePerNight: '',
  maxGuests: '',
  amenities: '',
  rules: '',
  image: '',
  secondaryTitle: '',
  secondaryText: '',
  secondaryImage: '',
};

function toForm(info) {
  return {
    title: info.title || '',
    description: info.description || '',
    location: info.location || '',
    pricePerNight: info.pricePerNight ?? '',
    maxGuests: info.maxGuests ?? '',
    amenities: (info.amenities || []).join('\n'),
    rules: (info.rules || []).join('\n'),
    image: info.image || '',
    secondaryTitle: info.secondaryTitle || 'Un lugar para todos',
    secondaryText: info.secondaryText || '',
    secondaryImage: info.secondaryImage || '',
  };
}

function ChaletEditor() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  useEffect(() => {
    api
      .get('/chalet')
      .then((res) => setForm(toForm(res.data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImage(file) {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleSecondaryImage(file) {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, secondaryImage: dataUrl }));
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      amenities: form.amenities.split('\n').map((s) => s.trim()).filter(Boolean),
      rules: form.rules.split('\n').map((s) => s.trim()).filter(Boolean),
      image: form.image,
      secondaryTitle: form.secondaryTitle,
      secondaryText: form.secondaryText,
      secondaryImage: form.secondaryImage,
    };

    const size = estimatePayloadSize(payload);
    if (size > MAX_PAYLOAD_BYTES) {
      setStatus({
        type: 'error',
        message: `La imagen pesa demasiado (${(size / (1024 * 1024)).toFixed(1)}MB). Probá con otra foto.`,
      });
      return;
    }

    setSaving(true);

    try {
      await api.put('/chalet', payload);
      setStatus({ type: 'success', message: 'Información actualizada correctamente.' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'No se pudo guardar la información.',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="status-message">Cargando...</p>;

  return (
    <div className="page">
      <h1>Información del chalet</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Título
          <input type="text" name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          Ubicación
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Descripción
          <textarea name="description" value={form.description} onChange={handleChange} rows="4" required />
        </label>

        <div className="form-row">
          <label>
            Precio por noche
            <input
              type="number"
              name="pricePerNight"
              min="0"
              value={form.pricePerNight}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Capacidad máxima
            <input
              type="number"
              name="maxGuests"
              min="1"
              value={form.maxGuests}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label>
          Imagen de la sección "Acerca del Chalet"
          <input type="file" accept="image/*" onChange={(e) => handleImage(e.target.files[0])} />
        </label>
        {form.image && <img className="card-list-preview" src={form.image} alt="" />}

        <fieldset>
          <legend>Página "Acerca del Chalet" — segundo bloque</legend>

          <label>
            Título
            <input
              type="text"
              name="secondaryTitle"
              value={form.secondaryTitle}
              onChange={handleChange}
            />
          </label>

          <label>
            Texto
            <textarea
              name="secondaryText"
              value={form.secondaryText}
              onChange={handleChange}
              rows="4"
            />
          </label>

          <label>
            Imagen
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleSecondaryImage(e.target.files[0])}
            />
          </label>
          {form.secondaryImage && (
            <img className="card-list-preview" src={form.secondaryImage} alt="" />
          )}
        </fieldset>

        <label>
          Comodidades (una por línea)
          <textarea name="amenities" value={form.amenities} onChange={handleChange} rows="6" />
        </label>

        <label>
          Reglas de la casa (una por línea)
          <textarea name="rules" value={form.rules} onChange={handleChange} rows="4" />
        </label>

        {status.type && <p className={`status-message ${status.type}`}>{status.message}</p>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

export default ChaletEditor;
