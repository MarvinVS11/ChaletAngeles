const crypto = require('crypto');
const Reservation = require('../models/Reservation');
const {
  sendReservationNotification,
  sendReservationStatusUpdate,
  sendReservationUpdatedByCustomer,
} = require('../utils/mailer');

const EDIT_CUTOFF_HOURS = 48;

function datesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function generateManageToken() {
  return crypto.randomBytes(24).toString('hex');
}

function hoursUntil(date) {
  return (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60);
}

function isSelfManageEditable(reservation) {
  return reservation.status !== 'cancelled' && hoursUntil(reservation.checkIn) > EDIT_CUTOFF_HOURS;
}

function toManageView(reservation) {
  return {
    name: reservation.name,
    email: reservation.email,
    phone: reservation.phone,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
    message: reservation.message,
    status: reservation.status,
    editable: isSelfManageEditable(reservation),
  };
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
    status: 'confirmed',
    manageToken: generateManageToken(),
  });

  try {
    await sendReservationNotification(reservation);
  } catch (err) {
    console.error('No se pudo enviar el correo de notificación de reserva:', err.message);
  }

  try {
    await sendReservationStatusUpdate(reservation);
  } catch (err) {
    console.error('No se pudo enviar el correo de confirmación al cliente:', err.message);
  }

  res.status(201).json(reservation);
}

async function createReservationByAdmin(req, res) {
  const { name, email, phone, checkIn, checkOut, guests, message, status } = req.body;

  const requestedIn = new Date(checkIn);
  const requestedOut = new Date(checkOut);

  if (!(requestedOut > requestedIn)) {
    return res.status(400).json({ message: 'checkOut debe ser posterior a checkIn' });
  }

  const finalStatus = ['pending', 'confirmed', 'cancelled'].includes(status) ? status : 'pending';

  if (finalStatus !== 'cancelled') {
    const conflicting = await Reservation.findOne({
      status: { $ne: 'cancelled' },
      checkIn: { $lt: requestedOut },
      checkOut: { $gt: requestedIn },
    });

    if (conflicting) {
      return res.status(409).json({ message: 'Las fechas seleccionadas ya no están disponibles' });
    }
  }

  const reservation = await Reservation.create({
    name,
    email,
    phone,
    checkIn: requestedIn,
    checkOut: requestedOut,
    guests,
    message,
    status: finalStatus,
    manageToken: generateManageToken(),
  });

  try {
    await sendReservationStatusUpdate(reservation);
  } catch (err) {
    console.error('No se pudo enviar el correo al cliente de la reserva cargada por el admin:', err.message);
  }

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

  try {
    await sendReservationStatusUpdate(reservation);
  } catch (err) {
    console.error('No se pudo enviar el correo de cambio de estado:', err.message);
  }

  res.json(reservation);
}

async function updateReservation(req, res) {
  const { name, email, phone, checkIn, checkOut, guests, message, status } = req.body;

  const previous = await Reservation.findById(req.params.id);
  if (!previous) {
    return res.status(404).json({ message: 'Reserva no encontrada' });
  }

  const requestedIn = new Date(checkIn);
  const requestedOut = new Date(checkOut);

  if (!(requestedOut > requestedIn)) {
    return res.status(400).json({ message: 'checkOut debe ser posterior a checkIn' });
  }

  const finalStatus = ['pending', 'confirmed', 'cancelled'].includes(status) ? status : previous.status;

  if (finalStatus !== 'cancelled') {
    const conflicting = await Reservation.findOne({
      _id: { $ne: req.params.id },
      status: { $ne: 'cancelled' },
      checkIn: { $lt: requestedOut },
      checkOut: { $gt: requestedIn },
    });

    if (conflicting) {
      return res.status(409).json({ message: 'Las fechas seleccionadas ya no están disponibles' });
    }
  }

  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    {
      name,
      email,
      phone,
      checkIn: requestedIn,
      checkOut: requestedOut,
      guests,
      message,
      status: finalStatus,
    },
    { returnDocument: 'after', runValidators: true }
  );

  if (previous.status !== finalStatus) {
    try {
      await sendReservationStatusUpdate(reservation);
    } catch (err) {
      console.error('No se pudo enviar el correo de cambio de estado:', err.message);
    }
  }

  res.json(reservation);
}

