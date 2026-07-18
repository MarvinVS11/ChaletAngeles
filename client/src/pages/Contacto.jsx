import { contact } from '../data/content';

function Contacto() {
  return (
    <div className="page contacto">
      <div className="page-hero">
        <h1>Contáctanos</h1>
        <p>Escribinos para conocer nuestras tarifas y opciones, o completá el formulario de reservas.</p>
      </div>

      <div className="contact-grid">
        <a className="contact-card" href={contact.whatsappUrl} target="_blank" rel="noreferrer">
          <h2>WhatsApp</h2>
          <p>{contact.phone}</p>
        </a>
        <a className="contact-card" href={`mailto:${contact.email}`}>
          <h2>Correo</h2>
          <p>{contact.email}</p>
        </a>
        <a className="contact-card" href={contact.instagramUrl} target="_blank" rel="noreferrer">
          <h2>Instagram</h2>
          <p>@chaletsuenosdeangeles</p>
        </a>
        <a className="contact-card" href={contact.tiktokUrl} target="_blank" rel="noreferrer">
          <h2>TikTok</h2>
          <p>@chaletangeles</p>
        </a>
      </div>

      <p className="description">También nos encontrás en Facebook. {contact.location}.</p>
    </div>
  );
}

export default Contacto;
