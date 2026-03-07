// Central API base URL.
// In development:  Uses empty string to rely on Vite proxy to localhost:5000 (via vite.config.js)
// In production:   Set VITE_API_URL=https://your-backend.onrender.com in Vercel env vars
// For mobile testing on local network: Set VITE_API_URL=http://<your-local-ip>:5000
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://equaled-backend.onrender.com');

export default API_BASE;
