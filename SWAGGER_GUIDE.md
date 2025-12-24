# Swagger API Documentation Guide

Complete guide to using the interactive Swagger UI for testing and exploring the Hifdh Quest API.

---

## 🚀 Quick Start

Once your backend is running, access Swagger UI at:

**Swagger UI**: http://localhost:8080/swagger-ui.html
**OpenAPI JSON**: http://localhost:8080/api-docs

---

## 📋 What is Swagger?

Swagger provides an **interactive API explorer** where you can:
- ✅ View all available API endpoints
- ✅ See request/response schemas
- ✅ Test API calls directly from the browser
- ✅ View example requests and responses
- ✅ Understand endpoint parameters and requirements

---

## 🎯 Using Swagger UI

### Step 1: Navigate to Swagger UI

1. Start your backend server:
   ```bash
   cd backend
   mvnw.cmd spring-boot:run
   ```

2. Open your browser and go to:
   ```
   http://localhost:8080/swagger-ui.html
   ```

### Step 2: Explore API Endpoints

The Swagger UI organizes endpoints into **3 main categories**:

#### 1. **Game Management**
   - Create game sessions
   - Start/end games
   - Manage rounds
   - Handle buzzer presses
   - Update scores

#### 2. **Quran Ayat**
   - Get random verses
   - Navigate between ayat
   - Retrieve audio URLs

#### 3. **Quran Reciters**
   - List all reciters
   - Get reciter details

### Step 3: Test an Endpoint

Let's test creating a game session:

1. **Expand** the "Game Management" section
2. **Click** on `POST /api/game/create`
3. **Click** "Try it out"
4. **Edit** the request body (example below)
5. **Click** "Execute"
6. **View** the response in the "Responses" section

#### Example Request Body:

```json
{
  "difficulty": "medium",
  "gameMode": "individual",
  "surahRangeStart": 1,
  "surahRangeEnd": 114,
  "participantNames": [
    "Alice",
    "Bob",
    "Charlie"
  ]
}
```

#### Expected Response (201 Created):

```json
{
  "id": "f72c7fe4-c9df-48a5-a4c2-c5a3a5e0207c",
  "difficulty": "medium",
  "gameMode": "individual",
  "surahRangeStart": 1,
  "surahRangeEnd": 114,
  "timerSeconds": 60,
  "status": "setup",
  "participants": [
    {
      "id": 1,
      "name": "Alice",
      "totalScore": 0,
      "isBlocked": false
    },
    {
      "id": 2,
      "name": "Bob",
      "totalScore": 0,
      "isBlocked": false
    },
    {
      "id": 3,
      "name": "Charlie",
      "totalScore": 0,
      "isBlocked": false
    }
  ]
}
```

---

## 🎮 Complete Game Flow with Swagger

Follow this workflow to test a complete game:

### 1. Create a Game Session

**Endpoint**: `POST /api/game/create`

**Request**:
```json
{
  "difficulty": "medium",
  "gameMode": "individual",
  "surahRangeStart": 87,
  "surahRangeEnd": 114,
  "participantNames": ["Player1", "Player2"]
}
```

**Copy the `id` from the response** (e.g., `f72c7fe4-c9df-48a5-a4c2-c5a3a5e0207c`)

---

### 2. Start the Game

**Endpoint**: `POST /api/game/{sessionId}/start`

**Parameters**:
- `sessionId`: Paste the ID from step 1

**Response**: Game status changes to `"active"`

---

### 3. Create a Round

**Endpoint**: `POST /api/game/{sessionId}/rounds`

**Request**:
```json
{
  "questionType": "guess_surah",
  "reciterId": 1
}
```

**Response**: Contains the ayat details, audio URL, and round info

**Copy the `roundId` from the response**

---

### 4. Press Buzzer

**Endpoint**: `POST /api/game/rounds/{roundId}/buzz`

**Request**:
```json
{
  "participantId": 1
}
```

**Response**: Buzzer press recorded with order

---

### 5. Get Next in Line

**Endpoint**: `GET /api/game/rounds/{roundId}/next-in-line`

**Response**: Returns the participant who buzzed first and hasn't gotten a chance

---

### 6. Record Answer

**Endpoint**: `POST /api/game/buzzer-presses/{buzzerPressId}/answer`

**Request**:
```json
{
  "answerText": "Al-Fajr",
  "isCorrect": true
}
```

**Response**: Answer recorded

---

### 7. Check Scoreboard

**Endpoint**: `GET /api/game/{sessionId}/scoreboard`

**Response**: List of participants sorted by score

---

### 8. End the Round

**Endpoint**: `POST /api/game/rounds/{roundId}/end`

**Response**: Round ended with timestamp

---

### 9. End the Game

