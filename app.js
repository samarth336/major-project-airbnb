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
const { listingSchema } = require('./schema.js');

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

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Route
app.get("/listings/new", wrapAsync((req, res) => {
    res.render("listings/new.ejs");
}));


// Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    const { listing } = req.body;

    // Check if image or image.url is missing and provide a default value
    if (!listing.image || !listing.image.url || listing.image.url.trim() === "") {
        listing.image = {
            url: "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdXNlfGVufDB8fDB8fHww",
        };
    }

    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

// Edit Route

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update route

app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// Delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id)
    // console.log(deletedListing);
    res.redirect("/listings");
}));

// Reviews Route
// POST Route

app.post("/listings/:id/reviews", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newRewiew = new Review(req.body.review);
    listing.reviews.push(newRewiew);  
    await newRewiew.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
}));

// app.get("/testListing",async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("succesufully submited");
// })

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