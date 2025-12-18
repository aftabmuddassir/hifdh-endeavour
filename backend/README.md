# Hifdh Quest Backend

Spring Boot backend for the Hifdh Quest gamified Quran memorization platform.

## Technology Stack

- **Java**: 17
- **Framework**: Spring Boot 3.2.0
- **Build Tool**: Maven 3.9+
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **WebSocket**: Spring WebSocket + STOMP
- **Security**: Spring Security + JWT

## Project Structure

```
backend/
├── src/main/java/com/hifdh/quest/
│   ├── HifdhQuestApplication.java       # Main application
│   ├── config/
│   │   ├── WebSocketConfig.java         # WebSocket configuration
│   │   ├── CorsConfig.java              # CORS settings
│   │   └── SecurityConfig.java          # Security settings
│   ├── model/
│   │   ├── Surah.java                   # Surah entity
│   │   ├── Ayat.java                    # Ayat (verse) entity
│   │   ├── GameSession.java             # Game session
│   │   ├── GameParticipant.java         # Players/Teams
│   │   ├── GameRound.java               # Game rounds
│   │   ├── BuzzerPress.java             # Buzzer events
│   │   └── Reciter.java                 # Reciter metadata
│   ├── repository/
│   │   ├── AyatRepository.java
│   │   ├── SurahRepository.java
│   │   ├── GameSessionRepository.java
│   │   └── GameParticipantRepository.java
│   ├── service/
│   │   ├── AyatService.java             # Random ayat selection
│   │   ├── GameSessionService.java      # Game logic
│   │   └── BuzzerService.java           # Buzzer management
│   └── controller/
│       ├── TestController.java          # Health check
│       ├── WebSocketTestController.java # WebSocket test
│       └── GameController.java          # Game REST API
└── src/main/resources/
    └── application.yml                   # Configuration
```

## Setup

### 1. Prerequisites

- Java 17 (download from [Adoptium](https://adoptium.net/))
- Maven 3.9+ (or use wrapper: `./mvnw`)
- PostgreSQL 15+ (via Docker recommended)
- Redis 7+ (via Docker recommended)

### 2. Database Setup

Use Docker Compose from project root:

```bash
cd ../docker
docker-compose up -d postgres redis
```

Or install manually:
- PostgreSQL: https://www.postgresql.org/download/
- Redis: https://redis.io/download

### 3. Configure Application

Copy `.env.example` to `.env` and update:

```properties
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hifdh_quest
DB_USER=postgres
DB_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key-change-in-production
```

### 4. Run Application

```bash
# Using Maven
mvn spring-boot:run

# Or using wrapper
./mvnw spring-boot:run

# With specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Application starts on http://localhost:8080

## Endpoints

### REST API

```
GET    /api/test/health              # Health check
POST   /api/games/create             # Create game session
GET    /api/games/{sessionId}        # Get game details
POST   /api/games/{sessionId}/start  # Start game
POST   /api/games/{sessionId}/end    # End game
GET    /api/games/{sessionId}/scoreboard # Get scoreboard
GET    /api/ayat/random              # Get random ayat
GET    /api/reciters                 # List reciters
```

### WebSocket

```
Endpoint: ws://localhost:8080/ws

# Client → Server
/app/test                              # Test message
/app/game/{sessionId}/buzz             # Buzzer press
/app/game/{sessionId}/submit-answer    # Submit answer
/app/game/{sessionId}/validate-answer  # Validate (admin)

# Server → Client
/topic/test                            # Test broadcast
/topic/game/{sessionId}/round-start    # Round started
/topic/game/{sessionId}/buzzer-pressed # Buzzer event
/topic/game/{sessionId}/answer-result  # Answer validated
/topic/game/{sessionId}/scoreboard-update # Score update
/topic/game/{sessionId}/timer-update   # Timer tick
/topic/game/{sessionId}/game-end       # Game ended
```

## Testing

### Unit Tests

```bash
mvn test
```

### Integration Tests

```bash
mvn verify
```

### Manual Testing

1. **Health Check**:
```bash
curl http://localhost:8080/api/test/health
```

2. **WebSocket Test**:
Use frontend at http://localhost:5173/test

## Building

### Development Build

```bash
mvn clean package
```

### Production Build

```bash
mvn clean package -DskipTests
java -jar target/hifdh-quest-1.0.0.jar
```

## Database Migrations

### Apply Migrations

```bash
# Connect to database
psql -h localhost -U postgres -d hifdh_quest

# Run schema
\i ../database/migrations/001_create_schema.sql

# Run seeds
\i ../database/seeds/002_seed_surahs.sql
\i ../database/seeds/003_seed_reciters.sql
```

### Verify Data

```sql
SELECT COUNT(*) FROM surahs;  -- Should be 114
SELECT COUNT(*) FROM reciters; -- Should be 8
```

## Configuration

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/hifdh_quest
    username: postgres
    password: postgres

  jpa:
    hibernate:
      ddl-auto: validate  # NEVER use 'create' or 'update' in production
    show-sql: false

  data:
    redis:
      host: localhost
      port: 6379

server:
  port: 8080

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000  # 24 hours

cors:
  allowed-origins: http://localhost:5173
```

## Common Issues

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill process or change port in application.yml
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U postgres -d hifdh_quest
```

### Redis Connection Failed

```bash
# Check if Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

## Performance Tips

1. **Enable Connection Pooling**:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
```

2. **Enable Redis Caching**:
```java
@Cacheable("ayat")
public Ayat getRandomAyat(int surahStart, int surahEnd) {
    // ...
}
```

3. **Use Indexes**:
Already defined in `001_create_schema.sql`

## License

MIT License - see LICENSE file
