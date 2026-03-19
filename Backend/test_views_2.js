const mongoose = require('mongoose');
const { Comic } = require('../Database/database');

async function test() {
  const comics = await Comic.find().limit(5);
  console.log("Comics views field types:", comics.map(c => ({ id: c.id || c._id, views: c.views, type: typeof c.views })));
  process.exit(0);
}
test();
