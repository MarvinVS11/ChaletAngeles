const app = require('../src/app');
const connectDB = require('../src/config/db');

let ready = null;

module.exports = async (req, res) => {
  if (!ready) {
    ready = connectDB();
  }

  try {
    await ready;
  } catch (err) {
    ready = null;
    console.error('Error al conectar a MongoDB:', err.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Error interno del servidor' }));
    return;
  }

  return app(req, res);
};
