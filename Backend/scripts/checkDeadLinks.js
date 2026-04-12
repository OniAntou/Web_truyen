require('dotenv').config();
const { Pages, connectDB, mongoose } = require('../Database/database');

async function checkDeadLinks() {
  await connectDB();
  const failingPages = await Pages.find({ image_url: { $regex: /^r2:(?!.*\.webp$)/ } }).limit(5);
  console.log('--- Failing Pages Examples ---');
  failingPages.forEach(p => console.log(`Page: ${p._id}, URL: ${p.image_url}`));
  await mongoose.disconnect();
}

checkDeadLinks();
