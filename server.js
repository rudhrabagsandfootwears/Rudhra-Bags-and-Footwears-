// Production backend for Rudhra Bags & Footwears — no online payment gateway required.
require("dotenv").config();
const express=require("express"), cors=require("cors"), multer=require("multer");
const path=require("path");
const app=express(), upload=multer({dest:"uploads/"});
app.use(cors()); app.use(express.json()); app.use(express.static(__dirname));

app.post("/api/bookings", upload.array("photos",6), (req,res)=>{
 const bookingId="RBF-"+Date.now().toString().slice(-8);
 // TODO: save booking + uploaded file paths to your database.
 res.json({bookingId,status:"REQUEST_RECEIVED"});
});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"index.html")));
app.listen(process.env.PORT||3000,()=>console.log("Rudhra website running on http://localhost:3000"));
