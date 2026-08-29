# Rudhra Bags & Footwears — Service Booking Website

A mobile-first website for footwear repair, bag repair/remodeling, pickup & delivery, and prepaid service booking.

## Included
- Professional responsive homepage
- Footwear services highlighted first
- Bag repair/remodeling section
- Service booking form
- Photo upload field
- Pickup/delivery details
- Booking ID generation
- WhatsApp booking handoff
- Node/Express backend starter
- Razorpay order-creation backend starter
- `.env.example` for payment keys

## Run locally
1. Install Node.js.
2. Open this folder in a terminal.
3. Run `npm install`
4. Copy `.env.example` to `.env`
5. Add Razorpay test/live credentials.
6. Run `npm start`
7. Open `http://localhost:3000`

## Important production step
The supplied UI deliberately does not pretend to take real money. Before going live, connect:
- Razorpay checkout on the frontend
- `/api/create-order` to create the order
- payment signature verification on the server
- a database for bookings/customers/status
- secure cloud storage for uploaded photos

Business:
Rudhra Bags & Footwears
Near Railway Gate, RTC Complex, Tekkali, Srikakulam District, Andhra Pradesh
9059087311
Payment: Prepaid
