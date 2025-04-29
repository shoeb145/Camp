const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Joi = require("joi");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

const campGround = require("./models/campGround");
const Review = require("./models/review");

const { campSchema, reviewSchema } = require("./schema.js");

mongoose.connect("mongodb://localhost:27017/camp");
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error")
);
mongoose.connection.once("open", () => {
  console.log("database connected");
});

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
  const { error } = campSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  console.log(req.body);
  console.log(error);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new.ejs");
});
app.get("/campgrounds/:id", async (req, res) => {
  const campground = await campGround
    .findById(req.params.id)
    .populate("reviews");
  console.log(campground);
  res.render("campgrounds/show.ejs", { campground });
});
app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res, next) => {
    const campground = await campGround.findById(req.params.id);
    res.render("campgrounds/edit.ejs", { campground });
  })
);
app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await campGround.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError("invalid campground data", 400);

    const camp = new campGround(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
  })
);

app.get(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    const campgrounds = await campGround.find({});
    res.render("campgrounds/index.ejs", { campgrounds });
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    await campGround.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res, next) => {
    const camp = await campGround.findById(req.params.id);
    const review = await new Review(req.body.review);

    camp.reviews.push(review);
    console.log(camp);
    await review.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await campGround.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

app.get("/", (req, res) => {
  res.render("home.ejs");
});
app.all("*", (req, res, next) => {
  next(new ExpressError("page not found ", 400));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message == "something went wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("server on port 3000");
});
