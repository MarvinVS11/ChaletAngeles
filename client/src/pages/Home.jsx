import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function Home() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/chalet')
      .then((res) => setInfo(res.data))
      .catch(() => setError('No se pudo cargar la información del chalet.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="status-message">Cargando...</p>;
  if (error) return <p className="status-message error">{error}</p>;
  if (!info) return null;

  return (
    <div className="page home">
      <section className="hero">
        <h1>{info.title}</h1>
        <p className="location">{info.location}</p>
        <p className="description">{info.description}</p>
        <Link to="/reservas" className="btn-primary">
          Reservar ahora
        </Link>
      </section>

      <section className="info-grid">
        <div className="info-card">
          <h2>Precio por noche</h2>
          <p>${info.pricePerNight.toLocaleString('es-AR')}</p>
        </div>
        <div className="info-card">
          <h2>Capacidad</h2>
          <p>Hasta {info.maxGuests} huéspedes</p>
        </div>
      </section>

      <section className="amenities">
        <h2>Comodidades</h2>
        <ul>
          {info.amenities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="rules">
        <h2>Reglas de la casa</h2>
        <ul>
          {info.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Home;
