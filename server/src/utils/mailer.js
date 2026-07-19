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

async function sendReservationNotification(reservation) {
  if (!hasSmtpConfig() || !process.env.NOTIFICATION_EMAIL) {
    console.warn('Notificación de reserva omitida: faltan variables de entorno SMTP_USER/SMTP_PASS/NOTIFICATION_EMAIL');
    return;
  }

  const { name, email, phone, checkIn, checkOut, guests, message } = reservation;

  await getTransporter().sendMail({
    from: `"Sueños de Ángeles" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `Nueva reserva: ${name} (${formatDate(checkIn)} - ${formatDate(checkOut)})`,
    text: `Nueva solicitud de reserva\n\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nCheck-in: ${formatDate(checkIn)}\nCheck-out: ${formatDate(checkOut)}\nHuéspedes: ${guests}\nMensaje: ${message || '(sin mensaje)'}`,
    html: `
      <h2>Nueva solicitud de reserva</h2>
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

async function sendReservationConfirmation(reservation) {
  if (!hasSmtpConfig()) {
    console.warn('Confirmación de reserva omitida: faltan variables de entorno SMTP_USER/SMTP_PASS');
    return;
  }

  const { name, email, checkIn, checkOut, guests } = reservation;

  await getTransporter().sendMail({
    from: `"Sueños de Ángeles" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Recibimos tu solicitud de reserva — Sueños de Ángeles`,
    text: `Hola ${name},\n\n¡Gracias por tu interés en Sueños de Ángeles! Recibimos tu solicitud de reserva con estos datos:\n\nCheck-in: ${formatDate(checkIn)}\nCheck-out: ${formatDate(checkOut)}\nHuéspedes: ${guests}\n\nEs una solicitud pendiente de confirmación: pronto nos pondremos en contacto para confirmar disponibilidad y coordinar los detalles.\n\n¡Gracias!\nSueños de Ángeles`,
    html: `
      <h2>¡Gracias por tu solicitud, ${name}!</h2>
      <p>Recibimos tu solicitud de reserva en <strong>Sueños de Ángeles</strong> con estos datos:</p>
      <p><strong>Check-in:</strong> ${formatDate(checkIn)}</p>
      <p><strong>Check-out:</strong> ${formatDate(checkOut)}</p>
      <p><strong>Huéspedes:</strong> ${guests}</p>
      <p>Es una solicitud <strong>pendiente de confirmación</strong>: pronto nos pondremos en contacto para confirmar disponibilidad y coordinar los detalles.</p>
      <p>¡Gracias por elegirnos!</p>
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

  await getTransporter().sendMail({
    from: `"Sueños de Ángeles" <${process.env.SMTP_USER}>`,
    to: email,
    subject: copy.subject,
    text: `Hola ${name},\n\n${copy.intro.replace(/<\/?strong>/g, '')}\n\nCheck-in: ${formatDate(checkIn)}\nCheck-out: ${formatDate(checkOut)}\nHuéspedes: ${guests}\n\n¡Gracias!\nSueños de Ángeles`,
    html: `
      <h2>Hola ${name},</h2>
      <p>${copy.intro}</p>
      <p><strong>Check-in:</strong> ${formatDate(checkIn)}</p>
      <p><strong>Check-out:</strong> ${formatDate(checkOut)}</p>
      <p><strong>Huéspedes:</strong> ${guests}</p>
      <p>¡Gracias por elegirnos!</p>
    `,
  });
}

module.exports = {
  sendReservationNotification,
  sendReservationConfirmation,
  sendReservationStatusUpdate,
};
