# Vercel Deployment Guide

## Configuration Files Created

1. **Root `vercel.json`** - Monorepo configuration (if deploying both frontend & backend together)
2. **`backend/vercel.json`** - Backend-specific configuration
3. **`frontend/vercel.json`** - Frontend-specific configuration

---

## Deployment Options

### Option 1: Frontend Only (Recommended)
Deploy the frontend to Vercel, keep backend on Railway.

**Steps:**
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set Project Root: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_API_BASE_URL` = Your backend URL (e.g., `https://your-backend.railway.app`)

---

### Option 2: Full Stack on Vercel (Monorepo)
Deploy both frontend and backend to Vercel.

**Steps:**
1. In Vercel Dashboard → New Project → Import Git Repository
2. Configure:
   - **Project Root:** Leave blank (root-level vercel.json)
   - **Build Command:** `npm run build`
   - **Output Directory:** `frontend/dist`
3. Add Environment Variables in Vercel Dashboard:
   ```
   DATABASE_URL = postgresql://user:password@host:port/database
   JWT_SECRET = your-secret-key
   VITE_API_BASE_URL = your-vercel-api-domain.vercel.app
   FRONTEND_URL = your-vercel-frontend-domain.vercel.app
   NODE_ENV = production
   ```

---

## Required Environment Variables

### Backend
```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-jwt-secret-key
NODE_ENV=production
```

### Frontend
```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

---

## Setup Instructions

### 1. Connect to Vercel
```bash
npm i -g vercel
vercel link
```

### 2. Deploy Frontend
```bash
cd frontend
vercel deploy --prod
```

### 3. Deploy Backend (Optional - if using Vercel)
```bash
cd backend
vercel deploy --prod
```

---

## Important Notes

- **Database Connection:** Ensure your PostgreSQL database is accessible from Vercel
- **API Timeout:** Backend serverless functions have a max timeout of 60 seconds
- **CORS:** Update backend CORS settings with your Vercel domain
- **Environment Variables:** Add secrets to Vercel project settings (never commit .env files)

---

## Troubleshooting

### Build Fails
- Check `package.json` scripts
- Verify Node version: `"engines": { "node": ">=18.0.0" }`

### API Connection Issues
- Verify `VITE_API_BASE_URL` matches backend domain
- Check CORS configuration in backend

### Database Connection Errors
- Test DATABASE_URL connectivity
- Ensure database is publicly accessible
- Add Vercel IPs to database firewall (if using Railway)

---

## Post-Deployment Checklist

- ✅ Test API endpoints
- ✅ Verify authentication flow
- ✅ Check database migrations ran
- ✅ Monitor performance in Vercel Analytics
- ✅ Set up error tracking (e.g., Sentry)
