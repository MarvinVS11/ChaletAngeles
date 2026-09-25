import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/client';
import { galleryPlaceholders } from '../data/content';
import chaletPhoto from '../assets/chalet.jpg';

const AUTOPLAY_MS = 3000;

function Galeria() {
  const [content, setContent] = useState(null);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbsRef = useRef(null);

  useEffect(() => {
    api
      .get('/site-content')
      .then((res) => setContent(res.data))
      .catch(() => setContent(null));
  }, []);

  const slides = useMemo(() => {
    const gallery = content?.gallery || [];

    if (gallery.length === 0) {
      const placeholders = galleryPlaceholders.map((label) => ({ src: null, label }));
      return [{ src: chaletPhoto, label: 'Chalet' }, ...placeholders];
    }

    return gallery.map((item, i) => ({
      src: item.image,
      label: item.caption || `Foto ${i + 1}`,
    }));
  }, [content]);

  const safeIndex = slides.length ? index % slides.length : 0;
  const current = slides[safeIndex];

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  // Avance automatico cada 3 s. Se reinicia en cada cambio de foto (asi un
  // click manual da 3 s completos) y se pausa con la foto ampliada.
  useEffect(() => {
    if (lightboxOpen || slides.length < 2) return undefined;
    const timer = setTimeout(goNext, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [safeIndex, lightboxOpen, slides.length, goNext]);

  // Mantiene visible la miniatura activa sin mover el scroll de la pagina.
  useEffect(() => {
    const container = thumbsRef.current;
    const thumb = container?.children[safeIndex];
    if (!container || !thumb) return;
    const left = thumb.offsetLeft - container.offsetLeft;
    const target = left - (container.clientWidth - thumb.clientWidth) / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [safeIndex]);

  // Visor ampliado: cerrar con Escape, navegar con flechas, bloquear scroll.
  useEffect(() => {
    if (!lightboxOpen) return undefined;

    function handleKey(e) {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [lightboxOpen, goNext, goPrev]);

  if (!current) return null;

  return (
    <div className="page galeria">
      <div className="page-hero">
        <h1>Galería</h1>
        <p>Un vistazo a los espacios del chalet. Iremos sumando más fotos de cada rincón.</p>
      </div>

      <div className="gallery-slider">
        <div className={`gallery-slide-frame ${current.src ? '' : 'is-placeholder'}`}>
          {current.src ? (
            <button
              type="button"
              className="gallery-open"
              onClick={() => setLightboxOpen(true)}
              aria-label={`Ver ${current.label} en tamaño completo`}
            >
              <img key={current.src} src={current.src} alt={current.label} />
            </button>
          ) : (
            <span>{current.label}</span>
          )}

          <span className="gallery-slide-caption">{current.label}</span>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-nav gallery-nav-prev"
                onClick={goPrev}
                aria-label="Foto anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className="gallery-nav gallery-nav-next"
                onClick={goNext}
                aria-label="Foto siguiente"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>

      <div className="gallery-thumbs" ref={thumbsRef}>
        {slides.map((slide, i) => (
          <button
            key={`${slide.label}-${i}`}
            type="button"
            className={`gallery-thumb ${i === safeIndex ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={slide.label}
          >
            {slide.src ? <img src={slide.src} alt={slide.label} /> : <span>{slide.label}</span>}
          </button>
        ))}
      </div>

      {lightboxOpen && current.src && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.label}
          onClick={() => setLightboxOpen(false)}
        >
          <div className="gallery-lightbox-frame" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="gallery-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <img src={current.src} alt={current.label} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Galeria;
