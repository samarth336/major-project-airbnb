const Listing = require("../models/listing");

module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.newForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing=async (req, res) => {
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
    console.log(listing)
    // console.log("Rendering listing...");
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing=async (req, res) => {
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
}

module.exports.editForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error","Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id)
    req.flash("success","Listing Deleted!");
    // console.log(deletedListing);
    res.redirect("/listings");
}