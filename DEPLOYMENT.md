# Deployment Guide - Hifdh Quest

This guide covers deploying the Hifdh Quest platform to production using cost-effective services.



## Option 1: Railway (Recommended for Beginners)

### Prerequisites
- Railway account (sign up at [railway.app](https://railway.app))
- GitHub account
- Railway CLI (optional)

### Step 1: Deploy Database

1. Go to Railway dashboard
2. Click "New Project" → "Provision PostgreSQL"
3. Note down connection details:
   - `DATABASE_URL` (automatically set)
   - Or individual: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### Step 2: Deploy Redis

1. In same project, click "New" → "Database" → "Add Redis"
2. Note down `REDIS_URL`

### Step 3: Initialize Database

```bash
# Connect to Railway PostgreSQL
railway connect postgres

# Run migrations
\i database/migrations/001_create_schema.sql
\i database/seeds/002_seed_surahs.sql
\i database/seeds/003_seed_reciters.sql
```

### Step 4: Deploy Backend

**Option A: Using GitHub**

1. Push code to GitHub
2. Railway → "New" → "GitHub Repo"
3. Select `hifdh-endeavour` repo
4. Set root directory to `backend`
5. Add environment variables:

```env
PORT=8080
DB_HOST=<from-railway>
DB_PORT=<from-railway>
DB_NAME=<from-railway>
DB_USER=<from-railway>
DB_PASSWORD=<from-railway>
REDIS_HOST=<from-railway>
REDIS_PORT=<from-railway>
JWT_SECRET=<generate-random-string>
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Option B: Using Railway CLI**

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Link project
cd backend
railway link

# Deploy
railway up

# Set variables
railway variables set JWT_SECRET=your-secret
railway variables set ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

6. Railway auto-detects Spring Boot and builds with Maven
7. Note the deployed URL: `https://hifdh-quest.up.railway.app`

### Step 5: Deploy Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import GitHub repo
4. Set root directory to `frontend`
5. Environment variables:

```env
VITE_API_URL=https://hifdh-quest.up.railway.app
VITE_WS_URL=https://hifdh-quest.up.railway.app/ws
```

6. Deploy
7. Your app is live at `https://hifdh-quest.vercel.app`

### Step 6: Update CORS

Update Railway backend environment:

```env
ALLOWED_ORIGINS=https://hifdh-quest.vercel.app
```

Redeploy backend.

---

## Option 2: Render.com

### Step 1: Deploy Database (Neon.tech)

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project: "hifdh-quest"
3. Copy connection string
4. Use any PostgreSQL client to run migrations

### Step 2: Deploy Redis (Upstash)

1. Sign up at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### Step 3: Deploy Backend (Render)

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Name**: hifdh-quest-backend
   - **Root Directory**: backend
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/hifdh-quest-1.0.0.jar`
   - **Instance Type**: Free

5. Environment variables:

```env
JAVA_VERSION=17
PORT=8080
DB_HOST=<neon-host>
DB_PORT=5432
DB_NAME=<neon-db>
DB_USER=<neon-user>
DB_PASSWORD=<neon-password>
REDIS_HOST=<upstash-host>
REDIS_PORT=<upstash-port>
REDIS_PASSWORD=<upstash-password>
JWT_SECRET=<generate-random>
ALLOWED_ORIGINS=https://hifdh-quest.vercel.app
```

6. Deploy

### Step 4: Deploy Frontend (Vercel)

Same as Option 1, Step 5.

---

## Option 3: Fly.io (Advanced)

### Prerequisites
- Fly.io account
- Fly CLI installed

### Deploy Backend

1. Create `backend/fly.toml`:

```toml
app = "hifdh-quest"
primary_region = "iad"

[build]
  builder = "paketobuildpacks/builder:base"
  buildpacks = ["gcr.io/paketo-buildpacks/java"]

[env]
  PORT = "8080"

[[services]]
  http_checks = []
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

2. Deploy:

```bash
cd backend
fly launch
fly secrets set JWT_SECRET=your-secret
fly secrets set DB_PASSWORD=your-db-password
fly deploy
```

---

## Environment Variables Checklist

### Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `db.railway.app` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `hifdh_quest` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `secure123` |
| `REDIS_HOST` | Redis host | `redis.railway.app` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (if any) | `` |
| `JWT_SECRET` | JWT signing key | `your-256-bit-secret` |
| `ALLOWED_ORIGINS` | CORS origins | `https://app.vercel.app` |

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.railway.app` |
| `VITE_WS_URL` | WebSocket URL | `https://api.railway.app/ws` |

---

## Post-Deployment Checklist

- [ ] Backend health check working: `GET /api/test/health`
- [ ] Database populated with surahs (114 records)
- [ ] Redis connection successful
- [ ] WebSocket connection working (test at `/test`)
- [ ] CORS configured correctly
- [ ] Frontend can reach backend API
- [ ] Audio playback working (EveryAyah.com)
- [ ] Game creation works
- [ ] Buzzer system functional

---

## Monitoring

### Railway

- Dashboard shows logs, metrics, and deployments
- Set up alerts for downtime

### Vercel

- Analytics dashboard for frontend
- Build logs and deployment history

### Uptime Monitoring (Optional)

Use free services:
- [UptimeRobot](https://uptimerobot.com) (50 monitors free)
- [Freshping](https://freshping.io) (unlimited free)

---

## Scaling

### When to Scale

- Database: >500MB data → upgrade Neon tier
- Redis: >10K commands/day → upgrade Upstash
- Backend: High CPU/memory → upgrade Railway instance

### Cost Estimates

**100 games/day, 10 concurrent players:**
- Database: ~50MB → Free tier
- Redis: ~5K commands → Free tier
- Backend: Minimal load → Free tier
- **Total: $0/month**

**1000 games/day, 100 concurrent players:**
- Database: ~500MB → $10/month
- Redis: ~50K commands → $10/month
- Backend: Medium load → $10/month
- **Total: $30/month**

---

## Troubleshooting

### Backend Won't Start

Check logs:
```bash
railway logs
# or
fly logs
```

Common issues:
- Missing environment variables
- Database connection failed
- Port binding error

### WebSocket Connection Failed

1. Check CORS settings
2. Verify WebSocket endpoint: `/ws`
3. Ensure HTTPS is used in production
4. Check proxy settings on hosting platform

### Database Migration Failed

```bash
# Connect directly
railway connect postgres

# Check tables exist
\dt

# Re-run migrations manually
\i migrations/001_create_schema.sql
```

---

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set up rate limiting (optional)
- [ ] Enable database backups
- [ ] Restrict CORS to production domain only
- [ ] Use environment variables (never hardcode secrets)

---

## Rollback Strategy

### Railway/Render

Both platforms keep deployment history:
1. Go to deployments tab
2. Select previous working deployment
3. Click "Redeploy"

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push

# Trigger auto-deployment
```

---

## Support

For deployment issues:
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

---

**Deployment Time Estimate**: 30-60 minutes for first time setup
