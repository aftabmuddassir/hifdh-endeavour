# Hifdh Quest - Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)  
3. [Database Migrations](#database-migrations)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

- Docker (v20.10+) and Docker Compose (v2.0+)
- PostgreSQL (v15+)
- Redis (v7+)
- Node.js (v20+) for local development
- Java (JDK 21+) for local development

---

## ⚙️ Environment Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd hifdh-endeavour
```

### 2. Create Environment File
```bash
cp .env.example .env
```

### 3. Configure Critical Variables
Edit `.env` and set:
- `DB_PASSWORD` - Strong database password
- `REDIS_PASSWORD` - Strong Redis password  
- `JWT_SECRET` - Random 32+ character string
- `ADMIN_PASSWORD` - Admin password
- `ALLOWED_ORIGINS` - Your frontend domains
- `VITE_API_URL` - Your backend URL
- `VITE_WS_URL` - Your WebSocket URL

---

## 🗄️ Database Migrations

### How It Works
This project uses **Flyway** for database migrations.

✅ **Migrations run AUTOMATICALLY** when backend starts
✅ **Migrations are VERSIONED** (V001, V002, V003...)  
✅ **Flyway tracks** which migrations have run

### Current Migrations
- V001: Player game fields
- V002: Buzzer tracking
- V003: Buzzer presses table
- V004: Scoring events
- V005: Bonus awards
- V006: Press order tracking
- V007: Streak tracking (NEW)

### ⚠️ IMPORTANT: Never Modify Existing Migrations
- **DO NOT** combine migration files
- **DO NOT** edit existing migrations
- **ALWAYS** create new migrations for changes

---

## 🚀 Production Deployment

### Option 1: Cloud Deployment (Free Tier) - RECOMMENDED

This guide uses free-tier services to deploy your application at zero cost.

#### Services Overview
- **Backend**: Railway.app or Render.com (Free tier)
- **Database**: Railway PostgreSQL or Neon.tech (Free tier)
- **Redis**: Upstash Redis (Free tier: 10K requests/day)
- **Frontend**: Vercel or Netlify (Free tier)
- **Estimated Total**: $0/month for MVP

#### Step 1: Deploy Database (Neon.tech)

1. Go to [Neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/database`)
4. Note down these values:
   - `DB_HOST`: Extract from connection string
   - `DB_PORT`: Usually `5432`
   - `DB_NAME`: Database name
   - `DB_USER`: Username
   - `DB_PASSWORD`: Password

