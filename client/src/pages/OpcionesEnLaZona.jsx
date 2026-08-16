import { useEffect, useState } from 'react';
import api from '../api/client';
import { zoneOptions } from '../data/content';

function OpcionesEnLaZona() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api
      .get('/site-content')
      .then((res) => setContent(res.data))
      .catch(() => setContent(null));
  }, []);

  const zones = content?.zoneOptions?.length ? content.zoneOptions : zoneOptions;

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Opciones en la zona</h1>
        <p>Aventura y naturaleza a pocos minutos del chalet.</p>
      </div>

      <div className="yellow-page">
        {zones.map((item, index) => (
          <div key={item.title}>
            {index > 0 && <div className="yellow-divider" />}
            <div className={`yellow-block ${index % 2 === 1 ? 'reverse' : ''}`}>
              <div className="yellow-block-copy">
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </div>
              <div className="yellow-block-media">
                {item.image ? <img src={item.image} alt={item.title} /> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OpcionesEnLaZona;