async function getReservationByToken(req, res) {
  const reservation = await Reservation.findOne({ manageToken: req.params.token });

  if (!reservation) {
    return res.status(404).json({ message: 'No encontramos esa reserva' });
  }

  res.json(toManageView(reservation));
}

async function updateReservationByToken(req, res) {
  const reservation = await Reservation.findOne({ manageToken: req.params.token });

  if (!reservation) {
    return res.status(404).json({ message: 'No encontramos esa reserva' });
  }

  if (reservation.status === 'cancelled') {
    return res.status(400).json({ message: 'Esta reserva ya está cancelada.' });
  }

  if (!isSelfManageEditable(reservation)) {
    return res.status(403).json({
      message: `Ya no se puede modificar esta reserva online: faltan menos de ${EDIT_CUTOFF_HOURS} horas para el check-in. Contactanos directamente para cualquier cambio.`,
    });
  }

  const { phone, checkIn, checkOut, guests, message } = req.body;
  const requestedIn = new Date(checkIn);
  const requestedOut = new Date(checkOut);

  if (!(requestedOut > requestedIn)) {
    return res.status(400).json({ message: 'checkOut debe ser posterior a checkIn' });
  }

  const conflicting = await Reservation.findOne({
    _id: { $ne: reservation._id },
    status: { $ne: 'cancelled' },
    checkIn: { $lt: requestedOut },
    checkOut: { $gt: requestedIn },
  });

  if (conflicting) {
    return res.status(409).json({ message: 'Las fechas seleccionadas ya no están disponibles' });
  }

  reservation.phone = phone;
  reservation.checkIn = requestedIn;
  reservation.checkOut = requestedOut;
  reservation.guests = guests;
  reservation.message = message;
  reservation.status = 'confirmed';
  await reservation.save();

  try {
    await sendReservationStatusUpdate(reservation);
  } catch (err) {
    console.error('No se pudo enviar el correo de confirmación del cambio:', err.message);
  }

  try {
    await sendReservationUpdatedByCustomer(reservation);
  } catch (err) {
    console.error('No se pudo notificar al admin del cambio del cliente:', err.message);
  }

  res.json(toManageView(reservation));
}

async function cancelReservationByToken(req, res) {
  const reservation = await Reservation.findOne({ manageToken: req.params.token });

  if (!reservation) {
    return res.status(404).json({ message: 'No encontramos esa reserva' });
  }

  if (reservation.status === 'cancelled') {
    return res.status(400).json({ message: 'Esta reserva ya está cancelada.' });
  }

  if (!isSelfManageEditable(reservation)) {
    return res.status(403).json({
      message: `Ya no se puede cancelar esta reserva online: faltan menos de ${EDIT_CUTOFF_HOURS} horas para el check-in. Contactanos directamente.`,
    });
  }

  reservation.status = 'cancelled';
  await reservation.save();

  try {
    await sendReservationStatusUpdate(reservation);
  } catch (err) {
    console.error('No se pudo enviar el correo de cancelación:', err.message);
  }

  try {
    await sendReservationUpdatedByCustomer(reservation, true);
  } catch (err) {
    console.error('No se pudo notificar al admin de la cancelación:', err.message);
  }

  res.json(toManageView(reservation));
}

async function deleteReservation(req, res) {
  const reservation = await Reservation.findByIdAndDelete(req.params.id);

  if (!reservation) {
    return res.status(404).json({ message: 'Reserva no encontrada' });
  }

  res.status(204).end();
}

module.exports = {
  checkAvailability,
  createReservation,
  createReservationByAdmin,
  listReservations,
  updateReservationStatus,
  updateReservation,
  deleteReservation,
  getReservationByToken,
  updateReservationByToken,
  cancelReservationByToken,
};
