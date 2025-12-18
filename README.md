# Hifdh Quest - Gamified Quran Memorization Platform

A real-time, multiplayer Quran memorization game that makes learning fun and competitive.

![Tech Stack](https://img.shields.io/badge/Spring%20Boot-3.2-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-orange)

## Overview

**Hifdh Quest** is a gamified platform where users compete in real-time to test their Quran knowledge. Players can select Surah ranges, listen to recitations, and answer 5 different question types using a "fastest finger first" buzzer system.

### Key Features

- **5 Question Types**: Guess Surah, Meaning, Next/Previous Ayat, Reciter
- **Real-time Buzzer System**: WebSocket-powered fastest finger competition
- **Anti-spam Protection**: Smart buzzer limiting (3-press rule)
- **Team & Individual Modes**: Flexible gameplay options
- **Live Scoreboard**: Real-time score updates
- **Audio Integration**: Direct streaming from EveryAyah.com
- **Admin Controls**: Live game management and answer validation

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.2+ (Java 17)
- **Database**: PostgreSQL 15+
- **Real-time**: WebSocket (Spring WebSocket + STOMP)
- **Caching**: Redis
- **Audio**: EveryAyah.com API integration
- **Security**: Spring Security + JWT

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI**: Tailwind CSS
- **WebSocket**: SockJS + STOMP client
- **Audio**: HTML5 Audio API
- **State**: Zustand

### Infrastructure
- **Database**: PostgreSQL (Railway/Neon.tech)
- **Cache**: Redis (Upstash)
- **Backend Deploy**: Railway/Render
- **Frontend Deploy**: Vercel/Netlify

## Project Structure

```
hifdh-endeavour/
├── backend/                 # Spring Boot application
│   ├── src/main/java/
│   │   └── com/hifdh/quest/
│   │       ├── model/       # JPA entities
│   │       ├── repository/  # Data access
│   │       ├── service/     # Business logic
│   │       ├── controller/  # REST + WebSocket controllers
│   │       └── config/      # Configuration
│   └── pom.xml
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API and WebSocket services
│   │   └── App.tsx
│   └── package.json
├── database/
│   ├── migrations/          # SQL schema
│   └── seeds/               # Seed data (114 surahs, reciters)
├── docker/
│   └── docker-compose.yml   # Local development setup
└── README.md
```

## Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- Docker Desktop (for local database)
- Maven 3.9+

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/hifdh-endeavour.git
cd hifdh-endeavour
```

### 2. Start Database (Docker)

```bash
cd docker
docker-compose up -d
```

This starts PostgreSQL (port 5432) and Redis (port 6379).

### 3. Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on http://localhost:8080

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### 5. Test WebSocket Connection

Open http://localhost:5173/test to verify backend-frontend WebSocket communication.

## Development Workflow

### Backend Development

```bash
cd backend

# Run with hot reload
mvn spring-boot:run

# Run tests
mvn test

# Build JAR
mvn clean package
```

### Frontend Development

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Database Management

```bash
# Connect to PostgreSQL
docker exec -it hifdh-quest-db psql -U postgres -d hifdh_quest

# Run migrations
docker exec -i hifdh-quest-db psql -U postgres -d hifdh_quest < database/migrations/001_create_schema.sql

# Seed data
docker exec -i hifdh-quest-db psql -U postgres -d hifdh_quest < database/seeds/002_seed_surahs.sql
```

## API Documentation

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/test/health` | Health check |
| POST | `/api/games/create` | Create new game session |
| GET | `/api/games/{id}` | Get game details |
| POST | `/api/games/{id}/start` | Start game |

### WebSocket Topics

| Topic | Description |
|-------|-------------|
| `/app/test` | Test echo endpoint |
| `/topic/test` | Test broadcast topic |
| `/app/game/{id}/buzz` | Player buzzer press |
| `/topic/game/{id}/round-start` | New round started |
| `/topic/game/{id}/scoreboard-update` | Score updated |

## Deployment

### Backend (Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Game Flow

1. **Setup**: Admin creates game with Surah range and question types
2. **Join**: Players join with team/individual names
3. **Play**: System randomly selects ayat and displays questions
4. **Buzz**: Players press buzzer to answer
5. **Validate**: Admin validates answers and awards points
6. **Scoreboard**: Real-time score updates
7. **Winner**: Final results and celebration

## Question Types

| Type | Description | Points |
|------|-------------|--------|
| Guess Surah | Identify which Surah | 10 |
| Guess Meaning | What does this ayat mean? | 15 |
| Guess Next Ayat | What comes next? | 20 |
| Guess Previous Ayat | What came before? | 25 |
| Guess Reciter | Who is reciting? | 15 |

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

## Acknowledgments

- Quran data: [Tanzil.net](https://tanzil.net)
- Audio: [EveryAyah.com](https://everyayah.com)
- Inspired by the desire to make Quran memorization engaging and fun

## Contact

For questions or support, please open an issue on GitHub.

---

**Made with care for the Muslim community**