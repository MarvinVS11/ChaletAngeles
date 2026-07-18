const express = require('express');
const cors = require('cors');
const chaletRoutes = require('./routes/chaletRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes = require('./routes/authRoutes');
const siteContentRoutes = require('./routes/siteContentRoutes');

const app = express();

const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : 'http://localhost:5173',
  })
);
app.use(express.json({ limit: '12mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/chalet', chaletRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/site-content', siteContentRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

module.exports = app;
