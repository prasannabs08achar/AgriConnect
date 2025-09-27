# AgriConnect

**Short description:** AgriLink is a MERN web app connecting farmers directly with buyers — crop listings, geospatial search,  orders, market price comparison, and logistics support.

## Live demo
- Frontend: Not delpoyed
- Backend: Not deployed
(Or: Not deployed — follow setup below to run locally)

## Features
- Role-based auth: Farmer & Buyer (JWT)
- Crop CRUD: Add, edit, delete crop listings with photos
- Search & filters: name, category, price, nearby (geospatial)
- Buyer↔Farmer contact: real-time chat (Socket.IO -needs to be implement)
- Orders 
- Market price integration (Agmarknet) — show mandi vs asking price


## Tech Stack
- Frontend: React, Tailwind CSS, Axios
- Backend: Node.js, Express, MongoDB (Mongoose),JavaScript
- Storage: Cloudinary


## Quick Start (Local)
### Prereqs
- Node.js >= 16, npm, MongoDB Atlas or local MongoDB

### Backend
```bash
cd backend
cp .env.example .env
# edit .env with your keys
npm install
npm run dev
