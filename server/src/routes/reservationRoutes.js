const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  checkAvailability,
  createReservation,
  createReservationByAdmin,
  listReservations,
  updateReservationStatus,
  updateReservation,
  deleteReservation,
} = require('../controllers/reservationController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const reservationValidators = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').trim().notEmpty().withMessage('El teléfono es requerido'),
  body('checkIn').isISO8601().withMessage('Fecha de entrada inválida'),
  body('checkOut').isISO8601().withMessage('Fecha de salida inválida'),
  body('guests').isInt({ min: 1 }).withMessage('La cantidad de huéspedes debe ser al menos 1'),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.get('/availability', checkAvailability);
router.get('/', requireAuth, listReservations);

router.post('/', reservationValidators, validate, createReservation);

router.post('/admin', requireAuth, reservationValidators, validate, createReservationByAdmin);

router.patch('/:id/status', requireAuth, updateReservationStatus);
router.put('/:id', requireAuth, reservationValidators, validate, updateReservation);
router.delete('/:id', requireAuth, deleteReservation);

module.exports = router;
