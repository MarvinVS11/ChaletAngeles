const SiteContent = require('../models/SiteContent');

const emptyContent = {
  activities: [],
  zoneOptions: [],
  gastronomyIntro: '',
  gastronomyItems: [],
  gastronomyImage: '',
};

async function getSiteContent(req, res) {
  const content = await SiteContent.findOne();
  res.json(content || emptyContent);
}

async function updateSiteContent(req, res) {
  const { activities, zoneOptions, gastronomyIntro, gastronomyItems, gastronomyImage } = req.body;

  const content = await SiteContent.findOneAndUpdate(
    {},
    { activities, zoneOptions, gastronomyIntro, gastronomyItems, gastronomyImage },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  );

  res.json(content);
}

module.exports = { getSiteContent, updateSiteContent };
