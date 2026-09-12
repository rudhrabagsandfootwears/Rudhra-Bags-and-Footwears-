require("dotenv").config();
const express=require("express");
const cors=require("cors");
const multer=require("multer");
const path=require("path");
const fs=require("fs");
const sqlite3=require("sqlite3").verbose();
const bcrypt=require("bcryptjs");
const session=require("express-session");

const app=express();
const PORT=process.env.PORT||3000;
const ROOT=__dirname;
const UPLOADS=path.join(ROOT,"uploads");
if(!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS,{recursive:true});

const db=new sqlite3.Database(path.join(ROOT,"rudhra.db"));
db.serialize(()=>{
 db.run(`CREATE TABLE IF NOT EXISTS bookings(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, phone TEXT NOT NULL, service TEXT NOT NULL,
  mode TEXT NOT NULL, address TEXT NOT NULL, pickup_date TEXT NOT NULL,
  time TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'NEW',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
 )`);
 db.run(`CREATE TABLE IF NOT EXISTS photos(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id TEXT NOT NULL, filename TEXT NOT NULL, original_name TEXT
 )`);
 db.run(`CREATE TABLE IF NOT EXISTS admins(
  id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
 )`,()=>{
   const u=process.env.ADMIN_USERNAME||"admin";
   const p=process.env.ADMIN_PASSWORD||"change-this-password";
   db.get("SELECT id FROM admins WHERE username=?",[u],(e,row)=>{
     if(!row) db.run("INSERT INTO admins(username,password_hash) VALUES(?,?)",[u,bcrypt.hashSync(p,12)]);
   });
 });
 db.run(`CREATE TABLE IF NOT EXISTS updates(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'GENERAL',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
 )`);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
 secret:process.env.SESSION_SECRET||"change-this-secret",
 resave:false,saveUninitialized:false,
 cookie:{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:1000*60*60*8}
}));
app.use("/uploads",express.static(UPLOADS));
app.use(express.static(ROOT));

