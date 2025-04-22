const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/camp");

const Schema = mongoose.Schema;

const CampGroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  image: String,
  location: String,
});

module.exports = mongoose.model("Campground", CampGroundSchema);
