# Luxe Commerce

A full-stack luxury e-commerce app: storefront + admin (`/admin`) on Vite + React, with a Node/Express + MongoDB backend.

## Stack
- **Client**: Vite, React 18 (JS), React Router v6, Redux Toolkit + redux-persist, Tailwind, framer-motion, Recharts, react-hook-form + zod, react-hot-toast, embla-carousel, lucide-react, dnd-kit, react-quill, papaparse, workbox.
- **Server**: Node, Express, Mongoose, JWT (access + refresh), bcrypt, Cloudinary (with local-disk dev fallback), Razorpay, Nodemailer, socket.io, pdfkit.

## Quick start
```bash
# from repo root
npm install                 # installs all workspaces
cp server/.env.example server/.env       # then fill in real values
cp client/.env.example client/.env
npm run seed                # populate demo data (optional, requires Mongo)
npm run dev                 # boots client (5173) + server (4000)
```

Default seeded super admin: `admin@luxe.dev` / `Admin@123` → log in at `/admin/login`.

## Layout
```
client/     Vite React app — storefront + /admin
server/     Express API + MongoDB
```

## Notes
- Cloudinary keys are optional in dev; the server falls back to local `server/uploads/` when keys are missing.
- Razorpay runs in test mode until you swap in live keys.
- All secrets live in `.env` (see `.env.example` for required keys).
# E-commerce
