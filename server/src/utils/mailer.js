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

async function sendReservationNotification(reservation) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.NOTIFICATION_EMAIL) {
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

module.exports = { sendReservationNotification };
