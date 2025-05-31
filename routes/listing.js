const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn,isOwner,validateListing } = require('../middleware.js');
const listingsController = require('../controllers/listings.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js'); // Assuming you have a cloudConfig.js for cloud storage
const upload = multer({ storage });

router
.route("/")
.get(wrapAsync(listingsController.index))
.post(isLoggedIn, upload.single("image"), validateListing, wrapAsync(listingsController.createListing))


// New Route
router.get("/new", isLoggedIn, listingsController.newForm);

router
.route("/:id")
.get(wrapAsync(listingsController.showListing))
.put(isLoggedIn, isOwner, upload.single("image"), validateListing, wrapAsync(listingsController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingsController.destroyListing));




// Edit Route

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.editForm));

module.exports = router;