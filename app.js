const form=document.getElementById("bookingForm"), modal=document.getElementById("modal"), modalText=document.getElementById("modalText"), wa=document.getElementById("wa");
const date=document.getElementById("date");
if(date) date.min=new Date().toISOString().split("T")[0];

function selectService(s){document.getElementById("service").value=s;document.getElementById("booking").scrollIntoView({behavior:"smooth"});}
function closeModal(){modal.style.display="none";}

let bookingMessage="";
if(wa){
  wa.addEventListener("click", function(e){
    e.preventDefault();
    if(!bookingMessage) return;
    const url="https://web.whatsapp.com/send?phone=919059087311&text="+encodeURIComponent(bookingMessage);
    window.open(url,"_blank","noopener,noreferrer");
  });
}
form.addEventListener("submit", async e=>{
  e.preventDefault();
  const btn=form.querySelector("button[type=submit]"); btn.disabled=true; btn.textContent="Saving booking...";
  try{
    const response=await fetch("/api/bookings",{method:"POST",body:new FormData(form)});
    const result=await response.json();
    if(!response.ok) throw new Error(result.error||"Could not save booking");
    const data=new FormData(form);
    const name=(data.get("name")||"").toString().trim(), phone=(data.get("phone")||"").toString().trim();
    const service=(data.get("service")||"").toString().trim(), mode=(data.get("mode")||"").toString().trim();
    const address=(data.get("address")||"").toString().trim(), pickupDate=(data.get("date")||"").toString().trim();
    const time=(data.get("time")||"").toString().trim(), notes=(data.get("notes")||"").toString().trim()||"—";
    bookingMessage=`Hi Rudhra Bags & Footwears,\n\nNEW SERVICE BOOKING\nBooking ID: ${result.bookingId}\nName: ${name}\nMobile: ${phone}\nService: ${service}\nPickup/Delivery: ${mode}\nAddress: ${address}\nPreferred Date: ${pickupDate}\nPreferred Time: ${time}\nNotes: ${notes}\n\nPlease confirm my service request.`;
    modalText.textContent=`Your request ${result.bookingId} has been saved. Please send the booking details on WhatsApp to confirm your service request.`;
    modal.style.display="flex";
    form.reset(); if(date) date.min=new Date().toISOString().split("T")[0];
  }catch(err){alert(err.message);}
  finally{btn.disabled=false;btn.textContent="Submit Booking & WhatsApp";}
});

// Public order tracking
const trackForm=document.getElementById("trackForm");
const trackResult=document.getElementById("trackResult");
if(trackForm){
 trackForm.addEventListener("submit",async e=>{
  e.preventDefault();
  trackResult.className="track-result";
  trackResult.innerHTML='<div class="muted">Checking your order...</div>';
  try{
   const id=document.getElementById("trackBookingId").value.trim().toUpperCase();
   const phone=document.getElementById("trackPhone").value.replace(/\D/g,"");
   const r=await fetch(`/api/track?bookingId=${encodeURIComponent(id)}&phone=${encodeURIComponent(phone)}`);
   const d=await r.json();
   if(!r.ok) throw new Error(d.error||"Could not find booking");
   const label={NEW:"Booking received",PROCESSING:"Work in progress",COMPLETED:"Service completed",CANCELLED:"Booking cancelled"}[d.status]||d.status;
   trackResult.innerHTML=`<div class="track-top"><div><small>BOOKING ID</small><strong>${escPublic(d.bookingId)}</strong></div><span class="track-pill ${d.status.toLowerCase()}">${escPublic(label)}</span></div><div class="track-info"><div><small>Service</small><b>${escPublic(d.service)}</b></div><div><small>Preferred date</small><b>${escPublic(d.pickupDate)}</b></div><div><small>Time</small><b>${escPublic(d.time||"—")}</b></div><div><small>Last updated</small><b>${escPublic(formatPublicDate(d.updatedAt))}</b></div></div><p class="track-note">If you need help, call <a href="tel:9059087311">9059087311</a> or WhatsApp us.</p>`;
  }catch(err){trackResult.innerHTML=`<div class="track-error">${escPublic(err.message)}</div>`;}
 });
}
function escPublic(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function formatPublicDate(s){try{return new Date(s).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}catch{return s}}

// Special updates published by the admin
async function loadPublicUpdates(){
 const box=document.getElementById("publicUpdates"); if(!box)return;
 try{
  const r=await fetch("/api/updates"); const rows=await r.json();
  if(!rows.length){box.innerHTML='<div class="empty-update">No special updates right now. Please check back soon.</div>';return;}
  box.innerHTML=rows.map(u=>`<article class="update-card"><div class="update-type">${escPublic(u.type||"UPDATE")}</div><h3>${escPublic(u.title)}</h3><p>${escPublic(u.message)}</p><small>${escPublic(formatPublicDate(u.created_at))}</small></article>`).join("");
 }catch{box.innerHTML='<div class="empty-update">Updates are temporarily unavailable.</div>';}
}
loadPublicUpdates();
