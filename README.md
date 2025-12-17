## iBhakt DT Frontend (React + Vite)

### Setup
```bash
cd /Users/rahulgudadhe/Desktop/ib_db/frontend
npm install
npm run dev
```

- The dev server runs at `http://localhost:5173` and proxies `/api` to the backend at `http://localhost:8000`.
- Ensure the FastAPI backend is running.

### Environment Variables

Create a `.env` file in the `frontend` directory (see `.env.example` for reference):

```bash
# Backend API URL (optional, defaults to http://localhost:8000)
VITE_BACKEND_URL=http://localhost:8000

# Public URL for referral links (REQUIRED for production)
# This should be your production domain, e.g., https://ibhakt.com
# If not set, will use window.location.origin (localhost in dev)
VITE_PUBLIC_URL=https://your-domain.com
```

**Important for Referral Links:**
- In **development**: The referral links will use `http://localhost:5173` (only works locally)
- In **production**: You MUST set `VITE_PUBLIC_URL` to your production domain (e.g., `https://ibhakt.com`) so referral links work for external users
- Without `VITE_PUBLIC_URL` set in production, referral links will point to localhost and won't work for external users
