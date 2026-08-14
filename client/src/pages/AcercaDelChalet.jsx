import { useEffect, useState } from 'react';
import api from '../api/client';
import chaletPhoto from '../assets/chalet.jpg';

function AcercaDelChalet() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api
      .get('/chalet')
      .then((res) => setInfo(res.data))
      .catch(() => setInfo(null));
  }, []);

  return (
    <div className="page">
      <div className="page-hero">
        <h1>Acerca del Chalet</h1>
        <p>Conocé más sobre Sueños de Ángeles.</p>
      </div>

      <div className="yellow-page">
        <div className="yellow-block">
          <div className="yellow-block-copy">
            <h2>Conoce el chalet</h2>
            <p>
              {info?.description ||
                'Chalet Sueños de Ángeles se ubica en el hermoso pueblo rural de Los Ángeles, en las montañas de San Ramón de Alajuela, Costa Rica. Rodeado de hermosas vistas campestres, el chalet cuenta con instalaciones muy cómodas, con accesibilidad para personas de todas las edades y con alguna discapacidad.'}
            </p>
          </div>
          <div className="yellow-block-media">
            {info?.image ? <img src={info.image} alt="Chalet Sueños de Ángeles" /> : null}
          </div>
        </div>

        <div className="yellow-divider" />

        <div className="yellow-block reverse">
          <div className="yellow-block-copy">
            <h2>Un lugar para todos</h2>
            <p>
              Chalet Sueños de Ángeles es un lugar para familias, parejas, pequeños grupos de
              amigos y para quienes quieren disfrutar de un lugar lleno de paz, tranquilidad y
              naturaleza.
            </p>
          </div>
          <div className="yellow-block-media">
            <img src={chaletPhoto} alt="Chalet Sueños de Ángeles de noche" />
          </div>
        </div>

        {info?.amenities?.length ? (
          <>
            <div className="yellow-divider" />
            <div className="yellow-block yellow-block-single">
              <div className="yellow-block-copy">
                <h2>Comodidades</h2>
                <ul>
                  {info.amenities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default AcercaDelChalet;
