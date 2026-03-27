const { Comic } = require('../../Database/database');
const asyncHandler = require('../middleware/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  const comicCount = await Comic.countDocuments();
  const comics = await Comic.find();
  let totalViews = 0;

  comics.forEach((c) => {
    totalViews += (c.views || 0);
  });

  const formatViews = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  res.json({
    totalComics: comicCount,
    totalViews: formatViews(totalViews),
  });
});

module.exports = {
  getStats
};
