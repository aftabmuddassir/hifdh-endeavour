# Hifdh Quest API Reference

Complete API documentation for REST endpoints and WebSocket events.

---

## Table of Contents

1. [REST API Endpoints](#rest-api-endpoints)
2. [WebSocket Events](#websocket-events)
3. [Data Models (DTOs)](#data-models-dtos)
4. [Question Types & Points](#question-types--points)

---

## REST API Endpoints

Base URL: `http://localhost:8080/api`

### Game Management

#### Create Game Session
```http
POST /api/game/create
Content-Type: application/json

{
  "adminId": 1,
  "surahRangeStart": 1,
  "surahRangeEnd": 114,
  "juzNumber": null,
  "difficulty": "medium",
  "gameMode": "individual",
  "scoreboardLimit": 5,
  "participantNames": ["Alice", "Bob", "Charlie"],
  "reciterId": 1
}

Response: GameSessionDTO (201 Created)
```

#### Get Game Session
```http
GET /api/game/{sessionId}

Response: GameSessionDTO (200 OK)
```

#### Start Game
```http
POST /api/game/{sessionId}/start

Response: GameSessionDTO (200 OK)
```

#### End Game
```http
POST /api/game/{sessionId}/end

Response: GameSessionDTO (200 OK)
```

### Participants

#### Add Participant
```http
POST /api/game/{sessionId}/participants
Content-Type: application/json

{
  "name": "David"
}

Response: ParticipantDTO (201 Created)
```

#### Get Scoreboard
```http
GET /api/game/{sessionId}/scoreboard

Response: List<ParticipantDTO> (200 OK)
```

#### Add Score to Participant
```http
POST /api/game/participants/{participantId}/score
Content-Type: application/json

{
  "points": 20
}

Response: ParticipantDTO (200 OK)
```

#### Check if Participant Can Buzz
```http
GET /api/game/participants/{participantId}/can-buzz?roundId={roundId}

Response:
{
  "canBuzz": true,
  "pressesRemaining": 2
}
```

#### Block/Unblock Participant
```http
POST /api/game/participants/{participantId}/block
POST /api/game/participants/{participantId}/unblock

Response: 200 OK
```

### Rounds

#### Create Round
```http
POST /api/game/{sessionId}/rounds
Content-Type: application/json

{
  "questionType": "guess_surah",
  "reciterId": 1
}

Response: GameRoundDTO (201 Created)
```

#### Get Current Round
```http
GET /api/game/{sessionId}/rounds/current

Response: GameRoundDTO (200 OK)
```

#### Get All Rounds
```http
GET /api/game/{sessionId}/rounds

Response: List<GameRoundDTO> (200 OK)
```

#### End Round
```http
POST /api/game/rounds/{roundId}/end

Response: GameRoundDTO (200 OK)
```

### Buzzer

#### Press Buzzer
```http
POST /api/game/rounds/{roundId}/buzz
Content-Type: application/json

{
  "participantId": 123
}

Response: BuzzerPressDTO (201 Created)
```

#### Get Buzzer Presses for Round
```http
GET /api/game/rounds/{roundId}/buzzer-presses

Response: List<BuzzerPressDTO> (200 OK)
```

#### Get Next in Buzzer Queue
```http
GET /api/game/rounds/{roundId}/next-in-line

Response: BuzzerPressDTO (200 OK) or 204 No Content
```

#### Mark Buzzer Press as "Got Chance"
```http
POST /api/game/buzzer-presses/{buzzerPressId}/got-chance

Response: BuzzerPressDTO (200 OK)
```

#### Record Answer
```http
POST /api/game/buzzer-presses/{buzzerPressId}/answer
Content-Type: application/json

{
  "answerText": "Al-Fatiha",
  "isCorrect": true
}

Response: BuzzerPressDTO (200 OK)
```

### Ayat

#### Get Random Ayat
```http
GET /api/ayat/random?surahStart=1&surahEnd=114&reciterId=1

Response: AyatDTO (200 OK)
```

#### Get Random Ayat by Juz
```http
GET /api/ayat/random/juz?juzNumber=30&reciterId=1

Response: AyatDTO (200 OK)
```

#### Get Ayat by ID
```http
GET /api/ayat/{ayatId}?reciterId=1

Response: AyatDTO (200 OK)
```

#### Get Next Ayat
```http
GET /api/ayat/{ayatId}/next?reciterId=1

Response: AyatDTO (200 OK)
```

#### Get Previous Ayat
```http
GET /api/ayat/{ayatId}/previous?reciterId=1

Response: AyatDTO (200 OK)
```

#### Get All Ayat for Surah
```http
GET /api/ayat/surah/{surahNumber}?reciterId=1

Response: List<AyatDTO> (200 OK)
```

#### Get Specific Ayat
```http
GET /api/ayat/surah/{surahNumber}/ayat/{ayatNumber}?reciterId=1

Response: AyatDTO (200 OK)
```

### Reciters

#### Get All Reciters
```http
GET /api/reciters

Response: List<Reciter> (200 OK)
```

#### Get Reciter by ID
```http
GET /api/reciters/{reciterId}

Response: Reciter (200 OK)
```

#### Get Reciter by EveryAyah Code
```http
GET /api/reciters/code/{everyayahCode}

Response: Reciter (200 OK)
```

#### Get Reciters by Country
```http
GET /api/reciters/country/{country}

Response: List<Reciter> (200 OK)
```

### Utility

#### Get Question Points
```http
GET /api/game/question-points/{questionType}

Response:
{
  "points": 20
}
```

---

## WebSocket Events

WebSocket URL: `ws://localhost:8080/ws`

### Connection

```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8080/ws');
const stompClient = new Client({
  webSocketFactory: () => socket,
  onConnect: () => {
    console.log('Connected to WebSocket');
  }
});

stompClient.activate();
```

### Subscribe to Topics

#### Game Buzzer Events
```javascript
stompClient.subscribe('/topic/game/{sessionId}/buzzer', (message) => {
  const data = JSON.parse(message.body);
  // Handle buzzer press event
});
```

#### Buzzer Queue Updates
```javascript
stompClient.subscribe('/topic/game/{sessionId}/buzzer-queue', (message) => {
  const data = JSON.parse(message.body);
  // Handle buzzer queue update
});
```

#### Round Events
```javascript
stompClient.subscribe('/topic/game/{sessionId}/round', (message) => {
  const data = JSON.parse(message.body);
  // data.type can be: "ROUND_START" or "ROUND_END"
});
```

#### Scoreboard Updates
```javascript
stompClient.subscribe('/topic/game/{sessionId}/scoreboard', (message) => {
  const data = JSON.parse(message.body);
  // Handle scoreboard update
});
```

#### Timer Sync
```javascript
stompClient.subscribe('/topic/game/{sessionId}/timer', (message) => {
  const data = JSON.parse(message.body);
  // Sync timer across all clients
});
```

#### Answer Events
```javascript
stompClient.subscribe('/topic/game/{sessionId}/answer', (message) => {
  const data = JSON.parse(message.body);
  // Handle answer result
});
```

#### Game Status Changes
```javascript
stompClient.subscribe('/topic/game/{sessionId}/status', (message) => {
  const data = JSON.parse(message.body);
  // Handle game status change
});
```

#### Errors
```javascript
stompClient.subscribe('/topic/game/{sessionId}/errors', (message) => {
  const data = JSON.parse(message.body);
  // Handle error messages
});
```

### Send Messages

#### Press Buzzer
```javascript
stompClient.publish({
  destination: '/app/game/{sessionId}/buzz',
  body: JSON.stringify({
    roundId: 1,
    participantId: 123
  })
});
```

#### Start Round
```javascript
stompClient.publish({
  destination: '/app/game/{sessionId}/start-round',
  body: JSON.stringify({
    questionType: 'guess_surah',
    reciterId: 1
  })
});
```

#### End Round
```javascript
stompClient.publish({
  destination: '/app/game/{sessionId}/end-round',
  body: JSON.stringify({
    roundId: 1
  })
});
```

#### Update Score
```javascript
stompClient.publish({
  destination: '/app/game/{sessionId}/score',
  body: JSON.stringify({
    participantId: 123,
    points: 20
  })
});
```

#### Give Chance to Participant
```javascript
stompClient.publish({
  destination: '/app/game/{sessionId}/give-chance',
  body: JSON.stringify({
    buzzerPressId: 456
  })
});
```

#### Record Answer
```javascript
stompClient.publish({
  destination: '/app/game/{sessionId}/answer',
  body: JSON.stringify({
    buzzerPressId: 456,
    answerText: 'Al-Fatiha',
    isCorrect: true,
    questionType: 'guess_surah'
  })
});
```

#### Sync Timer
```javascript
stompClient.publish({
  destination: '/app/game/{sessionId}/timer',
  body: JSON.stringify({
    remainingSeconds: 45
  })
});
```

#### Update Game Status
```javascript
stompClient.publish({
  destination: '/app/game/{sessionId}/status',
  body: JSON.stringify({
    status: 'active'
  })
});
```

---

## Data Models (DTOs)

### GameSessionDTO
```typescript
{
  id: UUID,
  adminId: number,
  surahRangeStart: number,
  surahRangeEnd: number,
  juzNumber: number | null,
  difficulty: 'easy' | 'medium' | 'hard',
  timerSeconds: number,
  gameMode: 'team' | 'individual',
  scoreboardLimit: number,
  status: 'setup' | 'active' | 'completed',
  createdAt: string,
  currentRoundNumber: number,
  participants: ParticipantDTO[]
}
```

### ParticipantDTO
```typescript
{
  id: number,
  name: string,
  isTeam: boolean,
  totalScore: number,
  buzzerPressCount: number,
  isBlocked: boolean
}
```

### GameRoundDTO
```typescript
{
  id: number,
  roundNumber: number,
  surahNumber: number,
  ayatNumber: number,
  arabicText: string,
  translation: string,
  audioUrl: string,
  currentQuestionType: string,
  startedAt: string,
  endedAt: string | null
}
```

### BuzzerPressDTO
```typescript
{
  id: number,
  roundId: number,
  participantId: number,
  participantName: string,
  pressedAt: string,
  pressOrder: number,
  gotChance: boolean,
  answerText: string | null,
  isCorrect: boolean | null
}
```

### AyatDTO
```typescript
{
  id: number,
  surahNumber: number,
  surahNameArabic: string,
  surahNameEnglish: string,
  ayatNumber: number,
  arabicText: string,
  translationEn: string,
  juzNumber: number,
  audioUrl: string
}
```

---

## Question Types & Points

| Question Type | Points | Description |
|---------------|--------|-------------|
| `guess_surah` | 10 | Identify which Surah the ayat is from |
| `guess_meaning` | 15 | Translate or explain the ayat |
| `guess_next_ayat` | 20 | Recite the next ayat in sequence |
| `guess_previous_ayat` | 25 | Recite the previous ayat in sequence |
| `guess_reciter` | 15 | Identify the reciter from audio |

---

## Difficulty Levels

| Difficulty | Timer | Description |
|------------|-------|-------------|
| `easy` | 90s | Beginner level |
| `medium` | 60s | Intermediate level |
| `hard` | 30s | Advanced level |

---

## Game Statuses

- `setup` - Game is being configured (can add participants)
- `active` - Game is in progress (rounds can be played)
- `completed` - Game has ended

---

## Audio URLs

Audio files are served from EveryAyah.com with the format:

```
https://everyayah.com/data/{reciterCode}/{SSSAAA}.mp3
```

Where:
- `{reciterCode}` = Reciter's EveryAyah code (e.g., `Alafasy_64kbps`)
- `{SSS}` = 3-digit Surah number (e.g., `001` for Al-Fatiha)
- `{AAA}` = 3-digit Ayat number (e.g., `001` for first ayat)

**Example**: `https://everyayah.com/data/Alafasy_64kbps/001001.mp3`

---

## Anti-Spam Protection

- Each participant can press the buzzer **maximum 3 times per round**
- After 3 presses, the participant is **automatically blocked**
- Admin can manually unblock participants
- Buzzer state resets at the start of each new round

---

## Error Responses

All endpoints follow standard HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no data to return
- `400 Bad Request` - Invalid request data
- `403 Forbidden` - Action not allowed (e.g., buzzer limit exceeded)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "type": "ERROR_TYPE",
  "message": "Human-readable error message",
  "timestamp": 1234567890
}
```

---

## Example Game Flow

1. **Admin creates game**
   ```
   POST /api/game/create
   ```

2. **Admin starts game**
   ```
   POST /api/game/{sessionId}/start
   WebSocket: /topic/game/{sessionId}/status
   ```

3. **Admin starts first round**
   ```
   WebSocket: /app/game/{sessionId}/start-round
   Broadcast: /topic/game/{sessionId}/round (ROUND_START)
   ```

4. **Participants press buzzer**
   ```
   WebSocket: /app/game/{sessionId}/buzz
   Broadcast: /topic/game/{sessionId}/buzzer (BUZZER_PRESS)
   Broadcast: /topic/game/{sessionId}/buzzer-queue
   ```

5. **Admin gives chance to first participant**
   ```
   WebSocket: /app/game/{sessionId}/give-chance
   Broadcast: /topic/game/{sessionId}/buzzer (GOT_CHANCE)
   ```

6. **Admin records answer**
   ```
   WebSocket: /app/game/{sessionId}/answer
   Broadcast: /topic/game/{sessionId}/answer (ANSWER_RECORDED)
   Broadcast: /topic/game/{sessionId}/scoreboard (if correct)
   ```

7. **Admin ends round**
   ```
   WebSocket: /app/game/{sessionId}/end-round
   Broadcast: /topic/game/{sessionId}/round (ROUND_END)
   ```

8. Repeat steps 3-7 for more rounds

9. **Admin ends game**
   ```
   POST /api/game/{sessionId}/end
   ```

---

## Testing Endpoints

Use tools like:
- **Postman** - For REST API testing
- **Postman** - Also supports WebSocket testing
- **Browser Console** - For WebSocket testing with JavaScript
- **curl** - For quick REST API tests

Example curl command:
```bash
curl -X POST http://localhost:8080/api/game/create \
  -H "Content-Type: application/json" \
  -d '{
    "difficulty": "medium",
    "gameMode": "individual",
    "surahRangeStart": 1,
    "surahRangeEnd": 114,
    "participantNames": ["Alice", "Bob"]
  }'
```

---

For more information, see:
- [README.md](./README.md) - Project overview
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup instructions
- [PORTS_REFERENCE.md](./PORTS_REFERENCE.md) - Port configuration
