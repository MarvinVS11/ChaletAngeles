const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function buildManageLink(reservation) {
  const base = process.env.CLIENT_URL;
  if (!base || !reservation.manageToken) {
    return null;
  }
  return `${base.replace(/\/$/, '')}/mi-reserva/${reservation.manageToken}`;
}

function manageLinkBlock(reservation) {
  const link = buildManageLink(reservation);
  if (!link) {
    return { text: '', html: '' };
  }

  return {
    text: `\n\nSi necesitás modificar o cancelar tu reserva, entrá acá: ${link}\n(Disponible hasta 48 horas antes del check-in.)`,
    html: `
      <p>
        Si necesitás modificar o cancelar tu reserva, hacé click acá:
        <a href="${link}">${link}</a>
      </p>
      <p style="font-size: 13px; color: #666;">(Disponible hasta 48 horas antes del check-in.)</p>
    `,
  };
}

async function sendReservationNotification(reservation) {
  if (!hasSmtpConfig() || !process.env.NOTIFICATION_EMAIL) {
    console.warn('Notificación de reserva omitida: faltan variables de entorno SMTP_USER/SMTP_PASS/NOTIFICATION_EMAIL');
    return;
  }

  const { name, email, phone, checkIn, checkOut, guests, message } = reservation;

  await getTransporter().sendMail({
    from: `"Sueños de Ángeles" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `Nueva reserva confirmada: ${name} (${formatDate(checkIn)} - ${formatDate(checkOut)})`,
    text: `Nueva reserva confirmada automáticamente\n\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nCheck-in: ${formatDate(checkIn)}\nCheck-out: ${formatDate(checkOut)}\nHuéspedes: ${guests}\nMensaje: ${message || '(sin mensaje)'}`,
    html: `
      <h2>Nueva reserva confirmada automáticamente</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone}</p>
      <p><strong>Check-in:</strong> ${formatDate(checkIn)}</p>
      <p><strong>Check-out:</strong> ${formatDate(checkOut)}</p>
      <p><strong>Huéspedes:</strong> ${guests}</p>
      <p><strong>Mensaje:</strong> ${message || '(sin mensaje)'}</p>
    `,
  });
}

const STATUS_COPY = {
  pending: {
    subject: 'Tu reserva sigue pendiente de confirmación — Sueños de Ángeles',
    intro: 'Tu solicitud de reserva sigue <strong>pendiente de confirmación</strong>. Pronto te contactaremos para coordinar los detalles.',
  },
  confirmed: {
    subject: '¡Tu reserva fue confirmada! — Sueños de Ángeles',
    intro: '¡Buenas noticias! Tu reserva quedó <strong>confirmada</strong>. Te esperamos.',
  },
  cancelled: {
    subject: 'Tu reserva fue cancelada — Sueños de Ángeles',
    intro: 'Te informamos que tu reserva fue <strong>cancelada</strong>. Si tenés dudas, escribinos y con gusto te ayudamos.',
  },
};

async function sendReservationStatusUpdate(reservation) {
  if (!hasSmtpConfig()) {
    console.warn('Correo de estado de reserva omitido: faltan variables de entorno SMTP_USER/SMTP_PASS');
    return;
  }

  const { name, email, checkIn, checkOut, guests, status } = reservation;
  const copy = STATUS_COPY[status];

  if (!copy) {
    return;
  }

  const link = status === 'cancelled' ? { text: '', html: '' } : manageLinkBlock(reservation);

  await getTransporter().sendMail({
    from: `"Sueños de Ángeles" <${process.env.SMTP_USER}>`,
    to: email,
    subject: copy.subject,
    text: `Hola ${name},\n\n${copy.intro.replace(/<\/?strong>/g, '')}\n\nCheck-in: ${formatDate(checkIn)}\nCheck-out: ${formatDate(checkOut)}\nHuéspedes: ${guests}${link.text}\n\n¡Gracias!\nSueños de Ángeles`,
    html: `
      <h2>Hola ${name},</h2>
      <p>${copy.intro}</p>
      <p><strong>Check-in:</strong> ${formatDate(checkIn)}</p>
      <p><strong>Check-out:</strong> ${formatDate(checkOut)}</p>
      <p><strong>Huéspedes:</strong> ${guests}</p>
      ${link.html}
      <p>¡Gracias por elegirnos!</p>
    `,
  });
}

async function sendReservationUpdatedByCustomer(reservation, cancelled = false) {
  if (!hasSmtpConfig() || !process.env.NOTIFICATION_EMAIL) {
    console.warn('Notificación de cambio del cliente omitida: faltan variables de entorno');
    return;
  }

  const { name, email, phone, checkIn, checkOut, guests, message } = reservation;
  const action = cancelled ? 'canceló' : 'modificó';

  await getTransporter().sendMail({
    from: `"Sueños de Ángeles" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `El cliente ${action} su reserva: ${name}`,
    text: `El cliente ${name} (${email}) ${action} su reserva.\n\nTeléfono: ${phone}\nCheck-in: ${formatDate(checkIn)}\nCheck-out: ${formatDate(checkOut)}\nHuéspedes: ${guests}\nMensaje: ${message || '(sin mensaje)'}\n\n${cancelled ? 'Quedó cancelada.' : 'Quedó confirmada automáticamente con los nuevos datos.'}`,
    html: `
      <h2>El cliente ${action} su reserva</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone}</p>
      <p><strong>Check-in:</strong> ${formatDate(checkIn)}</p>
      <p><strong>Check-out:</strong> ${formatDate(checkOut)}</p>
      <p><strong>Huéspedes:</strong> ${guests}</p>
      <p><strong>Mensaje:</strong> ${message || '(sin mensaje)'}</p>
      <p>${cancelled ? 'Quedó <strong>cancelada</strong>.' : 'Quedó <strong>confirmada automáticamente</strong> con los nuevos datos.'}</p>
    `,
  });
}

module.exports = {
  sendReservationNotification,
  sendReservationStatusUpdate,
  sendReservationUpdatedByCustomer,
};
