const mongoose = require("mongoose");
const { Comic } = require("./src/database");

async function check() {
  const MONGO_URI = "mongodb://localhost:27017/skycomic";
  await mongoose.connect(MONGO_URI);
  const count = await Comic.countDocuments({});
  console.log("Total comics in DB:", count);
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
