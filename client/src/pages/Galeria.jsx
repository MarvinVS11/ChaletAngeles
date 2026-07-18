import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { galleryPlaceholders } from '../data/content';
import chaletPhoto from '../assets/chalet.jpg';

function Galeria() {
  const [info, setInfo] = useState(null);
  const [content, setContent] = useState(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    api
      .get('/chalet')
      .then((res) => setInfo(res.data))
      .catch(() => setInfo(null));

    api
      .get('/site-content')
      .then((res) => setContent(res.data))
      .catch(() => setContent(null));
  }, []);

  const slides = useMemo(() => {
    const photos = [{ src: chaletPhoto, label: 'Chalet' }];

    if (info?.image) {
      photos.push({ src: info.image, label: 'Acerca del chalet' });
    }

    (content?.activities || []).forEach((item) => {
      if (item.image) photos.push({ src: item.image, label: item.title });
    });

    (content?.zoneOptions || []).forEach((item) => {
      if (item.image) photos.push({ src: item.image, label: item.title });
    });

    if (content?.gastronomyImage) {
      photos.push({ src: content.gastronomyImage, label: 'Gastronomía' });
    }

    const placeholders = galleryPlaceholders.map((label) => ({ src: null, label }));

    return [...photos, ...placeholders];
  }, [info, content]);

  const current = slides[index];

  function goPrev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % slides.length);
  }

  return (
    <div className="page galeria">
      <div className="page-hero">
        <h1>Galería</h1>
        <p>Un vistazo a los espacios del chalet. Iremos sumando más fotos de cada rincón.</p>
      </div>

      <div className="gallery-slider">
        <button
          type="button"
          className="gallery-nav gallery-nav-prev"
          onClick={goPrev}
          aria-label="Foto anterior"
        >
          ‹
        </button>

        <div className="gallery-slide-main">
          {current.src ? (
            <img src={current.src} alt={current.label} />
          ) : (
            <span>{current.label}</span>
          )}
          <span className="gallery-slide-caption">{current.label}</span>
        </div>

        <button
          type="button"
          className="gallery-nav gallery-nav-next"
          onClick={goNext}
          aria-label="Foto siguiente"
        >
          ›
        </button>
      </div>

      <div className="gallery-thumbs">
        {slides.map((slide, i) => (
          <button
            key={`${slide.label}-${i}`}
            type="button"
            className={`gallery-thumb ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={slide.label}
          >
            {slide.src ? <img src={slide.src} alt={slide.label} /> : <span>{slide.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Galeria;
