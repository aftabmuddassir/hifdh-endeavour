import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import AdminPage from './pages/AdminPage'
import TestWebSocket from './pages/TestWebSocket'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:sessionId" element={<GamePage />} />
          <Route path="/admin/:sessionId" element={<AdminPage />} />
          <Route path="/test" element={<TestWebSocket />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
