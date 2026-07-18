import { contact } from '../data/content';

function Mapa() {
  return (
    <div className="page mapa">
      <div className="page-hero">
        <h1>Mapa digital</h1>
        <p>{contact.location}</p>
      </div>
      <div className="map-frame">
        <iframe
          title="Ubicación Sueños de Ángeles"
          src="https://www.google.com/maps?q=Los+%C3%81ngeles+San+Ram%C3%B3n+Alajuela+Costa+Rica&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="cta-buttons">
        <a className="btn-secondary" href={contact.mapsUrl} target="_blank" rel="noreferrer">
          Abrir en Google Maps
        </a>
        <a className="btn-secondary" href={contact.wazeUrl} target="_blank" rel="noreferrer">
          Abrir en Waze
        </a>
      </div>
    </div>
  );
}

export default Mapa;
