require('dotenv').config();
const connectDB = require('./config/db');
const ChaletInfo = require('./models/ChaletInfo');
const SiteContent = require('./models/SiteContent');

async function seed() {
  await connectDB();

  await ChaletInfo.deleteMany();
  await ChaletInfo.create({
    title: 'Sueños de Ángeles',
    description:
      'Un chalet acogedor en el hermoso pueblo rural de Los Ángeles, en las montañas de San Ramón de Alajuela, Costa Rica. Un espacio pensado para familias, parejas y pequeños grupos de amigos que buscan paz, tranquilidad y naturaleza, con instalaciones accesibles para personas de todas las edades.',
    location: 'Los Ángeles, San Ramón de Alajuela, Costa Rica',
    pricePerNight: 45000,
    maxGuests: 8,
    amenities: [
      'Cocina equipada (cafetera, olla arrocera, refrigeradora, tostador, sartén eléctrico, microondas, licuadora)',
      'Sala amplia con televisión, sillones y escritorio para trabajo remoto',
      '3 habitaciones matrimoniales con terraza y vista a jardines y paisaje rural',
      '1 baño en planta baja adaptado para personas con discapacidad',
      'Zonas verdes para yoga, ejercicio y actividades familiares',
      'Sendero recreativo y aromático con plantas medicinales y árboles frutales',
    ],
    images: [],
    image: '',
    rules: [
      'No se permiten mascotas',
      'No fumar en el interior',
      'Check-in a partir de las 15:00',
      'Check-out hasta las 11:00',
    ],
  });

  await SiteContent.deleteMany();
  await SiteContent.create({
    activities: [
      {
        title: 'Observación de aves',
        text: 'Un paraíso natural rodeado de bosque nuboso: colibríes, tucanes y tangaras multicolores se aprecian desde balcones, jardines y senderos.',
        image: '',
      },
      {
        title: 'Sendero recreativo y aromático',
        text: 'Recorrido con plantas medicinales, aromáticas y árboles frutales, que culmina en un bosquecillo con aves tropicales.',
        image: '',
      },
      {
        title: 'Áreas verdes para yoga y ejercicio',
        text: 'Espacios amplios entre árboles y naturaleza, ideales para relajación, yoga, ejercicio y actividades familiares al aire libre.',
        image: '',
      },
      {
        title: 'Salir a caminar',
        text: 'Caminatas rurales hacia Villa Blanca, con vistas de praderas, vacas pastando, lecherías tradicionales y el valle del río El Silencio.',
        image: '',
      },
      {
        title: 'Andar en bici',
        text: 'Rutas rurales de San Ramón hacia Zarcero o Bajo Rodríguez. Rentamos 2 bicicletas a ₡5.000 cada una.',
        image: '',
      },
    ],
    zoneOptions: [
      {
        title: 'Canopy',
        text: 'Deslizate entre las copas de los árboles en el Parque de Aventura San Luis. También hay tarzan swing y superman style.',
        image: '',
      },
      {
        title: 'Puentes colgantes',
        text: 'Recorrido suspendido entre nubes y selva para apreciar el bosque desde otra perspectiva.',
        image: '',
      },
      {
        title: 'Bungee jumping y sky bike',
        text: 'Salto al vacío en el bosque para una experiencia adrenalínica, con Costa Rica Eco Bungee.',
        image: '',
      },
      {
        title: 'Tours en la zona',
        text: 'Observación del quetzal y el pájaro campana, visita al trapiche tradicional, chapulitour, caminatas rurales y senderismo a la catarata La Danta, con Explore Occidente CR.',
        image: '',
      },
    ],
    gastronomyIntro: 'Alternativas de alimentación cercanas al hospedaje:',
    gastronomyItems: [
      'Sodas locales con comida típica costarricense',
      'Pizzerías y cafeterías cercanas al hospedaje',
      'Opciones variadas a pocos minutos en carro del chalet',
    ],
    gastronomyImage: '',
  });

  console.log('Datos de ejemplo cargados correctamente');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
