const ChaletInfo = require('../models/ChaletInfo');

async function getChaletInfo(req, res) {
  const info = await ChaletInfo.findOne();
  if (!info) {
    return res.status(404).json({ message: 'Información del chalet no configurada todavía' });
  }
  res.json(info);
}

async function updateChaletInfo(req, res) {
  const { title, description, location, pricePerNight, maxGuests, amenities, images, image, rules } =
    req.body;

  const info = await ChaletInfo.findOneAndUpdate(
    {},
    { title, description, location, pricePerNight, maxGuests, amenities, images, image, rules },
    { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json(info);
}

module.exports = { getChaletInfo, updateChaletInfo };
