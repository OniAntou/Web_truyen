const mongoose = require('mongoose');
const { Comic, ComicView, User } = require('../Database/database');

async function test() {
  const views = await ComicView.find();
  console.log("Total ComicViews:", views.length);
  const comics = await Comic.find({ views: { $gt: 0 } }).sort({ views: -1 }).limit(3);
  console.log("Top comics by views:", comics.map(c => ({ id: c._id, title: c.title, views: c.views })));
  process.exit(0);
}
test();
