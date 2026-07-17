require('dotenv').config();
const connectDB = require('./config/db');
const ChaletInfo = require('./models/ChaletInfo');

async function seed() {
  await connectDB();

  await ChaletInfo.deleteMany();
  await ChaletInfo.create({
    title: 'Chalet Los Ángeles',
    description:
      'Un chalet de montaña acogedor, ideal para desconectar en familia o con amigos. Rodeado de naturaleza, con vistas panorámicas y todas las comodidades.',
    location: 'Villa La Angostura, Neuquén, Argentina',
    pricePerNight: 45000,
    maxGuests: 8,
    amenities: [
      'WiFi',
      'Calefacción a leña',
      'Cocina totalmente equipada',
      'Estacionamiento privado',
      'Vista a la montaña',
      'Parrilla',
    ],
    images: [],
    rules: [
      'No se permiten mascotas',
      'No fumar en el interior',
      'Check-in a partir de las 15:00',
      'Check-out hasta las 11:00',
    ],
  });

  console.log('Datos de ejemplo cargados correctamente');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
