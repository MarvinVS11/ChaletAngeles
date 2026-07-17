const express = require('express');
const { body, validationResult } = require('express-validator');
const { checkAvailability, createReservation } = require('../controllers/reservationController');

const router = express.Router();

router.get('/availability', checkAvailability);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('phone').trim().notEmpty().withMessage('El teléfono es requerido'),
    body('checkIn').isISO8601().withMessage('Fecha de entrada inválida'),
    body('checkOut').isISO8601().withMessage('Fecha de salida inválida'),
    body('guests').isInt({ min: 1 }).withMessage('La cantidad de huéspedes debe ser al menos 1'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createReservation
);

module.exports = router;
