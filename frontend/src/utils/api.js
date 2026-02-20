// Central API base URL.
// In development:  Vite proxy forwards /api/* to localhost:5000 (via vite.config.js)
// In production:   Set VITE_API_URL=https://your-backend.onrender.com in Vercel env vars
// MODIFIED FOR MOBILE TESTING: Always use production backend so local network devices can connect
const API_BASE = import.meta.env.VITE_API_URL || 'https://equaled-backend.onrender.com';

export default API_BASE;
