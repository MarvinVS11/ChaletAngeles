import { Link } from 'react-router-dom';
import { contact } from '../data/content';

function ReservarCta() {
  return (
    <section className="reservar-cta">
      <h2>¿Quieres reservar?</h2>
      <span className="rule" />
      <div className="cta-buttons">
        <Link className="btn-primary" to="/reservas">
          Realizar reserva
        </Link>
        <a
          className="btn-secondary"
          href={contact.whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
        <a className="btn-secondary" href={`mailto:${contact.email}`}>
          Enviar correo
        </a>
        <a className="btn-secondary" href={contact.mapsUrl} target="_blank" rel="noreferrer">
          Google Maps
        </a>
        <a className="btn-secondary" href={contact.wazeUrl} target="_blank" rel="noreferrer">
          Waze
        </a>
      </div>
    </section>
  );
}

export default ReservarCta;
