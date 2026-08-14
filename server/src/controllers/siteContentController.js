const SiteContent = require('../models/SiteContent');

const emptyContent = {
  aboutBlocks: [],
  activities: [],
  zoneOptions: [],
  gastronomyIntro: '',
  gastronomyItems: [],
  gastronomyImage: '',
  gallery: [],
};

async function getSiteContent(req, res) {
  const content = await SiteContent.findOne();
  res.json(content || emptyContent);
}

async function updateSiteContent(req, res) {
  const {
    aboutBlocks,
    activities,
    zoneOptions,
    gastronomyIntro,
    gastronomyItems,
    gastronomyImage,
    gallery,
  } = req.body;

  const content = await SiteContent.findOneAndUpdate(
    {},
    { aboutBlocks, activities, zoneOptions, gastronomyIntro, gastronomyItems, gastronomyImage, gallery },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  );

  res.json(content);
}

module.exports = { getSiteContent, updateSiteContent };
