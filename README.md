# Rudhra Bags & Footwears — Admin + Order Tracking

This version keeps the existing booking and WhatsApp flow and adds:
- Private admin login at `/admin`
- Database-backed booking/order management
- Admin order list, search, filters and status updates
- Customer order tracking at `/#tracking` using Booking ID + mobile number
- Admin-published Special Updates / announcements visible on the website
- Publish/hide/delete controls for updates
- Existing booking photo uploads and WhatsApp actions

## Run
1. Copy `.env.example` to `.env`.
2. Set strong `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SESSION_SECRET` values.
3. Run `npm install`.
4. Run `npm start`.
5. Open the website at `http://localhost:3000` and admin at `http://localhost:3000/admin`.

Do not use the example/default secrets in production.
