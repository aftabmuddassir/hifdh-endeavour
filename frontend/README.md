# Hifdh Quest Frontend

React + TypeScript frontend for the Hifdh Quest gamified Quran memorization platform.

## Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **WebSocket**: SockJS + STOMP
- **Routing**: React Router v6
- **State**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Buzzer.tsx
│   │   ├── Scoreboard.tsx
│   │   ├── Timer.tsx
│   │   └── AudioPlayer.tsx
│   ├── pages/               # Route pages
│   │   ├── HomePage.tsx
│   │   ├── GamePage.tsx
│   │   ├── AdminPage.tsx
│   │   └── TestWebSocket.tsx
│   ├── services/            # API services
│   │   ├── websocket.service.ts
│   │   └── api.service.ts
│   ├── stores/              # Zustand stores
│   │   └── gameStore.ts
│   ├── types/               # TypeScript types
│   │   └── game.types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Setup

### 1. Prerequisites

- Node.js 18+ (download from [nodejs.org](https://nodejs.org/))
- npm or yarn

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env.local`:

```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
```

### 4. Run Development Server

```bash
npm run dev
```

Application runs on http://localhost:5173

## Available Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Pages

### Home Page (`/`)
Landing page with:
- Platform overview
- Feature highlights
- "Create New Game" button
- "Test WebSocket" link

### Test WebSocket (`/test`)
WebSocket connection tester:
- Connection status indicator
- Send/receive test messages
- Verify backend communication

### Admin Page (`/admin/:sessionId`)
Game setup and control:
- Configure game settings
- Select Surah range
- Choose question types
- Manage participants
- Validate answers during gameplay

### Game Page (`/game/:sessionId`)
Main gameplay interface:
- Display Arabic text and audio
- Buzzer button
- Live scoreboard
- Timer countdown
- Question type indicator

## WebSocket Integration

### Connection

```typescript
import { wsService } from './services/websocket.service'

// Connect
wsService.connect(
  () => console.log('Connected!'),
  (err) => console.error('Error:', err)
)

// Disconnect
wsService.disconnect()
```

### Subscribe to Topics

```typescript
// Subscribe to game events
wsService.subscribe('/topic/game/123/round-start', (message) => {
  const data = JSON.parse(message.body)
  console.log('Round started:', data)
})
```

### Send Messages

```typescript
// Send buzzer press
wsService.send('/app/game/123/buzz', {
  participantId: 1
})
```

## Components

### Buzzer Component

```typescript
interface BuzzerProps {
  sessionId: string
  participantId: number
  disabled: boolean
  onPress: () => void
}
```

### Scoreboard Component

```typescript
interface ScoreboardProps {
  sessionId: string
  limit: number  // Top 5 or Top 10
  participants: Participant[]
}
```

### Audio Player

```typescript
interface AudioPlayerProps {
  audioUrl: string
  autoPlay: boolean
}
```

## Styling

### Tailwind CSS

Custom colors defined in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#22c55e',
        600: '#16a34a',
      }
    }
  }
}
```

### Arabic Text Styling

```css
.arabic-text {
  font-family: 'Amiri', 'Traditional Arabic', serif;
  font-size: 1.5rem;
  direction: rtl;
  text-align: center;
}
```

Load Arabic font in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
```

## API Integration

### REST API

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Create game
const createGame = async (config: GameConfig) => {
  const response = await api.post('/api/games/create', config)
  return response.data
}
```

## State Management

### Zustand Store

```typescript
interface GameState {
  sessionId: string | null
  currentRound: number
  participants: Participant[]
  setSessionId: (id: string) => void
}

export const useGameStore = create<GameState>((set) => ({
  sessionId: null,
  currentRound: 0,
  participants: [],
  setSessionId: (id) => set({ sessionId: id })
}))
```

## Building for Production

### Build

```bash
npm run build
```

Output in `dist/` directory.

### Preview

```bash
npm run preview
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect GitHub repo to Vercel dashboard.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |
| `VITE_WS_URL` | WebSocket URL | `http://localhost:8080/ws` |

## Common Issues

### WebSocket Connection Failed

1. Check backend is running on port 8080
2. Verify CORS is configured correctly
3. Check browser console for errors

### Vite Port Already in Use

```bash
# Change port in vite.config.ts
server: {
  port: 3000  // Changed from 5173
}
```

### TypeScript Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Performance Optimization

1. **Code Splitting**:
```typescript
const AdminPage = lazy(() => import('./pages/AdminPage'))
```

2. **Memoization**:
```typescript
const MemoizedScoreboard = memo(Scoreboard)
```

3. **Debounce WebSocket Messages**:
```typescript
const debouncedSend = debounce(wsService.send, 300)
```

## License

MIT License - see LICENSE file
