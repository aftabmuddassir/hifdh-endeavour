# Port Reference Guide

This document lists all ports used by the Hifdh Quest platform.

---

## Default Port Configuration

| Service | Port | Protocol | Environment Variable | Configurable |
|---------|------|----------|---------------------|--------------|
| **Frontend (Vite)** | `5173` | HTTP | `VITE_PORT` | ✅ Yes |
| **Backend (Spring Boot)** | `8080` | HTTP/WS | `PORT` | ✅ Yes |
| **PostgreSQL** | `5432` | TCP | `DB_PORT` | ✅ Yes |
| **Redis** | `6379` | TCP | `REDIS_PORT` | ✅ Yes |
| **pgAdmin** | `5050` | HTTP | `PGADMIN_PORT` | ✅ Yes |

---

## Port Configuration Files

### Backend Ports

**File:** `backend/.env`

```bash
# Application Ports
PORT=8080                    # Spring Boot server
DB_PORT=5432                 # PostgreSQL database
REDIS_PORT=6379              # Redis cache
```

**Used in:** [application.yml](backend/src/main/resources/application.yml)

```yaml
server:
  port: ${PORT:8080}

spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
  data:
    redis:
      port: ${REDIS_PORT:6379}
```

### Frontend Ports

**File:** `frontend/.env`

```bash
# Application Ports
VITE_PORT=5173               # Vite dev server
VITE_BACKEND_PORT=8080       # Backend API port (reference)
```

