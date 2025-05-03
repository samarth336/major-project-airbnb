const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn,isOwner,validateListing } = require('../middleware.js');



// Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Route
router.get("/new", isLoggedIn, wrapAsync((req, res) => {
    res.render("listings/new.ejs");
}));


// Create Route
router.post("/", validateListing, wrapAsync(async (req, res) => {
    const { listing } = req.body;

    // Check if image or image.url is missing and provide a default value
    if (!listing.image || !listing.image.url || listing.image.url.trim() === "") {
        listing.image = {
            url: "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdXNlfGVufDB8fDB8fHww",
        };
    }

    const newListing = new Listing(listing);
    newListing.owner=req.user._id; // Set the owner to the logged-in user's ID
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}));

// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    // console.log("Fetching listing...");
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");

    if (!listing) {
        console.log("Listing not found, redirecting...");
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    console.log(listing)
    // console.log("Rendering listing...");
    res.render("listings/show.ejs", { listing });
}));




// Edit Route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error","Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//update route

router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// Delete route
router.delete("/:id",isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id)
    req.flash("success","Listing Deleted!");
    // console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;