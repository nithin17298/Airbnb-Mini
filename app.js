if(process.env.NODE_ENV !="production"){
require("dotenv").config();
}

//console.log(process.env.SECRET)

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

//const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASTDB_URl;

main().then(()=>{console.log("connected to DB");})
.catch((err) => console.log(err));
async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
  mongoUrl:dbUrl,
crypto:{
  secret:process.env.SECRET,  
},
 touchAfter:24*60*60,
});

store.on("error",()=>{
  console.log("error in mongo session store");
});
const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+1000*60*60*24*7,
    maxAge:1000*60*60*24*7,
    httpOnly:true,
  }
};

// app.get("/",(req,res)=>{
//   res.send("Hi I am root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// app.get("/demouser",async (req,res)=>{
//   let fakeUser=new User({
//     email:"Student@gmail.com",
//     username:"fakeUser",
//   });

//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

//listings
app.use("/listings",listingsRouter);
//reviews
app.use("/listings/:id/reviews",reviewsRouter);
//user
app.use("/",userRouter);

// app.get("/testListing",async (req,res)=>{
//   let sampleListing=new Listing({
//      title:"My New Villa",
//      description:"By the beach",
//      price:1200,
//       location:"Calangute, Goa",
//      country:"India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page not Found"));
});

app.use((err,req,res,next)=>{
  let{statusCode=500,message="something went wrong"}=err;
  res.status(statusCode).render("error.ejs",{message});
  //res.status(statusCode).send(mes sage);
});
app.listen(8080,()=>{
  console.log("server is listening to port 8080");
});
