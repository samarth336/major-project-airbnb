const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn,isOwner,validateListing } = require('../middleware.js');
const listingsController = require('../controllers/listings.js');


// Index Route
router.get("/", wrapAsync(listingsController.index));

// New Route
router.get("/new", isLoggedIn, wrapAsync(listingsController.newForm));


// Create Route
router.post("/", validateListing, wrapAsync(listingsController.createListing));

// Show Route
router.get("/:id", wrapAsync(listingsController.showListing));




// Edit Route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.editForm));

//update route

router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingsController.updateListing));

// Delete route
router.delete("/:id",isLoggedIn, isOwner, wrapAsync(listingsController.destroyListing));

module.exports = router;