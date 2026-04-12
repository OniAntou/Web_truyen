const sharp = require('sharp');

/**
 * Converts an image buffer to WebP format.
 * @param {Buffer} buffer - Original image buffer
 * @param {number} quality - WebP quality (1-100)
 * @returns {Promise<Buffer>} WebP image buffer
 */
async function convertToWebp(buffer, quality = 80) {
  try {
    return await sharp(buffer)
      .webp({ quality })
      .toBuffer();
  } catch (err) {
    console.error('Error converting image to WebP:', err);
    throw err;
  }
}

module.exports = {
  convertToWebp,
};
