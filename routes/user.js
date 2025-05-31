const express = require('express');
const router = express.Router();
const User=require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync.js');
const passport=require('passport');
const { saveredirectUrl } = require('../middleware.js');
const userController = require('../controllers/users.js');
const user = require('../models/user.js');
router
.route("/signup")
.get(userController.renderSignupform)
.post(wrapAsync(userController.sighnUp));



router.get("/login", (userController.renderLoginform));

router.post("/login", saveredirectUrl, passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}) ,wrapAsync(userController.login));

router.get("/logout",userController.logout);

module.exports=router;