const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
