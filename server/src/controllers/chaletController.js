const ChaletInfo = require('../models/ChaletInfo');

async function getChaletInfo(req, res) {
  const info = await ChaletInfo.findOne();
  if (!info) {
    return res.status(404).json({ message: 'Información del chalet no configurada todavía' });
  }
  res.json(info);
}

module.exports = { getChaletInfo };
