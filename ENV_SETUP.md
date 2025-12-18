# Environment Variables Setup Guide

This guide explains how to configure environment variables for the Hifdh Quest platform.

---

## Overview

We use `.env` files to store sensitive configuration data like database passwords, API keys, and secrets. These files are **never committed to Git** for security.

## File Structure

```
hifdh-endeavour/
├── backend/
│   ├── .env              # Local development (gitignored)
│   └── .env.example      # Template (committed to Git)
├── frontend/
│   ├── .env              # Local development (gitignored)
│   └── .env.example      # Template (committed to Git)
└── docker/
    ├── .env              # Docker overrides (gitignored)
    └── .env.example      # Template (committed to Git)
```

---

## Backend Environment Variables

### Location: `backend/.env`

The backend uses Spring Boot's environment variable support. All variables have fallback defaults in `application.yml`.

### Create Your .env File

```bash
cd backend
cp .env.example .env
```

### Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL hostname | `localhost` | ✅ |
| `DB_PORT` | PostgreSQL port | `5432` | ✅ |
| `DB_NAME` | Database name | `hifdh_quest` | ✅ |
| `DB_USER` | Database username | `postgres` | ✅ |
| `DB_PASSWORD` | Database password | - | ✅ |
| `REDIS_HOST` | Redis hostname | `localhost` | ✅ |
| `REDIS_PORT` | Redis port | `6379` | ✅ |
| `REDIS_PASSWORD` | Redis password (if any) | `` | ❌ |
| `PORT` | Server port | `8080` | ❌ |
| `JWT_SECRET` | JWT signing secret (256-bit) | - | ✅ |
| `JWT_EXPIRATION` | Token expiry (milliseconds) | `86400000` | ❌ |
| `ADMIN_PASSWORD` | Admin panel password | - | ✅ |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` | ✅ |
| `SHOW_SQL` | Show SQL queries in logs | `false` | ❌ |
| `LOG_LEVEL` | Logging level | `INFO` | ❌ |

### Example `.env` File

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hifdh_quest
DB_USER=postgres
DB_PASSWORD=my_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Server
PORT=8080
SHOW_SQL=true
LOG_LEVEL=DEBUG

# Security
JWT_SECRET=your-256-bit-secret-key-here-change-this
JWT_EXPIRATION=86400000
ADMIN_PASSWORD=admin123

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Frontend Environment Variables

### Location: `frontend/.env`

Vite requires all environment variables to be prefixed with `VITE_` to be exposed to the client.

### Create Your .env File

```bash
cd frontend
cp .env.example .env
```

### Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8080` | ✅ |
| `VITE_WS_URL` | WebSocket endpoint URL | `http://localhost:8080/ws` | ✅ |
| `VITE_APP_NAME` | Application display name | `Hifdh Quest` | ❌ |
| `VITE_APP_VERSION` | Application version | `1.0.0` | ❌ |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `false` | ❌ |
| `VITE_ENABLE_DEBUG` | Enable debug mode | `true` | ❌ |

### Example `.env` File

```bash
# Backend Connection
VITE_API_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws

# App Settings
VITE_APP_NAME=Hifdh Quest
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

---

## Loading Environment Variables

### Backend (Spring Boot)

Spring Boot automatically loads variables from:
1. `.env` file (via IDE or external tool)
2. System environment variables
3. `application.yml` defaults

**Note**: Spring Boot doesn't natively support `.env` files. You need to either:

**Option 1**: Set environment variables manually
```bash
export DB_PASSWORD=mypassword
mvnw.cmd spring-boot:run
```

**Option 2**: Use an IDE that supports `.env` (IntelliJ IDEA, VS Code with plugins)

**Option 3**: Load on Windows CMD
```cmd
set DB_PASSWORD=mypassword
mvnw.cmd spring-boot:run
```

### Frontend (Vite)

Vite automatically loads `.env` files on startup:

```bash
npm run dev  # Loads .env automatically
```

---

## Security Best Practices

### ✅ DO

- **Always** use `.env` files for sensitive data
- **Always** add `.env` to `.gitignore`
- **Commit** `.env.example` files as templates
- **Use strong passwords** (16+ characters, mixed case, symbols)
- **Generate secure JWT secrets** (256-bit random string)
- **Rotate secrets** regularly in production
- **Use different values** for dev/staging/production

### ❌ DON'T

- **Never** commit `.env` files to Git
- **Never** share `.env` files in public channels
- **Never** use default passwords in production
- **Never** hardcode secrets in source code
- **Never** use the same secrets across environments

---

## Generating Secure Secrets

### JWT Secret (256-bit)

**Using OpenSSL:**
```bash
openssl rand -base64 32
```

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Using Python:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Output example:**
```
xK7jR2mP9vL4nQ8wT3yF5aH6bC1dE0gI2sU4oV7zA9
```

---

## Production Deployment

### Railway / Render

Set environment variables in the dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables" or "Variables"
3. Add each variable individually:
   - `DB_HOST` → `your-db-host.railway.app`
   - `JWT_SECRET` → `your-production-secret`
   - etc.

### Vercel (Frontend)

1. Go to project settings
2. Navigate to "Environment Variables"
3. Add variables with `VITE_` prefix:
   - `VITE_API_URL` → `https://api.yourdomain.com`
   - `VITE_WS_URL` → `https://api.yourdomain.com/ws`

### Using Railway CLI

```bash
railway variables set JWT_SECRET=your-secret
railway variables set DB_PASSWORD=your-password
```

---

## Troubleshooting

### Backend not reading .env file

**Problem**: Spring Boot doesn't load `.env` by default

**Solution**: Set variables manually or use IDE support

```bash
# Windows
set DB_PASSWORD=mypassword && mvnw.cmd spring-boot:run

# Linux/Mac
export DB_PASSWORD=mypassword && ./mvnw spring-boot:run
```

### Frontend variables not working

**Problem**: Variables must start with `VITE_`

**Solution**: Rename variables
```bash
# ❌ Wrong
API_URL=http://localhost:8080

# ✅ Correct
VITE_API_URL=http://localhost:8080
```

### Changes not taking effect

**Solution**: Restart dev servers after changing `.env`

```bash
# Backend: Ctrl+C and restart
mvnw.cmd spring-boot:run

# Frontend: Ctrl+C and restart
npm run dev
```

---

## Environment-Specific Files

You can create multiple environment files:

```
backend/
├── .env              # Default (development)
├── .env.local        # Local overrides
├── .env.production   # Production values
└── .env.test         # Test environment
```

**Spring Boot** uses profiles:
```bash
export SPRING_PROFILES_ACTIVE=production
mvnw.cmd spring-boot:run
```

**Vite** uses file naming:
```bash
npm run build  # Uses .env.production
```

---

## Quick Reference

### First Time Setup

```bash
# 1. Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Edit with your values
# Edit backend/.env
# Edit frontend/.env

# 3. Generate JWT secret
openssl rand -base64 32  # Copy output to backend/.env

# 4. Start services
docker-compose up -d
cd backend && mvnw.cmd spring-boot:run
cd frontend && npm run dev
```

### Check Current Values

```bash
# Backend
cat backend/.env

# Frontend
cat frontend/.env
```

---

## Support

For issues with environment configuration:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
2. Verify `.env` files exist and have correct syntax
3. Ensure no extra spaces around `=` signs
4. Check [.gitignore](./.gitignore) includes `.env` files

---

**Security Note**: The `.env` file in this repository (if present) is for **local development only**. Never use these values in production!
