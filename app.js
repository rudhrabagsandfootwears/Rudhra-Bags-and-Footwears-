const form=document.getElementById("bookingForm"), modal=document.getElementById("modal"), modalText=document.getElementById("modalText"), wa=document.getElementById("wa");
const date=document.getElementById("date"); date.min=new Date().toISOString().split("T")[0];

function selectService(s){document.getElementById("service").value=s;document.getElementById("booking").scrollIntoView({behavior:"smooth"});}
function closeModal(){modal.style.display="none"}

form.addEventListener("submit", async e=>{
 e.preventDefault();
 const data=new FormData(form);
 const bookingId="RBF-"+Date.now().toString().slice(-8);
 const name=data.get("name"), phone=data.get("phone"), service=data.get("service");
 // No online payment is required. The booking is sent to WhatsApp for confirmation.
 const msg = `Hi Rudhra Bags & Footwears,

Booking ID: ${bookingId}
Name: ${name}
Mobile: ${phone}
Service: ${service}
Pickup/Delivery: ${data.get("mode")}
Address: ${data.get("address")}
Date: ${data.get("date")}
Time: ${data.get("time")}
Notes: ${data.get("notes")||"—"}`;
 // Encode the complete message so spaces, &, line breaks and user-entered text are preserved.
 wa.href="https://wa.me/919059087311?text="+encodeURIComponent(msg);
 modalText.textContent=`Your request ${bookingId} is ready. Please send the booking details on WhatsApp to confirm your service request.`;
 modal.style.display="flex";
});