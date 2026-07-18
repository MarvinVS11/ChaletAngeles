import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { chaletActivities, zoneOptions, foodOptions } from '../data/content';
import ReservarCta from '../components/ReservarCta';
import chaletPhoto from '../assets/chalet.jpg';

const heroBackground = {
  backgroundImage: `linear-gradient(180deg, rgba(11, 16, 10, 0.45), rgba(11, 16, 10, 0.8)), url(${chaletPhoto})`,
};

function Home() {
  const [info, setInfo] = useState(null);
  const [content, setContent] = useState(null);

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

  const activities = content?.activities?.length ? content.activities : chaletActivities;
  const zones = content?.zoneOptions?.length ? content.zoneOptions : zoneOptions;
  const gastronomyIntro = content?.gastronomyIntro || 'Alternativas de alimentación cercanas al hospedaje:';
  const gastronomyItems = content?.gastronomyItems?.length ? content.gastronomyItems : foodOptions;

  return (
    <div className="page home">
      <section className="hero" style={heroBackground}>
        <p className="eyebrow">Tranquilidad, paz y naturaleza</p>
        <h1>{info?.title || 'Sueños de Ángeles'}</h1>
        <p className="location">{info?.location || 'Los Ángeles, San Ramón de Alajuela, Costa Rica'}</p>
        <p className="description">
          Descubrí este rincón de montaña como un espacio de descanso: familias, parejas y grupos
          de amigos encuentran aquí paz, tranquilidad y naturaleza.
        </p>
        <div className="hero-actions">
          <Link to="/reservas" className="btn-primary">
            Reservar ahora
          </Link>
          <Link to="/galeria" className="btn-secondary">
            Ver galería
          </Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-media" aria-hidden="true">
          {info?.image && <img src={info.image} alt="Acerca del chalet" />}
        </div>
        <div className="section-copy">
          <span className="eyebrow">Bienvenida</span>
          <h2>Acerca del Chalet</h2>
          <span className="rule" />
          <p>
            {info?.description ||
              'Instalaciones cómodas y accesibles para personas de todas las edades, con cocina equipada, sala amplia con televisión y escritorio para trabajo remoto, y habitaciones matrimoniales con terraza y vista a jardines y paisaje rural.'}
          </p>
          {info?.amenities?.length ? (
            <ul>
              {info.amenities.slice(0, 6).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <p className="eyebrow">Vive la experiencia</p>
          <h2>Actividades en Sueños de Ángeles</h2>
          <span className="rule" />
        </div>
        <div className="mini-cards">
          {activities.map((item) => (
            <div className="mini-card" key={item.title}>
              <div className="mini-card-media" aria-hidden="true">
                {item.image && <img src={item.image} alt={item.title} />}
              </div>
              <div className="mini-card-body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 88 }}>
        <div className="section-heading">
          <p className="eyebrow">Los alrededores</p>
          <h2>Opciones en la zona</h2>
          <span className="rule" />
        </div>
        <div className="mini-cards">
          {zones.map((item) => (
            <div className="mini-card" key={item.title}>
              <div className="mini-card-media" aria-hidden="true">
                {item.image && <img src={item.image} alt={item.title} />}
              </div>
              <div className="mini-card-body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block reverse" style={{ marginTop: 88 }}>
        <div className="section-media" aria-hidden="true">
          {content?.gastronomyImage && <img src={content.gastronomyImage} alt="Gastronomía" />}
        </div>
        <div className="section-copy">
          <span className="eyebrow">Para el paladar</span>
          <h2>Gastronomía</h2>
          <span className="rule" />
          <p>{gastronomyIntro}</p>
          <ul>
            {gastronomyItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <ReservarCta />
    </div>
  );
}

export default Home;
