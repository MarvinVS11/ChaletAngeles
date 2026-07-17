const express = require('express');
const cors = require('cors');
const chaletRoutes = require('./routes/chaletRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/chalet', chaletRoutes);
app.use('/api/reservations', reservationRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

module.exports = app;
