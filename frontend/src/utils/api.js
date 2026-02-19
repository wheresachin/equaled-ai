// Central API base URL.
// In development:  Vite proxy forwards /api/* to localhost:5000 (via vite.config.js)
// In production:   Set VITE_API_URL=https://your-backend.onrender.com in Vercel env vars
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
