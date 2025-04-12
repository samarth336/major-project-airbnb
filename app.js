const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("../major project backend/models/listing");
const Review = require("../major project backend/models/review");
const path = require("path");
const methodOverride = require("method-override");
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const ejsMate = require("ejs-mate");
const { url } = require('inspector');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const { listingSchema , review, reviewSchema } = require('./schema.js');
const listings=require('./routes/listing.js');
const reviews=require('./routes/review.js');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main().then(() => {
    console.log("connected DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
    res.send("working well..");
});

app.use("/listings", listings);

app.use("/listings/:id/reviews", reviews);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("listing on port:https://localhost:8080");
})