**Used in:** [vite.config.ts](frontend/vite.config.ts#L17)

```typescript
server: {
  port: Number(process.env.VITE_PORT) || 5173,
}
```

### Docker Ports

**File:** `docker/.env` (optional)

```bash
POSTGRES_PORT=5432
REDIS_PORT=6379
PGADMIN_PORT=5050
```

**Used in:** [docker-compose.yml](docker/docker-compose.yml)

---

## Changing Ports

### Scenario 1: Port Already in Use

If you get "Port 8080 already in use":

**Option A: Change Backend Port**

1. Edit `backend/.env`:
   ```bash
   PORT=8081  # Changed from 8080
   ```

2. Edit `frontend/.env`:
   ```bash
   VITE_BACKEND_PORT=8081
   VITE_API_URL=http://localhost:8081
   VITE_WS_URL=http://localhost:8081/ws
   ```

3. Restart both servers

**Option B: Kill Process Using Port**

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Scenario 2: Docker Port Conflict

If you get "Port 5432 already in use":

1. Edit `docker/docker-compose.yml`:
   ```yaml
   postgres:
     ports:
       - "5433:5432"  # Changed external port
   ```

2. Edit `backend/.env`:
   ```bash
   DB_PORT=5433  # Changed to match
   ```

3. Restart Docker:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## Port Testing

### Check if Port is Available

**Windows:**
```cmd
netstat -ano | findstr :<PORT>
```

**Linux/Mac:**
```bash
lsof -i :<PORT>
# or
netstat -tuln | grep <PORT>
```

### Test Backend Connection

```bash
# Test REST API
curl http://localhost:8080/api/test/health

# Test if port is listening
telnet localhost 8080
```

### Test Frontend Connection

```bash
# Test if Vite is running
curl http://localhost:5173

# Check in browser
http://localhost:5173
```

### Test Database Connection

```bash
# PostgreSQL
psql -h localhost -p 5432 -U postgres -d hifdh_quest

# Or using Docker
docker exec -it hifdh-quest-db psql -U postgres -d hifdh_quest
```

### Test Redis Connection

```bash
# Redis CLI
redis-cli -h localhost -p 6379 ping

# Or using Docker
docker exec -it hifdh-quest-redis redis-cli ping
```

---

## Production Port Configuration

### Railway/Render (Backend)

Railway/Render automatically assign a `PORT` environment variable.

**Set in platform:**
```bash
PORT=$PORT  # Auto-assigned by platform
DB_PORT=5432  # Internal database port
```

**Spring Boot will use:** `${PORT}` from environment

### Vercel (Frontend)

Vercel automatically assigns ports. Set API URL:

```bash
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=https://api.yourdomain.com/ws
```

---

## Common Port Conflicts

| Port | Common Conflict | Solution |
|------|----------------|----------|
| `5173` | Another Vite project | Change `VITE_PORT=3000` |
| `8080` | Tomcat, Jenkins, other Java apps | Change `PORT=8081` |
| `5432` | Local PostgreSQL installation | Use Docker port `5433:5432` |
| `6379` | Local Redis installation | Use Docker port `6380:6379` |
| `5050` | Other web services | Change pgAdmin to `5051` |

---

## Port Mapping (Docker)

Docker uses format: `HOST_PORT:CONTAINER_PORT`

**Example:**
```yaml
ports:
  - "5433:5432"  # Host port 5433 → Container port 5432
```

**Meaning:**
- Access from host: `localhost:5433`
- Container internally uses: `5432`
- Other containers access via: `postgres:5432`

---

## WebSocket Ports

WebSocket uses the same port as HTTP:

| Service | HTTP | WebSocket |
|---------|------|-----------|
| Backend | `http://localhost:8080` | `ws://localhost:8080/ws` |
| Production | `https://api.domain.com` | `wss://api.domain.com/ws` |

**Note:** HTTPS uses `wss://` (secure WebSocket)

---

## Quick Reference Commands

### Check All Hifdh Quest Ports

```bash
# Windows
netstat -ano | findstr "5173 8080 5432 6379 5050"

# Linux/Mac
lsof -i :5173 -i :8080 -i :5432 -i :6379 -i :5050
```

### View .env Port Configuration

```bash
# Backend
grep "PORT" backend/.env

# Frontend
grep "PORT" frontend/.env

# Output:
# PORT=8080
# VITE_PORT=5173
```

---

## Firewall Configuration

If services aren't accessible:

**Windows Firewall:**
```cmd
# Allow port 8080
netsh advfirewall firewall add rule name="Hifdh Backend" dir=in action=allow protocol=TCP localport=8080

# Allow port 5173
netsh advfirewall firewall add rule name="Hifdh Frontend" dir=in action=allow protocol=TCP localport=5173
```

**Linux (ufw):**
```bash
sudo ufw allow 8080/tcp
sudo ufw allow 5173/tcp
```

---

## Environment-Specific Ports

| Environment | Frontend | Backend | Database | Redis |
|-------------|----------|---------|----------|-------|
| **Local Dev** | 5173 | 8080 | 5432 | 6379 |
| **Docker** | 5173 | 8080 | 5432* | 6379* |
| **Staging** | N/A | 8080 | 5432 | 6379 |
| **Production** | N/A | Auto | Auto | Auto |

*Internal Docker ports

---

## Troubleshooting

### Port is used but process not visible

**Windows:**
```cmd
# Find process using port
netstat -ano | findstr :<PORT>
# Last column is PID

# Find process name
tasklist | findstr <PID>

# Kill process
taskkill /PID <PID> /F
```

### Docker container port conflict

```bash
# Check container ports
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Stop conflicting container
docker stop <container_name>

# Or change port in docker-compose.yml
```

### Backend connects to wrong database port

1. Check `backend/.env` has correct `DB_PORT`
2. Verify `application.yml` uses `${DB_PORT}`
3. Restart Spring Boot application
4. Check logs for connection string

---

## Security Notes

### Exposed Ports

✅ **Safe to expose (with auth):**
- Frontend (5173) - Development only
- Backend API (8080) - With authentication
- pgAdmin (5050) - Only in development

❌ **Never expose publicly:**
- PostgreSQL (5432) - Database should be internal
- Redis (6379) - Cache should be internal

### Production Best Practices

1. **Don't expose database ports** to internet
2. **Use internal networking** for DB ↔ Backend
3. **Use load balancer** for Backend ↔ Frontend
4. **Enable SSL/TLS** for all public endpoints
5. **Use firewall rules** to restrict access

---

## Summary

All port configuration is centralized in `.env` files:
- ✅ Easy to change
- ✅ Environment-specific
- ✅ Never committed to Git
- ✅ Documented in `.env.example`

**Default Setup:**
```
Frontend:   http://localhost:5173
Backend:    http://localhost:8080
WebSocket:  ws://localhost:8080/ws
Database:   localhost:5432
Redis:      localhost:6379
pgAdmin:    http://localhost:5050
```

For more details, see:
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment configuration
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup guide
- [docker/README.md](./docker/README.md) - Docker configuration
