const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.newForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    // console.log("Fetching listing...");
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        console.log("Listing not found, redirecting...");
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    // console.log("Rendering listing...");
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res) => {
    // Make sure req.body.listing exists
    if (!req.body.listing) {
        req.body.listing = {};
    }
    
    const { listing } = req.body;
    console.log("listing object:", listing);
    
    // Create new listing object
    const newListing = new Listing(listing);
    
    // Make sure req.user exists before accessing _id
    if (!req.user) {
        req.flash("error", "You must be logged in to create a listing");
        return res.redirect("/login");
    }
    
    // Set the owner to the logged-in user's ID
    newListing.owner = req.user._id;
    
    // Get the file path and filename if a file was uploaded
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    }

    try {
        // Get coordinates using Mapbox Geocoding API
        const geoData = await geocodingClient.forwardGeocode({
            query: listing.location + ', ' + listing.country,
            limit: 1
        }).send();
        
        // Add geometry data to the listing
        if (geoData && geoData.body && geoData.body.features && geoData.body.features.length > 0) {
            newListing.geometry = geoData.body.features[0].geometry;
        } else {
            // Default coordinates if geocoding fails
            newListing.geometry = {
                type: 'Point',
                coordinates: [0, 0]
            };
        }

        // Save the listing
        let saved = await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (error) {
        console.error("Error creating listing:", error);
        req.flash("error", "Error creating listing: " + error.message);
        res.redirect("/listings/new");
    }
}

module.exports.editForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    let originalImage = listing.image.url;
    originalImage = originalImage.replace("/uploads", "/uploads/h_300_w_300");
    res.render("listings/edit.ejs", { listing, originalImage });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    try {
        // Update the basic listing information
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        // Only update the image if a new one is uploaded
        if (req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
        }

        // Update geometry based on location if location or country changed
        if (req.body.listing.location || req.body.listing.country) {
            const geoData = await geocodingClient.forwardGeocode({
                query: req.body.listing.location + ', ' + req.body.listing.country,
                limit: 1
            }).send();
            
            if (geoData && geoData.body && geoData.body.features && geoData.body.features.length > 0) {
                listing.geometry = geoData.body.features[0].geometry;
            }
        }
        
        // Save the updated listing
        await listing.save();
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error updating listing:", error);
        req.flash("error", "Error updating listing: " + error.message);
        res.redirect(`/listings/${id}/edit`);
    }
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id)
    req.flash("success", "Listing Deleted!");
    // console.log(deletedListing);
    res.redirect("/listings");
}