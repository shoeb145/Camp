const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const campGround = require("./models/campGround");
mongoose.connect("mongodb://localhost:27017/camp");
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error")
);
mongoose.connection.once("open", () => {
  console.log("database connected");
});

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new.ejs");
});
app.get("/campgrounds/:id", async (req, res) => {
  const campground = await campGround.findById(req.params.id);
  res.render("campgrounds/show.ejs", { campground });
});
app.get("/campgrounds/:id/edit", async (req, res) => {
  const campground = await campGround.findById(req.params.id);
  res.render("campgrounds/edit.ejs", { campground });
});
app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await campGround.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
});
app.post("/campgrounds", async (req, res) => {
  const camp = new campGround(req.body.campground);
  await camp.save();
  res.redirect(`/campgrounds/${camp._id}`);
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await campGround.find({});
  res.render("campgrounds/index.ejs", { campgrounds });
});

app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await campGround.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});
app.get("/", (req, res) => {
  res.render("home.ejs");
});
app.listen(3000, () => {
  console.log("server on port 3000");
});
