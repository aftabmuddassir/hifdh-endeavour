import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GameSetup from './pages/GameSetup'
import GameScreen from './pages/GameScreen'
import JoinGame from './pages/JoinGame'
import AdminPage from './pages/AdminPage'
import TestWebSocket from './pages/TestWebSocket'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup" element={<GameSetup />} />
        <Route path="/join/:sessionId" element={<JoinGame />} />
        <Route path="/game/:sessionId" element={<GameScreen />} />
        <Route path="/admin/:sessionId" element={<AdminPage />} />
        <Route path="/test" element={<TestWebSocket />} />
      </Routes>
    </Router>
  )
}

export default App
