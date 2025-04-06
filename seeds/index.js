const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelper");

const campGround = require("../models/campGround");

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error")
);
mongoose.connection.once("open", () => {
  console.log("database connected");
});
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
  await campGround.deleteMany({});
  for (let i = 0; i < 50; i++) {
    let random1000 = Math.floor(Math.random() * 1000);
    const camp = new campGround({
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
    });
    await camp.save();
  }
};

seedDb().then(() => {
  mongoose.connection.close();
});
