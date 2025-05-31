const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const Review = require("../models/review"); 
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js'); 
const reviewsController = require('../controllers/reviews.js');

// POST Route - Add isLoggedIn middleware to ensure only logged-in users can post reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewsController.createReview));

// DELETE Route - Add authorization check
router.delete("/:reviewId", isLoggedIn,isReviewAuthor, wrapAsync(reviewsController.deleteReview));

module.exports = router;