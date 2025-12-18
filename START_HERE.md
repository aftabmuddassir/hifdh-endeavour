# 🚀 Quick Start Guide - Hifdh Quest

Welcome! This guide will get you up and running in **5 minutes**.

---

## ✅ Prerequisites Check

Before you start, make sure you have:

- [ ] Java 17+ installed ([Download](https://adoptium.net/))
- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Docker Desktop running ([Download](https://docker.com/))
- [ ] Git installed

**Verify installations:**
```bash
java -version    # Should show 17+
node -v          # Should show v18+
docker --version # Should show version info
```

---

## 🎯 5-Minute Setup

### Step 1: Clone & Setup Environment (1 min)

```bash
# Already cloned? Skip to step 2
cd hifdh-endeavour

# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Step 2: Start Database (1 min)

```bash
cd docker
docker-compose up -d
```

**Wait for:** "database system is ready to accept connections"

```bash
docker logs -f hifdh-quest-db
# Press Ctrl+C when ready
```

### Step 3: Initialize Database (1 min)

```bash
# Create tables
docker exec -i hifdh-quest-db psql -U postgres -d hifdh_quest < ../database/migrations/001_create_schema.sql

# Load surahs
docker exec -i hifdh-quest-db psql -U postgres -d hifdh_quest < ../database/seeds/002_seed_surahs.sql

# Load reciters
docker exec -i hifdh-quest-db psql -U postgres -d hifdh_quest < ../database/seeds/003_seed_reciters.sql
```

### Step 4: Start Backend (1 min)

**Option A: Using helper script (Windows)**
```bash
cd ../backend
run-dev.cmd
```

**Option B: Manual**
```bash
cd ../backend
set JAVA_HOME=C:\Program Files\Java\jdk-22
set DB_PASSWORD=postgres
mvnw.cmd spring-boot:run
```

**Wait for:** "Started HifdhQuestApplication"

### Step 5: Start Frontend (1 min)

**Open a NEW terminal:**
```bash
cd frontend
npm install
npm run dev
```

---

## ✨ Test Everything Works

### 1. Check Backend Health

Open browser: http://localhost:8080/api/test/health

**Expected:**
```json
{"status":"UP","message":"Hifdh Quest Backend is running!"}
```

### 2. Check Frontend

Open browser: http://localhost:5173

**You should see:** Hifdh Quest homepage

### 3. Test WebSocket

Click: **"Test WebSocket"** button

**You should see:** 🟢 Connected to WebSocket (green)

---

## 🎮 What You Have Running

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:5173 | ✅ |
| Backend API | http://localhost:8080 | ✅ |
| WebSocket Test | http://localhost:5173/test | ✅ |
| Database | localhost:5432 | ✅ |
| Redis | localhost:6379 | ✅ |
| pgAdmin | http://localhost:5050 | ✅ |

---

## 🔧 Common Issues

### "JAVA_HOME not found"

**Windows:**
```bash
set JAVA_HOME=C:\Program Files\Java\jdk-22
```

**Permanent fix:** See [ENV_SETUP.md](./ENV_SETUP.md)

### "Port 8080 already in use"

Change port in `backend/.env`:
```
PORT=8081
```

### "Database connection refused"

Make sure Docker is running:
```bash
docker ps  # Should show hifdh-quest-db
```

### "global is not defined" (Frontend)

Already fixed in `vite.config.ts`. Just restart:
```bash
npm run dev
```

---

## 📚 Next Steps

### Learn the Platform

1. **Read:** [README.md](./README.md) - Project overview
2. **Setup:** [ENV_SETUP.md](./ENV_SETUP.md) - Environment configuration
3. **Deploy:** [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment

### Start Development

Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for:
- What's implemented
- What's next
- Development roadmap

### Build Features

Current MVP tasks:
1. ✅ Backend scaffold
2. ✅ Frontend scaffold
3. ✅ Database setup
4. ⏳ AyatService (random verse selection)
5. ⏳ GameSessionService (game logic)
6. ⏳ Buzzer system
7. ⏳ Live scoreboard

---

## 🛑 Stopping Services

```bash
# Stop frontend (in terminal)
Ctrl+C

# Stop backend (in terminal)
Ctrl+C

# Stop Docker
cd docker
docker-compose down
```

---

## 💡 Development Workflow

### Daily Startup

```bash
# Terminal 1: Database
cd docker && docker-compose up -d

# Terminal 2: Backend
cd backend && run-dev.cmd

# Terminal 3: Frontend
cd frontend && npm run dev
```

### View Logs

```bash
# Database logs
docker logs -f hifdh-quest-db

# Backend logs
# (shown in terminal)

# Frontend logs
# (shown in terminal)
```

---

## 🆘 Need Help?

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting
2. Review [ENV_SETUP.md](./ENV_SETUP.md) for configuration issues
3. Open GitHub issue for bugs

---

## 🎉 Success!

If all services are running, you're ready to start developing!

**Next:** Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) to see what features to implement next.

---

**Time to first run:** ~5 minutes
**Made with ❤️ for the Muslim community**
