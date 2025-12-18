# Docker Setup for Hifdh Quest

This directory contains Docker configuration for local development.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+

## Quick Start

### 1. Start Services

```bash
cd docker
docker-compose up -d
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **Redis** on `localhost:6379`
- **pgAdmin** on `localhost:5050` (optional DB management UI)

### 2. Verify Services

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

### 3. Initialize Database

The database schema and seed data are automatically loaded from:
- `/database/migrations/` - Schema creation
- `/database/seeds/` - Sample data

If you need to manually run SQL:

```bash
# Connect to PostgreSQL
docker exec -it hifdh-quest-db psql -U postgres -d hifdh_quest

# Run SQL file
docker exec -i hifdh-quest-db psql -U postgres -d hifdh_quest < ../database/migrations/001_create_schema.sql
```

### 4. Access pgAdmin (Optional)

1. Open http://localhost:5050
2. Login:
   - Email: `admin@hifdh.com`
   - Password: `admin`
3. Add server:
   - Name: `Hifdh Quest`
   - Host: `postgres` (container name)
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`

## Stop Services

```bash
# Stop containers (keep data)
docker-compose stop

# Stop and remove containers (keep data)
docker-compose down

# Remove everything including data
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If port 5432 or 6379 is already in use:

```yaml
# Edit docker-compose.yml
ports:
  - "5433:5432"  # Changed from 5432
```

### Database Not Initializing

```bash
# Remove volumes and recreate
docker-compose down -v
docker-compose up -d
```

### Connect from Backend

Make sure your `application.yml` has:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/hifdh_quest
    username: postgres
    password: postgres
```

## Production Notes

**DO NOT** use this Docker setup in production. Use managed services:
- Database: Railway PostgreSQL, Neon.tech, or Supabase
- Redis: Upstash or Railway Redis
- Hosting: Railway, Render, or Fly.io
