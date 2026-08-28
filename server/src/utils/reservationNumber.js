const Reservation = require('../models/Reservation');

/**
 * Genera un número de reserva único con formato CA-YYYY-RRR, donde
 * CA = Chalet Ángeles, YYYY = año en curso y RRR = número aleatorio
 * de 3 dígitos (000-999).
 *
 * Como solo hay 1000 combinaciones por año, se verifica contra la base
 * de datos y se reintenta si el número ya existe. Si tras varios
 * intentos no se encuentra uno libre (año con muchísimas reservas), se
 * amplía a 4 dígitos como resguardo para nunca fallar la creación.
 */
async function generateReservationNumber() {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const candidate = `CA-${year}-${random}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Reservation.exists({ reservationNumber: candidate });
    if (!exists) return candidate;
  }

  // Resguardo: 4 dígitos si el espacio de 3 está casi lleno.
  for (;;) {
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const candidate = `CA-${year}-${random}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Reservation.exists({ reservationNumber: candidate });
    if (!exists) return candidate;
  }
}

/**
 * Asigna un número de reserva a una reserva existente que no lo tenga
 * (backfill perezoso para reservas creadas antes de esta función).
 */
async function ensureReservationNumber(reservation) {
  if (!reservation || reservation.reservationNumber) return reservation;
  reservation.reservationNumber = await generateReservationNumber();
  await reservation.save();
  return reservation;
}

module.exports = { generateReservationNumber, ensureReservationNumber };
