/**
 * Sincroniza las reservas con Google Calendar usando una cuenta de servicio.
 *
 * Configuracion (variables de entorno del server):
 *   GOOGLE_SERVICE_ACCOUNT_JSON  JSON completo de la llave de la cuenta de servicio
 *     (o, en su lugar, GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY)
 *   GOOGLE_CALENDAR_ID           calendario destino (por defecto chaletangeles12@gmail.com)
 *
 * El calendario debe estar compartido con el correo de la cuenta de servicio
 * con el permiso "Hacer cambios en eventos".
 *
 * Si no hay credenciales configuradas, todas las funciones son no-op: las
 * reservas siguen funcionando normal. Un fallo de Google nunca hace fallar
 * una reserva; solo se registra en los logs.
 */
const crypto = require('crypto');
const Reservation = require('../models/Reservation');

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'chaletangeles12@gmail.com';
const TIME_ZONE = 'America/Costa_Rica';
const CHECK_IN_TIME = '14:00:00';
const CHECK_OUT_TIME = '11:00:00';
const REQUEST_TIMEOUT_MS = 8000;

// Colores de Google Calendar: 5 = amarillo (pendiente), 10 = verde (confirmada)
const STATUS_COLOR = { pending: '5', confirmed: '10' };
const STATUS_LABEL = { pending: 'Pendiente', confirmed: 'Confirmada' };

function getCredentials() {
  try {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      const json = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      if (json.client_email && json.private_key) {
        return { email: json.client_email, key: json.private_key };
      }
    }
  } catch (err) {
    console.error('GOOGLE_SERVICE_ACCOUNT_JSON no es un JSON valido:', err.message);
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
  return null;
}

function isCalendarConfigured() {
  return Boolean(getCredentials());
}

const base64url = (input) =>
  Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

let cachedToken = null; // { value, expiresAt } — se reutiliza entre invocaciones "calientes"

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const creds = getCredentials();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: creds.email,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(`${header}.${claim}`)
    .sign(creds.key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token de Google rechazado: ${data.error_description || data.error}`);

  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

async function calendarRequest(method, path, body) {
  const token = await getAccessToken();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events${path}`;
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (res.status === 204) return { status: 204 };
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

// Las fechas se guardan como medianoche UTC del dia elegido.
const dayString = (date) => new Date(date).toISOString().slice(0, 10);

function buildEvent(r) {
  const label = STATUS_LABEL[r.status] || r.status;
  const lines = [
    `Número de reserva: ${r.reservationNumber || '(sin número)'}`,
    `Estado: ${label}`,
    `Huésped: ${r.name}`,
    `Teléfono: ${r.phone}`,
    `Correo: ${r.email}`,
    `Huéspedes: ${r.guests}`,
    `Desayuno: ${r.breakfast ? 'Sí' : 'No'}`,
  ];
  if (r.origin) lines.push(`Procedencia: ${r.origin}`);
  if (r.message) lines.push('', `Mensaje: ${r.message}`);

  return {
    summary: `${r.status === 'pending' ? '[Pendiente] ' : ''}${r.reservationNumber || 'Reserva'} · ${r.name} (${r.guests} ${r.guests === 1 ? 'huésped' : 'huéspedes'})`,
    description: lines.join('\n'),
    start: { dateTime: `${dayString(r.checkIn)}T${CHECK_IN_TIME}`, timeZone: TIME_ZONE },
    end: { dateTime: `${dayString(r.checkOut)}T${CHECK_OUT_TIME}`, timeZone: TIME_ZONE },
    colorId: STATUS_COLOR[r.status],
    extendedProperties: { private: { reservationId: String(r._id) } },
  };
}

async function setEventId(reservationId, eventId) {
  await Reservation.updateOne(
    { _id: reservationId },
    eventId ? { $set: { googleEventId: eventId } } : { $unset: { googleEventId: 1 } }
  );
}

/**
 * Deja el calendario reflejando el estado actual de la reserva:
 * - cancelada  -> borra el evento (si existe)
 * - otra       -> crea o actualiza el evento
 */
async function syncReservation(reservation) {
  if (!reservation || !isCalendarConfigured()) return;

  try {
    if (reservation.status === 'cancelled') {
      await removeReservationEvent(reservation);
      return;
    }

    const event = buildEvent(reservation);

    if (reservation.googleEventId) {
      const updated = await calendarRequest(
        'PUT',
        `/${encodeURIComponent(reservation.googleEventId)}`,
        event
      );
      if (updated.ok) return;
      // Si el evento fue borrado a mano en Google, se vuelve a crear.
      if (updated.status !== 404 && updated.status !== 410) {
        throw new Error(updated.data?.error?.message || `HTTP ${updated.status}`);
      }
    }

    const created = await calendarRequest('POST', '', event);
    if (!created.ok) throw new Error(created.data?.error?.message || `HTTP ${created.status}`);
    reservation.googleEventId = created.data.id;
    await setEventId(reservation._id, created.data.id);
  } catch (err) {
    console.error(
      `Google Calendar: no se pudo sincronizar la reserva ${reservation.reservationNumber || reservation._id}:`,
      err.message
    );
  }
}

async function removeReservationEvent(reservation) {
  if (!reservation?.googleEventId || !isCalendarConfigured()) return;
  try {
    const res = await calendarRequest('DELETE', `/${encodeURIComponent(reservation.googleEventId)}`);
    if (res.status !== 204 && res.status !== 404 && res.status !== 410) {
      throw new Error(res.data?.error?.message || `HTTP ${res.status}`);
    }
    reservation.googleEventId = undefined;
    // Puede no existir si la reserva ya fue eliminada de la base; no pasa nada.
    await setEventId(reservation._id, null);
  } catch (err) {
    console.error(
      `Google Calendar: no se pudo borrar el evento de la reserva ${reservation.reservationNumber || reservation._id}:`,
      err.message
    );
  }
}

/**
 * Sube al calendario las reservas activas (no canceladas, que aun no
 * terminaron) que todavia no tienen evento. Para cargar las reservas
 * existentes la primera vez.
 */
async function syncPendingReservations() {
  if (!isCalendarConfigured()) {
    return { configured: false, synced: 0, failed: 0 };
  }

  // Prueba de credenciales antes de recorrer todo.
  await getAccessToken();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const reservations = await Reservation.find({
    status: { $ne: 'cancelled' },
    checkOut: { $gte: today },
    googleEventId: { $exists: false },
  }).sort({ checkIn: 1 });

  let synced = 0;
  for (const reservation of reservations) {
    // eslint-disable-next-line no-await-in-loop
    await syncReservation(reservation);
    if (reservation.googleEventId) synced += 1;
  }
  return { configured: true, synced, failed: reservations.length - synced };
}

module.exports = {
  isCalendarConfigured,
  syncReservation,
  removeReservationEvent,
  syncPendingReservations,
};
