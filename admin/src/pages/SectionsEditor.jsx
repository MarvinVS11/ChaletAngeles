import { useEffect, useState } from 'react';
import api from '../api/client';
import CardListField from '../components/CardListField';
import { fileToDataUrl, estimatePayloadSize, MAX_PAYLOAD_BYTES } from '../utils/fileToDataUrl';

const emptyForm = {
  activities: [],
  zoneOptions: [],
  gastronomyIntro: '',
  gastronomyItems: '',
  gastronomyImage: '',
};

function toForm(content) {
  return {
    activities: content.activities || [],
    zoneOptions: content.zoneOptions || [],
    gastronomyIntro: content.gastronomyIntro || '',
    gastronomyItems: (content.gastronomyItems || []).join('\n'),
    gastronomyImage: content.gastronomyImage || '',
  };
}

function SectionsEditor() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  useEffect(() => {
    api
      .get('/site-content')
      .then((res) => setForm(toForm(res.data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleGastronomyImage(file) {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, gastronomyImage: dataUrl }));
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    const payload = {
      activities: form.activities,
      zoneOptions: form.zoneOptions,
      gastronomyIntro: form.gastronomyIntro,
      gastronomyItems: form.gastronomyItems
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      gastronomyImage: form.gastronomyImage,
    };

    const size = estimatePayloadSize(payload);
    if (size > MAX_PAYLOAD_BYTES) {
      setStatus({
        type: 'error',
        message: `El conjunto de imágenes pesa ${(size / (1024 * 1024)).toFixed(1)}MB, supera el máximo permitido (${(MAX_PAYLOAD_BYTES / (1024 * 1024)).toFixed(1)}MB). Quitá o reemplazá alguna foto e intentá de nuevo.`,
      });
      return;
    }

    setSaving(true);

    try {
      await api.put('/site-content', payload);
      setStatus({ type: 'success', message: 'Secciones actualizadas correctamente.' });
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
      <h1>Secciones del sitio</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <CardListField
          label="Actividades en Sueños de Ángeles"
          items={form.activities}
          onChange={(activities) => setForm((prev) => ({ ...prev, activities }))}
        />

        <CardListField
          label="Opciones en la zona"
          items={form.zoneOptions}
          onChange={(zoneOptions) => setForm((prev) => ({ ...prev, zoneOptions }))}
        />

        <fieldset>
          <legend>Gastronomía</legend>

          <label>
            Imagen
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleGastronomyImage(e.target.files[0])}
            />
          </label>
          {form.gastronomyImage && (
            <img className="card-list-preview" src={form.gastronomyImage} alt="" />
          )}

          <label>
            Introducción
            <textarea
              rows="2"
              value={form.gastronomyIntro}
              onChange={(e) => setForm((prev) => ({ ...prev, gastronomyIntro: e.target.value }))}
            />
          </label>

          <label>
            Opciones (una por línea)
            <textarea
              rows="4"
              value={form.gastronomyItems}
              onChange={(e) => setForm((prev) => ({ ...prev, gastronomyItems: e.target.value }))}
            />
          </label>
        </fieldset>

        {status.type && <p className={`status-message ${status.type}`}>{status.message}</p>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

export default SectionsEditor;