const storage=multer.diskStorage({
 destination:(_,__,cb)=>cb(null,UPLOADS),
 filename:(_,file,cb)=>cb(null,Date.now()+"-"+Math.random().toString(36).slice(2,9)+path.extname(file.originalname).toLowerCase())
});
const upload=multer({storage,limits:{files:6,fileSize:8*1024*1024},fileFilter:(_,f,cb)=>cb(null,/^image\//.test(f.mimetype))});

function auth(req,res,next){if(req.session.adminId)return next();return res.status(401).json({error:"Unauthorized"});}
function now(){return new Date().toISOString();}
function bookingId(){return "RBF-"+Date.now().toString().slice(-8)+Math.floor(Math.random()*90+10);}
function publicBooking(b){return {bookingId:b.booking_id,name:b.name,service:b.service,mode:b.mode,pickupDate:b.pickup_date,time:b.time||"",status:b.status,createdAt:b.created_at,updatedAt:b.updated_at};}

app.post("/api/bookings",upload.array("photos",6),(req,res)=>{
 const b=bookingId(), d=req.body, t=now();
 if(!d.name||!d.phone||!d.service||!d.mode||!d.address||!d.date) return res.status(400).json({error:"Missing required booking details"});
 db.run(`INSERT INTO bookings(booking_id,name,phone,service,mode,address,pickup_date,time,notes,status,created_at,updated_at)
 VALUES(?,?,?,?,?,?,?,?,?,'NEW',?,?)`,
 [b,d.name.trim(),d.phone.trim(),d.service,d.mode,d.address.trim(),d.date,d.time||"",d.notes||"",t,t],function(err){
   if(err)return res.status(500).json({error:"Could not save booking"});
   const files=req.files||[];
   const stmt=db.prepare("INSERT INTO photos(booking_id,filename,original_name) VALUES(?,?,?)");
   files.forEach(f=>stmt.run(b,f.filename,f.originalname)); stmt.finalize();
   res.json({bookingId:b,status:"NEW"});
 });
});

// Public order tracking: booking ID + phone are required.
app.get("/api/track",(req,res)=>{
 const id=(req.query.bookingId||"").trim().toUpperCase();
 const phone=(req.query.phone||"").replace(/\D/g,"");
 if(!id||phone.length<10) return res.status(400).json({error:"Enter your booking ID and 10-digit mobile number."});
 db.get("SELECT * FROM bookings WHERE booking_id=? AND phone=?",[id,phone],(e,b)=>{
   if(e)return res.status(500).json({error:"Could not check booking status"});
   if(!b)return res.status(404).json({error:"Booking not found. Check the Booking ID and mobile number."});
   res.json(publicBooking(b));
 });
});

// Publicly visible special updates/posts.
app.get("/api/updates",(req,res)=>{
 db.all("SELECT id,title,message,type,created_at,updated_at FROM updates WHERE active=1 ORDER BY id DESC LIMIT 12",(e,rows)=>{
   if(e)return res.status(500).json({error:"Could not load updates"});
   res.json(rows||[]);
 });
});

app.post("/api/admin/login",(req,res)=>{
 const {username,password}=req.body||{};
 db.get("SELECT * FROM admins WHERE username=?",[username],(e,row)=>{
   if(e||!row||!bcrypt.compareSync(password||"",row.password_hash)) return res.status(401).json({error:"Invalid username or password"});
   req.session.adminId=row.id; req.session.username=row.username;
   res.json({ok:true,username:row.username});
 });
});
app.post("/api/admin/logout",auth,(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/admin/me",(req,res)=>res.json({loggedIn:!!req.session.adminId,username:req.session.username||null}));

app.get("/api/admin/stats",auth,(req,res)=>{
 db.all(`SELECT status,COUNT(*) count FROM bookings GROUP BY status`,(e,rows)=>{
   const stats={total:0,NEW:0,PROCESSING:0,COMPLETED:0,CANCELLED:0};
   (rows||[]).forEach(r=>{stats[r.status]=r.count;stats.total+=r.count});
   res.json(stats);
 });
});
app.get("/api/admin/bookings",auth,(req,res)=>{
 const status=req.query.status;
 const q=status&&status!=="ALL"?" WHERE status=?":"";
 db.all(`SELECT * FROM bookings${q} ORDER BY id DESC`,status&&status!=="ALL"? [status]:[],(e,rows)=>{
   if(e)return res.status(500).json({error:"Could not load bookings"});
   res.json(rows||[]);
 });
});
app.get("/api/admin/bookings/:id",auth,(req,res)=>{
 db.get("SELECT * FROM bookings WHERE booking_id=?",[req.params.id],(e,b)=>{
   if(e||!b)return res.status(404).json({error:"Booking not found"});
   db.all("SELECT * FROM photos WHERE booking_id=? ORDER BY id",[b.booking_id],(ee,photos)=>{
     res.json({...b,photos:(photos||[]).map(x=>({...x,url:"/uploads/"+x.filename}))});
   });
 });
});
app.patch("/api/admin/bookings/:id/status",auth,(req,res)=>{
 const allowed=["NEW","PROCESSING","COMPLETED","CANCELLED"], status=req.body?.status;
 if(!allowed.includes(status))return res.status(400).json({error:"Invalid status"});
 db.run("UPDATE bookings SET status=?,updated_at=? WHERE booking_id=?",[status,now(),req.params.id],function(e){
   if(e)return res.status(500).json({error:"Could not update status"});
   if(!this.changes)return res.status(404).json({error:"Booking not found"});
   res.json({ok:true,status});
 });
});

app.get("/api/admin/updates",auth,(req,res)=>{
 db.all("SELECT * FROM updates ORDER BY id DESC",(e,rows)=>{
   if(e)return res.status(500).json({error:"Could not load updates"});
   res.json(rows||[]);
 });
});
app.post("/api/admin/updates",auth,(req,res)=>{
 const title=(req.body?.title||"").trim();
 const message=(req.body?.message||"").trim();
 const type=(req.body?.type||"GENERAL").trim().toUpperCase();
 if(!title||!message)return res.status(400).json({error:"Title and message are required"});
 const t=now();
 db.run("INSERT INTO updates(title,message,type,active,created_at,updated_at) VALUES(?,?,?,1,?,?)",[title,message,type,t,t],function(e){
   if(e)return res.status(500).json({error:"Could not create update"});
   res.json({ok:true,id:this.lastID});
 });
});
app.patch("/api/admin/updates/:id",auth,(req,res)=>{
 const id=req.params.id, active=req.body?.active;
 if(active!==0&&active!==1&&active!==true&&active!==false)return res.status(400).json({error:"Invalid active value"});
 db.run("UPDATE updates SET active=?,updated_at=? WHERE id=?",[active?1:0,now(),id],function(e){
   if(e)return res.status(500).json({error:"Could not update post"});
   if(!this.changes)return res.status(404).json({error:"Update not found"});
   res.json({ok:true});
 });
});
app.delete("/api/admin/updates/:id",auth,(req,res)=>{
 db.run("DELETE FROM updates WHERE id=?",[req.params.id],function(e){
   if(e)return res.status(500).json({error:"Could not delete update"});
   if(!this.changes)return res.status(404).json({error:"Update not found"});
   res.json({ok:true});
 });
});

app.get("/admin",(_,res)=>res.sendFile(path.join(ROOT,"admin.html")));
app.get("*",(req,res)=>{
 if(req.path.startsWith("/api/")) return res.status(404).json({error:"Not found"});
 res.sendFile(path.join(ROOT,"index.html"));
});
app.listen(PORT,()=>console.log(`Rudhra website running on http://localhost:${PORT}`));
