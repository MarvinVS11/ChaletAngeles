const mongoose = require('mongoose');

const chaletInfoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    maxGuests: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    rules: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChaletInfo', chaletInfoSchema);
