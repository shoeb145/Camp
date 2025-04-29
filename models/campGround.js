const mongoose = require("mongoose");
const Review = require("./review");

mongoose.connect("mongodb://localhost:27017/camp");

const Schema = mongoose.Schema;

const CampGroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  image: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});
CampGroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

module.exports = mongoose.model("Campground", CampGroundSchema);