**Alternative**: Use Railway PostgreSQL
- Go to [Railway.app](https://railway.app)
- Create new project → Add PostgreSQL
- Copy connection details from the Variables tab

#### Step 2: Deploy Redis (Upstash)

1. Go to [Upstash.com](https://upstash.com) and sign up
2. Create a new Redis database
3. Copy these values:
   - `REDIS_HOST`: Your endpoint
   - `REDIS_PORT`: Usually `6379` or custom port
   - `REDIS_PASSWORD`: Your password

#### Step 3: Deploy Backend (Railway or Render)

##### Option A: Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project → Deploy from GitHub repo
3. Select your `hifdh-endeavour` repository
4. Configure build settings:
   - **Root Directory**: `/backend`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
5. Add environment variables:
   ```
   DB_HOST=<your-neon-host>
   DB_PORT=5432
   DB_NAME=<your-db-name>
   DB_USER=<your-db-user>
   DB_PASSWORD=<your-db-password>
   REDIS_HOST=<your-upstash-host>
   REDIS_PORT=<your-upstash-port>
   REDIS_PASSWORD=<your-upstash-password>
   JWT_SECRET=<generate-random-32-char-string>
   ADMIN_PASSWORD=<your-admin-password>
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   PORT=8080
   LOG_LEVEL=INFO
   SHOW_SQL=false
   ```
6. Deploy and copy the generated URL (e.g., `https://your-app.railway.app`)

##### Option B: Render.com

1. Go to [Render.com](https://render.com) and sign up
2. New → Web Service → Connect your GitHub repo
3. Configure:
   - **Name**: `hifdh-quest-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Java
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
4. Add environment variables (same as Railway above)
5. Create Web Service and copy the URL

#### Step 4: Deploy Frontend (Vercel or Netlify)

##### Option A: Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_WS_URL=wss://your-backend.railway.app
   ```
5. Deploy and get your frontend URL

##### Option B: Netlify

1. Go to [Netlify.com](https://netlify.com) and sign up
2. New site from Git → Choose your repo
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Add environment variables (same as Vercel)
5. Deploy

#### Step 5: Update CORS Settings

After deploying frontend, update your backend's `ALLOWED_ORIGINS`:
- Go to your backend deployment (Railway/Render)
- Update `ALLOWED_ORIGINS` environment variable with your frontend URL:
  ```
  ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app.netlify.app
  ```
- Redeploy backend

#### Step 6: Verify Deployment

1. Open your frontend URL in browser
2. Check browser console for errors
3. Test WebSocket connection
4. Check backend health: `https://your-backend.railway.app/actuator/health`
5. Access Swagger UI: `https://your-backend.railway.app/swagger-ui.html`

---

### Option 2: Docker Compose (VPS/Self-Hosted)

If you have a VPS (DigitalOcean, Linode, AWS EC2, etc.):

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Verify Deployment
```bash
# Check backend health
curl http://localhost:8080/actuator/health

# Check frontend
curl http://localhost:80/health
```

---

## ✅ Post-Deployment Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Enable monitoring

---

## 🔍 Troubleshooting

### Cloud Deployment Issues

#### Backend Won't Start
Check backend logs in your hosting platform (Railway/Render):
- **Database connection failed** → Verify `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- **Redis connection failed** → Check `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- **Migration failed** → Check Flyway migration files are included in build
- **Port issues** → Ensure `PORT=8080` is set

#### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` points to your backend URL (e.g., `https://your-app.railway.app`)
- Verify `VITE_WS_URL` uses `wss://` (not `ws://`) for secure WebSocket
- Check browser console for CORS errors
- Ensure `ALLOWED_ORIGINS` in backend includes your frontend domain

#### WebSocket Connection Failing
Common causes:
1. **Wrong protocol**: Use `wss://` (secure) not `ws://` for HTTPS sites
2. **CORS not configured**: Add frontend domain to `ALLOWED_ORIGINS`
3. **Railway/Render proxy**: Some platforms may need WebSocket enabled
   - Railway: WebSocket support is automatic
   - Render: Ensure Web Service type (not Static Site)
4. **Path issues**: Check WebSocket endpoint path matches frontend config

#### Database Connection Pool Issues
If you see "Too many connections" errors on free tier:
- Neon.tech free tier: Limited to 100 connections
- Railway PostgreSQL: Limited based on plan
- Solution: Reduce connection pool size in backend (add to env vars):
  ```
  SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=5
  SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=2
  ```

#### Redis Memory Issues
Upstash free tier: 256MB storage
- Monitor usage in Upstash dashboard
- Consider implementing TTL for cached data
- Clear cache if needed: Connect via Upstash Console → `FLUSHALL`

### Docker Deployment Issues

#### Backend Won't Start
```bash
docker-compose -f docker-compose.prod.yml logs backend
```
Common issues:
- Database connection failed → Check `DB_PASSWORD`
- Redis connection failed → Check `REDIS_PASSWORD`
- Migration failed → Check migration files

#### Frontend Can't Connect
- Verify `VITE_API_URL` and `VITE_WS_URL`
- Check `ALLOWED_ORIGINS` includes your frontend domain

#### Database Migration Issues
```bash
# View migration status
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d hifdh_quest -c "SELECT * FROM flyway_schema_history;"
```

---

## 💡 Pro Tips for Cloud Deployment

### 1. Generate Secure Secrets
```bash
# Generate random JWT secret (32 characters)
openssl rand -base64 32

# Or use online generator: https://generate-secret.vercel.app/32
```

### 2. Monitor Free Tier Limits
- **Neon.tech**: 3GB storage, 100 hours compute/month
- **Upstash Redis**: 10K commands/day, 256MB storage
- **Railway**: $5 credit/month (~500 hours)
- **Render**: 750 hours/month per service
- **Vercel/Netlify**: 100GB bandwidth/month

### 3. Database Seeding
After first deployment, seed your database with initial data:
1. Connect to your Neon database using the connection string
2. Run the seed files from `database/seeds/`:
   ```bash
   psql "postgresql://user:pass@host/db" -f database/seeds/002_seed_surahs.sql
   psql "postgresql://user:pass@host/db" -f database/seeds/003_seed_reciters.sql
   psql "postgresql://user:pass@host/db" -f database/seeds/004_seed_sample_ayat.sql
   ```

### 4. Enable Production Optimizations
Add these environment variables to backend:
```
SPRING_JPA_SHOW_SQL=false
LOG_LEVEL=WARN
SPRING_DEVTOOLS_RESTART_ENABLED=false
```

### 5. Setup Custom Domain (Optional)
- **Vercel/Netlify**: Settings → Domains → Add custom domain
- **Railway/Render**: Settings → Custom Domain → Configure DNS

---