**Endpoint**: `POST /api/game/{sessionId}/end`

**Response**: Game status changes to `"completed"`

---

## 📖 Understanding Schemas

Swagger shows the **data structure** for each endpoint:

### Common DTOs:

#### GameSessionDTO
- `id`: UUID of the session
- `status`: "setup", "active", or "completed"
- `difficulty`: "easy", "medium", or "hard"
- `gameMode`: "individual" or "team"
- `participants`: Array of participant objects

#### ParticipantDTO
- `id`: Participant ID
- `name`: Participant name
- `totalScore`: Current score
- `buzzerPressCount`: Total buzzer presses
- `isBlocked`: Whether participant is blocked from buzzing

#### GameRoundDTO
- `id`: Round ID
- `roundNumber`: Sequential round number
- `surahNumber`: Surah number of the ayat
- `ayatNumber`: Ayat number
- `arabicText`: Arabic text of the ayat
- `audioUrl`: EveryAyah audio URL
- `currentQuestionType`: Question type for this round

#### BuzzerPressDTO
- `id`: Buzzer press ID
- `participantId`: Who pressed
- `pressOrder`: Order of press (1st, 2nd, 3rd)
- `gotChance`: Whether participant got a chance to answer
- `isCorrect`: Whether answer was correct

---

## 🔍 Advanced Features

### Filtering Responses

Some endpoints support query parameters:

#### Get Random Ayat with Filters
```
GET /api/ayat/random?surahStart=1&surahEnd=114&reciterId=1
```

#### Get Ayat by Juz
```
GET /api/ayat/random/juz?juzNumber=30&reciterId=1
```

---

## 🛠️ Tips for Testing

### 1. **Use the Schemas Tab**
   - Click "Schemas" at the bottom of Swagger UI
   - View all data models used in the API

### 2. **Copy Request Bodies**
   - Click "Example Value" to auto-fill request body
   - Modify as needed for your test

### 3. **Check Response Codes**
   - `200 OK` - Request successful
   - `201 Created` - Resource created
   - `400 Bad Request` - Invalid request data
   - `404 Not Found` - Resource not found
   - `500 Internal Server Error` - Server error

### 4. **Test Error Scenarios**
   - Try invalid question types
   - Exceed buzzer press limit (3 presses)
   - Access non-existent resources

### 5. **Use Curl Commands**
   - Swagger generates curl commands for each request
   - Click "Copy" next to the curl command to use in terminal

---

## 📝 Customizing Swagger

The Swagger configuration is in:
- [OpenApiConfig.java](backend/src/main/java/com/hifdh/quest/config/OpenApiConfig.java)
- [application.yml](backend/src/main/resources/application.yml) (springdoc section)

### Customize Info:
```java
Info info = new Info()
    .title("Your Custom Title")
    .version("2.0.0")
    .description("Your custom description");
```

### Add Production Server:
```java
Server prodServer = new Server();
prodServer.setUrl("https://api.hifdhquest.com");
prodServer.setDescription("Production Server");
```

---

## 🚨 Common Issues

### Swagger UI Not Loading

**Problem**: http://localhost:8080/swagger-ui.html shows 404

**Solutions**:
1. Ensure backend is running: `mvnw.cmd spring-boot:run`
2. Check port is correct (default: 8080)
3. Verify SpringDoc dependency in pom.xml
4. Check application.yml has `springdoc.swagger-ui.enabled: true`

---

### CORS Errors in Browser

**Problem**: Requests fail with CORS errors

**Solution**: CORS is already configured in SecurityConfig to allow all origins for MVP. If you're in production, update CORS settings.

---

### 401 Unauthorized

**Problem**: Endpoints return 401

**Solution**: Authentication is disabled for MVP (`permitAll()` in SecurityConfig). If you've enabled JWT, add authorization header.

---

## 🔗 Related Documentation

- [API_REFERENCE.md](./API_REFERENCE.md) - Complete REST API documentation
- [README.md](./README.md) - Project overview
- [START_HERE.md](./START_HERE.md) - Quick start guide

---

## 💡 Best Practices

1. **Test in Order**: Follow the game flow sequence (create → start → rounds → buzz → answer)
2. **Copy IDs**: Always copy generated IDs (sessionId, roundId, etc.) for subsequent requests
3. **Check Responses**: Verify response status codes and data
4. **Use Examples**: Start with provided examples and modify gradually
5. **Read Descriptions**: Each endpoint has a description explaining its purpose

---

## 🎓 Learning Resources

- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [SpringDoc OpenAPI Documentation](https://springdoc.org/)
- [OpenAPI Specification](https://swagger.io/specification/)

---

**Happy Testing! 🎮**

For support, refer to [API_REFERENCE.md](./API_REFERENCE.md) or check the logs in your backend console.
