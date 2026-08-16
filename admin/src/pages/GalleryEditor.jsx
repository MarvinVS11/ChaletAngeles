import { useEffect, useState } from 'react';
import api from '../api/client';
import GalleryField from '../components/GalleryField';
import { estimatePayloadSize, MAX_PAYLOAD_BYTES } from '../utils/fileToDataUrl';

function GalleryEditor() {
  const [siteContent, setSiteContent] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  useEffect(() => {
    api
      .get('/site-content')
      .then((res) => {
        setSiteContent(res.data);
        setGallery(res.data.gallery || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    const payload = { ...siteContent, gallery };

    const size = estimatePayloadSize(payload);
    if (size > MAX_PAYLOAD_BYTES) {
      setStatus({
        type: 'error',
        message: `El conjunto de fotos pesa ${(size / (1024 * 1024)).toFixed(1)}MB, supera el máximo permitido (${(MAX_PAYLOAD_BYTES / (1024 * 1024)).toFixed(1)}MB). Quitá o reemplazá alguna foto e intentá de nuevo.`,
      });
      return;
    }

    setSaving(true);

    try {
      await api.put('/site-content', payload);
      setStatus({ type: 'success', message: 'Galería actualizada correctamente.' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'No se pudo guardar la galería.',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="status-message">Cargando...</p>;

  return (
    <div className="page">
      <h1>Galería</h1>
      <p className="description">
        Estas fotos son independientes del resto del sitio: solo aparecen en la página de Galería
        del sitio público, sin mezclarse con las de Actividades, Opciones en la zona o Gastronomía.
      </p>

      <form onSubmit={handleSubmit} className="admin-form">
        <GalleryField label="Fotos del chalet" items={gallery} onChange={setGallery} />

        {status.type && <p className={`status-message ${status.type}`}>{status.message}</p>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

export default GalleryEditor;
