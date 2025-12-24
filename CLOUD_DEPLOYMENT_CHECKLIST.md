# Cloud Deployment Checklist

Quick reference guide for deploying Hifdh Quest to the cloud using free-tier services.

## Pre-Deployment Checklist

- [ ] Push all code to GitHub repository
- [ ] Ensure all migrations are committed
- [ ] Review application.yml for any hardcoded values
- [ ] Prepare secure passwords and secrets

---

## Deployment Steps

### 1. Database Setup (Neon.tech)
- [ ] Sign up at [neon.tech](https://neon.tech)
- [ ] Create new project
- [ ] Copy connection details:
  - [ ] `DB_HOST`: _________________
  - [ ] `DB_PORT`: `5432`
  - [ ] `DB_NAME`: _________________
  - [ ] `DB_USER`: _________________
  - [ ] `DB_PASSWORD`: _________________

### 2. Redis Setup (Upstash)
- [ ] Sign up at [upstash.com](https://upstash.com)
- [ ] Create Redis database (select closest region)
- [ ] Copy connection details:
  - [ ] `REDIS_HOST`: _________________
  - [ ] `REDIS_PORT`: _________________
  - [ ] `REDIS_PASSWORD`: _________________

### 3. Backend Deployment (Railway/Render)

#### Using Railway
- [ ] Sign up at [railway.app](https://railway.app)
- [ ] Create new project
- [ ] Deploy from GitHub repo
- [ ] Set root directory: `backend`
- [ ] Configure build:
  - Build: `mvn clean package -DskipTests`
  - Start: `java -jar target/*.jar`
- [ ] Add environment variables (see below)
- [ ] Deploy and copy URL: _________________

#### Environment Variables for Backend
```
DB_HOST=<from-step-1>
DB_PORT=5432
DB_NAME=<from-step-1>
DB_USER=<from-step-1>
DB_PASSWORD=<from-step-1>
REDIS_HOST=<from-step-2>
REDIS_PORT=<from-step-2>
REDIS_PASSWORD=<from-step-2>
JWT_SECRET=<generate-random-32-chars>
ADMIN_PASSWORD=<choose-secure-password>
ALLOWED_ORIGINS=http://localhost:5173
PORT=8080
LOG_LEVEL=INFO
SHOW_SQL=false
```

- [ ] Generate JWT_SECRET: `openssl rand -base64 32`
- [ ] Set ADMIN_PASSWORD (save securely)
- [ ] Backend deployed successfully
- [ ] Test backend health: `https://<your-backend-url>/actuator/health`

### 4. Frontend Deployment (Vercel/Netlify)

#### Using Vercel
- [ ] Sign up at [vercel.com](https://vercel.com)
- [ ] Import GitHub repository
- [ ] Set framework: Vite
- [ ] Set root directory: `frontend`
- [ ] Configure build:
  - Build: `npm run build`
  - Output: `dist`
- [ ] Add environment variables:
  ```
  VITE_API_URL=<your-backend-url>
  VITE_WS_URL=<your-backend-url-with-wss>
  ```
  Example:
  ```
  VITE_API_URL=https://hifdh-backend.railway.app
  VITE_WS_URL=wss://hifdh-backend.railway.app
  ```
- [ ] Deploy and copy URL: _________________

### 5. Update CORS Settings
- [ ] Go back to backend deployment (Railway/Render)
- [ ] Update `ALLOWED_ORIGINS` to include frontend URL:
  ```
  ALLOWED_ORIGINS=https://your-app.vercel.app
  ```
- [ ] Redeploy backend

### 6. Database Seeding
- [ ] Connect to Neon database using connection string
- [ ] Run seed files:
  ```bash
  psql "postgresql://user:pass@host/db" -f database/seeds/002_seed_surahs.sql
  psql "postgresql://user:pass@host/db" -f database/seeds/003_seed_reciters.sql
  psql "postgresql://user:pass@host/db" -f database/seeds/004_seed_sample_ayat.sql
  ```

### 7. Testing & Verification
- [ ] Open frontend URL in browser
- [ ] Test login with admin credentials
- [ ] Check browser console (no CORS errors)
- [ ] Test WebSocket connection
- [ ] Create a test game session
- [ ] Test player join flow
- [ ] Test buzzer functionality
- [ ] Check Swagger UI: `<backend-url>/swagger-ui.html`

---

## Post-Deployment

### URLs to Save
- Frontend: _______________________________
- Backend API: ____________________________
- Swagger Docs: ___________________________
- Database: _______________________________
- Redis: __________________________________

### Credentials to Save Securely
- Admin Username: `admin`
- Admin Password: _________________
- Database Password: ______________
- Redis Password: _________________
- JWT Secret: _____________________

### Monitoring
- [ ] Check Railway/Render dashboard for usage
- [ ] Monitor Neon database storage (3GB limit)
- [ ] Monitor Upstash Redis usage (10K commands/day)
- [ ] Set up email alerts for service issues

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Backend won't start | Check logs for DB/Redis connection errors |
| Frontend can't connect | Verify VITE_API_URL and CORS settings |
| WebSocket failing | Use `wss://` not `ws://` for HTTPS |
| Database connection errors | Check connection pool size (max 5 for free tier) |
| CORS errors | Ensure ALLOWED_ORIGINS includes frontend domain |

---

## Cost Monitoring

All services have free tiers, but monitor usage:
- Railway: $5 credit/month (~500 hours)
- Render: 750 hours/month
- Neon: 3GB storage, 100 compute hours/month
- Upstash: 10K commands/day, 256MB storage
- Vercel/Netlify: 100GB bandwidth/month

**Estimated monthly cost: $0** (within free tiers)

---

## Next Steps After Deployment

- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Configure monitoring and alerts
- [ ] Set up automated backups for database
- [ ] Plan for scaling if usage exceeds free tier
- [ ] Document deployment process for team

---

## Support

If you encounter issues:
1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting
2. Review service-specific documentation:
   - [Railway Docs](https://docs.railway.app)
   - [Render Docs](https://render.com/docs)
   - [Vercel Docs](https://vercel.com/docs)
   - [Neon Docs](https://neon.tech/docs)
   - [Upstash Docs](https://docs.upstash.com)
