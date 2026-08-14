import { useEffect, useState } from 'react';
import api from '../api/client';
import { foodOptions } from '../data/content';

function Gastronomia() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api
      .get('/site-content')
      .then((res) => setContent(res.data))
      .catch(() => setContent(null));
  }, []);

  const intro = content?.gastronomyIntro || 'Alternativas de alimentación cercanas al hospedaje:';
  const items = content?.gastronomyItems?.length ? content.gastronomyItems : foodOptions;

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Gastronomía</h1>
        <p>Sodas y restaurantes cerca del chalet.</p>
      </div>

      <div className="yellow-page">
        <div className="yellow-block">
          <div className="yellow-block-copy">
            <h2>Para el paladar</h2>
            <p>{intro}</p>
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="yellow-block-media">
            {content?.gastronomyImage ? <img src={content.gastronomyImage} alt="Gastronomía" /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gastronomia;
