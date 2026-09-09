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

form.addEventListener("submit", e=>{
  e.preventDefault();
  const data=new FormData(form);
  const bookingId="RBF-"+Date.now().toString().slice(-8);
  const name=(data.get("name")||"").toString().trim();
  const phone=(data.get("phone")||"").toString().trim();
  const service=(data.get("service")||"").toString().trim();
  const mode=(data.get("mode")||"").toString().trim();
  const address=(data.get("address")||"").toString().trim();
  const pickupDate=(data.get("date")||"").toString().trim();
  const time=(data.get("time")||"").toString().trim();
  const notes=(data.get("notes")||"").toString().trim() || "—";

  bookingMessage = `Hi Rudhra Bags & Footwears,\n\nNEW SERVICE BOOKING\nBooking ID: ${bookingId}\nName: ${name}\nMobile: ${phone}\nService: ${service}\nPickup/Delivery: ${mode}\nAddress: ${address}\nPreferred Date: ${pickupDate}\nPreferred Time: ${time}\nNotes: ${notes}\n\nPlease confirm my service request.`;

  modalText.textContent=`Your request ${bookingId} is ready. Please send the booking details on WhatsApp to confirm your service request.`;
  modal.style.display="flex";
});
