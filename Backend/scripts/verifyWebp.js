require('dotenv').config();
const { Comic, Pages, connectDB, mongoose } = require('../Database/database');

async function verify() {
  await connectDB();
  
  const totalComics = await Comic.countDocuments({ cover_url: { $regex: /^r2:/ } });
  const nonWebpComics = await Comic.countDocuments({ cover_url: { $regex: /^r2:(?!.*\.webp$)/ } });
  
  const totalPages = await Pages.countDocuments({ image_url: { $regex: /^r2:/ } });
  const nonWebpPages = await Pages.countDocuments({ image_url: { $regex: /^r2:(?!.*\.webp$)/ } });
  
  console.log('--- Verification Result ---');
  console.log(`Comics: ${totalComics} total, ${nonWebpComics} NOT WebP`);
  console.log(`Pages: ${totalPages} total, ${nonWebpPages} NOT WebP`);
  
  await mongoose.disconnect();
}

verify();
