const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const galleryItemSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    caption: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const siteContentSchema = new mongoose.Schema(
  {
    activities: [cardSchema],
    zoneOptions: [cardSchema],
    gastronomyIntro: { type: String, default: '' },
    gastronomyItems: [{ type: String }],
    gastronomyImage: { type: String, default: '' },
    gallery: [galleryItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
