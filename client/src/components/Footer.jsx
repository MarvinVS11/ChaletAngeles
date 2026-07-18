import { Link } from 'react-router-dom';
import { contact } from '../data/content';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h3>Sueños de Ángeles</h3>
          <p>
            Un chalet de montaña en Los Ángeles, San Ramón de Alajuela: paz, tranquilidad y
            naturaleza para familias, parejas y grupos de amigos.
          </p>
          <div className="footer-social">
            <a href={contact.instagramUrl} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={contact.tiktokUrl} target="_blank" rel="noreferrer">
              TikTok
            </a>
            <a href={contact.whatsappUrl} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h3>Explorar</h3>
          <div className="footer-col-links">
            <Link to="/">Inicio</Link>
            <Link to="/galeria">Galería</Link>
            <Link to="/mapa">Mapa</Link>
            <Link to="/contacto">Contáctanos</Link>
            <Link to="/reservas">Reservar</Link>
          </div>
        </div>

        <div className="footer-col">
          <h3>Contacto</h3>
          <p>{contact.location}</p>
          <p>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
          <p>
            <a href={contact.whatsappUrl} target="_blank" rel="noreferrer">
              {contact.phone}
            </a>
          </p>
        </div>
      </div>

      <p className="footer-bottom">
        © {new Date().getFullYear()} Sueños de Ángeles. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default Footer;
