const Reservation = require('../models/Reservation');

function datesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

async function checkAvailability(req, res) {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) {
    return res.status(400).json({ message: 'checkIn y checkOut son requeridos' });
  }

  const requestedIn = new Date(checkIn);
  const requestedOut = new Date(checkOut);

  if (requestedOut <= requestedIn) {
    return res.status(400).json({ message: 'checkOut debe ser posterior a checkIn' });
  }

  const existing = await Reservation.find({
    status: { $ne: 'cancelled' },
    checkIn: { $lt: requestedOut },
    checkOut: { $gt: requestedIn },
  });

  res.json({ available: existing.length === 0 });
}

async function createReservation(req, res) {
  const { name, email, phone, checkIn, checkOut, guests, message } = req.body;

  const requestedIn = new Date(checkIn);
  const requestedOut = new Date(checkOut);

  if (!(requestedOut > requestedIn)) {
    return res.status(400).json({ message: 'checkOut debe ser posterior a checkIn' });
  }

  const conflicting = await Reservation.findOne({
    status: { $ne: 'cancelled' },
    checkIn: { $lt: requestedOut },
    checkOut: { $gt: requestedIn },
  });

  if (conflicting) {
    return res.status(409).json({ message: 'Las fechas seleccionadas ya no están disponibles' });
  }

  const reservation = await Reservation.create({
    name,
    email,
    phone,
    checkIn: requestedIn,
    checkOut: requestedOut,
    guests,
    message,
  });

  res.status(201).json(reservation);
}

async function listReservations(req, res) {
  const reservations = await Reservation.find().sort({ checkIn: 1 });
  res.json(reservations);
}

async function updateReservationStatus(req, res) {
  const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status },
    { returnDocument: 'after' }
  );

  if (!reservation) {
    return res.status(404).json({ message: 'Reserva no encontrada' });
  }

  res.json(reservation);
}

module.exports = {
  checkAvailability,
  createReservation,
  listReservations,
  updateReservationStatus,
};
