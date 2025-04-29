const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/camp");

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  body: String,
  rating: Number,
});

module.exports = new mongoose.model("Review", reviewSchema);
