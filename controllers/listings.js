const Listing=require("../models/listing.js");
//Index Route
module.exports.index=async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
};
//New Route
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
  };
//Show Route
module.exports.showListing=async (req,res,next)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",
      populate:{
        path:"author",
      },
    }).populate("owner");
    if(!listing){
      req.flash("error","listing you requested for does not exist");
      res.redirect("/listings");
    }

    res.render("listings/show.ejs",{listing});
 };
//Create Route
module.exports.createListing=async(req,res,next)=>{
    //let {title,description,image,price,country,location}=req.body;
       let url=req.file.path;
       let filename=req.file.filename;
       const newListing=new Listing(req.body.listing);
       newListing.owner=req.user._id;
       newListing.image={url,filename};
       await newListing.save();
       req.flash("success","Successfully created a new listing");
       res.redirect("/listings");  
  };
//Edit Route
module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
     req.flash("error","listing you requested for does not exist");
     res.redirect("/listings");
   }
   let original_image=listing.image.url
   original_image=original_image.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,original_image});
  };
  
//Update Route
module.exports.updateListing=async (req,res)=>{
  let {id}=req.params;
   let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
   //image upload
   if(typeof req.file!=="undefined"){
   let url=req.file.path;
   let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
   }
   req.flash("success","Listing Updated");
   res.redirect(`/listings/${id}`);
}
//Delete Route
module.exports.destroyListing=async(req,res)=>{
     let {id}=req.params;
     let deletedlisting= await Listing.findByIdAndDelete(id);
     console.log(deletedlisting);
     req.flash("success","Listing Deleted ");
      res.redirect("/listings");
   };