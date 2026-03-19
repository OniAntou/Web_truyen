const mongoose = require('mongoose');
const { ComicView, Comic } = require('../Database/database');

async function fix() {
  await ComicView.deleteMany({});
  console.log("Wiped ComicViews to reset state");
  process.exit(0);
}
fix();
