const express=require("express");
const router=express.Router({});
const wrapasync = require("../utils/wrapasync.js");
const passport=require("passport");
const {isLoggedIn, saveRedirectUrl}=require("../middleware.js");
const userController=require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapasync(userController.signup));

//router.get("/signup",userController.renderSignupForm); //signup form

//router.post("/signup",wrapasync(userController.signup)); //signup post route

//login route
router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),userController.login);
//router.get("/login",userController.renderLoginForm);

//router.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),userController.login);

//logout route
router.get("/logout",isLoggedIn,userController.logout);

module.exports=router;
