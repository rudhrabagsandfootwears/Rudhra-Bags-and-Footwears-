// Optional production backend (Node.js + Express + Razorpay).
// Install: npm install express multer razorpay dotenv cors
// Run: node server.js
require("dotenv").config();
const express=require("express"), cors=require("cors"), multer=require("multer");
const Razorpay=require("razorpay");
const path=require("path");
const app=express(), upload=multer({dest:"uploads/"});
app.use(cors()); app.use(express.json()); app.use(express.static(__dirname));
const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
 key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET
}) : null;

app.post("/api/create-order", async (req,res)=>{
 try{
  if(!razorpay) return res.status(503).json({error:"Razorpay keys are not configured"});
  const {amount,bookingId}=req.body;
  const order=await razorpay.orders.create({amount:Math.round(Number(amount)*100),currency:"INR",receipt:bookingId});
  res.json(order);
 }catch(e){res.status(500).json({error:e.message})}
});

app.post("/api/bookings", upload.array("photos",6), (req,res)=>{
 const bookingId="RBF-"+Date.now().toString().slice(-8);
 // TODO: save booking + uploaded file paths to your database.
 res.json({bookingId,status:"PAYMENT_PENDING"});
});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"index.html")));
app.listen(process.env.PORT||3000,()=>console.log("Rudhra website running on http://localhost:3000"));