const mongoose = require('mongoose');

const chaletInfoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    heroEyebrow: { type: String, default: 'Tranquilidad, paz y naturaleza' },
    heroDescription: {
      type: String,
      default:
        'Descubrí este rincón de montaña como un espacio de descanso: familias, parejas y grupos de amigos encuentran aquí paz, tranquilidad y naturaleza.',
    },
    pricePerNight: { type: Number, required: true },
    maxGuests: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    image: { type: String, default: '' },
    secondaryTitle: { type: String, default: 'Un lugar para todos' },
    secondaryText: { type: String, trim: true, default: '' },
    secondaryImage: { type: String, default: '' },
    rules: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChaletInfo', chaletInfoSchema);
