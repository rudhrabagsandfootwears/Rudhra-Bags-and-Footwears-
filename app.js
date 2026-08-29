const form=document.getElementById("bookingForm"), modal=document.getElementById("modal"), modalText=document.getElementById("modalText"), wa=document.getElementById("wa");
const date=document.getElementById("date"); date.min=new Date().toISOString().split("T")[0];

function selectService(s){document.getElementById("service").value=s;document.getElementById("booking").scrollIntoView({behavior:"smooth"});}
function closeModal(){modal.style.display="none"}

form.addEventListener("submit", async e=>{
 e.preventDefault();
 const data=new FormData(form);
 const bookingId="RBF-"+Date.now().toString().slice(-8);
 const name=data.get("name"), phone=data.get("phone"), service=data.get("service");
 // Production: POST this FormData to /api/bookings and start Razorpay checkout after the server creates the order.
 const msg=`Hi Rudhra Bags & Footwears,%0A%0ABooking ID: ${bookingId}%0AName: ${name}%0AMobile: ${phone}%0AService: ${service}%0APickup/Delivery: ${data.get("mode")}%0AAddress: ${data.get("address")}%0ADate: ${data.get("date")}%0ATime: ${data.get("time")}%0ANotes: ${data.get("notes")||"—"}`;
 wa.href="https://wa.me/919059087311?text="+msg;
 modalText.textContent=`Your request ${bookingId} has been prepared. Please send the booking details on WhatsApp. Prepaid payment is the confirmation step in the production checkout.`;
 modal.style.display="flex";
});