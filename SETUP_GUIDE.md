# Hifdh Quest - Complete Setup Guide

This guide will walk you through setting up the Hifdh Quest platform from scratch.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Testing the Application](#testing-the-application)
7. [Common Issues](#common-issues)

---

## System Requirements

### Required Software

| Software | Version | Download Link |
|----------|---------|---------------|
| Java JDK | 17+ | [Adoptium](https://adoptium.net/) |
| Maven | 3.9+ | [Maven](https://maven.apache.org/download.cgi) |
| Node.js | 18+ | [Node.js](https://nodejs.org/) |
| Docker Desktop | Latest | [Docker](https://www.docker.com/products/docker-desktop/) |
| Git | Latest | [Git](https://git-scm.com/downloads) |

### Verify Installations

Open terminal and run:

```bash
# Check Java
java -version
# Should show: openjdk version "17.x.x"

# Check Maven
mvn -version
# Should show: Apache Maven 3.9.x

# Check Node.js
node -v
# Should show: v18.x.x or higher

# Check npm
npm -v
# Should show: 9.x.x or higher

# Check Docker
docker --version
# Should show: Docker version 24.x.x
```

---

## Installation Steps

### Step 1: Clone Repository

```bash
# Clone the repo
git clone https://github.com/yourusername/hifdh-endeavour.git
cd hifdh-endeavour

# Verify structure
ls -la
# Should see: backend/, frontend/, database/, docker/, README.md
```

### Step 2: Environment Configuration

Create environment files:

**Backend Environment** (`backend/.env`):
```bash
cd backend
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hifdh_quest
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=hifdh-quest-super-secret-key-change-in-production
ADMIN_PASSWORD=admin123
ALLOWED_ORIGINS=http://localhost:5173
EOF
```

**Frontend Environment** (`frontend/.env.local`):
```bash
cd ../frontend
cat > .env.local << EOF
VITE_API_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
EOF
```

---

## Database Setup

### Step 1: Start Docker Services

```bash
cd ../docker
docker-compose up -d
```

Expected output:
```
✔ Container hifdh-quest-db      Started
✔ Container hifdh-quest-redis   Started
✔ Container hifdh-quest-pgadmin Started
```

### Step 2: Verify Containers

```bash
docker ps
```

You should see 3 containers running:
- `hifdh-quest-db` (PostgreSQL)
- `hifdh-quest-redis` (Redis)
- `hifdh-quest-pgadmin` (Optional UI)

### Step 3: Wait for PostgreSQL to Initialize

```bash
# Watch PostgreSQL logs
docker logs -f hifdh-quest-db

# Wait for: "database system is ready to accept connections"
# Press Ctrl+C to exit logs
```

### Step 4: Initialize Database Schema

```bash
# Connect to PostgreSQL and run migrations
docker exec -i hifdh-quest-db psql -U postgres -d hifdh_quest < ../database/migrations/001_create_schema.sql
```

Expected output:
```
DROP TABLE
CREATE TABLE
CREATE TABLE
...
CREATE VIEW
```

### Step 5: Seed Initial Data

```bash
# Seed surahs (114 records)
docker exec -i hifdh-quest-db psql -U postgres -d hifdh_quest < ../database/seeds/002_seed_surahs.sql

# Seed reciters (8 records)
docker exec -i hifdh-quest-db psql -U postgres -d hifdh_quest < ../database/seeds/003_seed_reciters.sql
```

### Step 6: Verify Data

```bash
# Connect to database
docker exec -it hifdh-quest-db psql -U postgres -d hifdh_quest

# Run verification queries
SELECT COUNT(*) FROM surahs;     -- Should return 114
SELECT COUNT(*) FROM reciters;   -- Should return 8

# Exit psql
\q
```

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd ../backend
mvn clean install
```

This will:
- Download all dependencies (first time takes 2-5 minutes)
- Compile the code
- Run tests

### Step 2: Start Backend Server

```bash
mvn spring-boot:run
```

Expected output:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

...
Started HifdhQuestApplication in 4.326 seconds
```

### Step 3: Test Health Endpoint

Open new terminal:

```bash
curl http://localhost:8080/api/test/health
```

Expected response:
```json
{
  "status": "UP",
  "message": "Hifdh Quest Backend is running!",
  "timestamp": 1702345678901
}
```

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd ../frontend
npm install
```

This installs all npm packages (takes 1-3 minutes).

### Step 2: Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.0.8  ready in 482 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 3: Open in Browser

Navigate to: http://localhost:5173

You should see the Hifdh Quest homepage with:
- Title: "Hifdh Quest"
- Three feature cards
- "Create New Game" and "Test WebSocket" buttons

---

## Testing the Application

### Test 1: WebSocket Connection

1. Click "Test WebSocket" button on homepage
2. You should see: "Connected to WebSocket" (green)
3. Type a message in the input box
4. Click "Send"
5. Your message should echo back with a timestamp

**Expected Behavior:**
```
Connected to WebSocket ✓

[Sent]
{ "text": "Hello" }

[Received]
{
  "message": "Echo: Hello",
  "timestamp": "2024-01-01T12:00:00"
}
```

### Test 2: Database Query

In backend terminal, you should see SQL logs (if `SHOW_SQL=true`):

```sql
Hibernate: select ... from ayat where ...
```

### Test 3: Health Check

```bash
# Backend health
curl http://localhost:8080/api/test/health

# Should return: {"status":"UP", ...}
```

---

## Common Issues

### Issue 1: Port Already in Use

**Error:** `Port 8080 is already in use`

**Solution:**
```bash
# Find process using port 8080
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process or change port in application.yml
server:
  port: 8081  # Changed from 8080
```

### Issue 2: Database Connection Failed

**Error:** `Connection refused: localhost:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep hifdh-quest-db

# If not running, start it
cd docker
docker-compose up -d postgres

# Check logs
docker logs hifdh-quest-db
```

### Issue 3: Maven Build Failed

**Error:** `Could not resolve dependencies`

**Solution:**
```bash
# Clear Maven cache
cd backend
rm -rf ~/.m2/repository

# Rebuild
mvn clean install -U
```

### Issue 4: npm Install Failed

**Error:** `EACCES: permission denied`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: WebSocket Connection Failed in Browser

**Error:** `WebSocket connection failed`

**Checklist:**
1. ✓ Backend is running on port 8080
2. ✓ CORS is configured (`ALLOWED_ORIGINS=http://localhost:5173`)
3. ✓ Browser console shows no errors
4. ✓ Try hard refresh (Ctrl+Shift+R)

**Solution:**
```bash
# Restart backend
cd backend
mvn spring-boot:run

# Check CORS in application.yml
cors:
  allowed-origins: http://localhost:5173
```

### Issue 6: Docker Containers Won't Start

**Error:** `Cannot start service postgres`

**Solution:**
```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Restart
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Quick Reference

### Useful Commands

```bash
# Start everything
cd docker && docker-compose up -d
cd backend && mvn spring-boot:run &
cd frontend && npm run dev

# Stop everything
pkill -f spring-boot
docker-compose down

# View logs
docker logs -f hifdh-quest-db      # PostgreSQL
docker logs -f hifdh-quest-redis   # Redis
cd backend && mvn spring-boot:run  # Backend (shows in terminal)

# Reset database
cd docker
docker-compose down -v
docker-compose up -d
# Re-run migrations and seeds
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:8080 | - |
| Health Check | http://localhost:8080/api/test/health | - |
| WebSocket Test | http://localhost:5173/test | - |
| pgAdmin | http://localhost:5050 | admin@hifdh.com / admin |
| PostgreSQL | localhost:5432 | postgres / postgres |
| Redis | localhost:6379 | - |

---

## Next Steps

1. **Explore the Code:**
   - Backend: `backend/src/main/java/com/hifdh/quest/`
   - Frontend: `frontend/src/`

2. **Read Documentation:**
   - [Backend README](backend/README.md)
   - [Frontend README](frontend/README.md)
   - [Deployment Guide](DEPLOYMENT.md)

3. **Start Development:**
   - Implement AyatService for random verse selection
   - Build GameSessionService for game logic
   - Create React components for buzzer system

4. **Test Features:**
   - Create a game session
   - Add participants
   - Test buzzer functionality
   - Validate scoring system

---

## Getting Help

- Check [README.md](README.md) for project overview
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Open an issue on GitHub for bugs
- Read Spring Boot docs: https://spring.io/projects/spring-boot
- Read React docs: https://react.dev

---

**Setup Time:** 15-30 minutes (first time)

**You're all set!** Start building the game features or test the existing WebSocket functionality.
