import { useEffect, useState } from 'react';
import api from '../api/client';
import { chaletActivities } from '../data/content';

function Actividades() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    api
      .get('/site-content')
      .then((res) => setContent(res.data))
      .catch(() => setContent(null));
  }, []);

  const activities = content?.activities?.length ? content.activities : chaletActivities;

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Actividades en Sueños de Ángeles</h1>
        <p>Todo lo que podés disfrutar sin salir del chalet.</p>
      </div>

      <div className="yellow-page">
        {activities.map((item, index) => (
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

export default Actividades;
