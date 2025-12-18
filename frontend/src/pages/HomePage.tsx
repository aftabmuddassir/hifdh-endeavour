import { Link } from 'react-router-dom'
import { Gamepad2, BookOpen, Trophy } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Hifdh Quest
          </h1>
          <p className="text-2xl text-gray-300">
            Gamified Quran Memorization Platform
          </p>
          <p className="text-lg text-gray-400">
            Learn, Compete, and Master the Holy Quran
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-800 rounded-lg p-6 text-center space-y-4">
            <BookOpen className="w-12 h-12 mx-auto text-green-400" />
            <h3 className="text-xl font-semibold">Learn Verses</h3>
            <p className="text-gray-400">
              Listen to beautiful recitations and learn verses from any Surah range
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 text-center space-y-4">
            <Gamepad2 className="w-12 h-12 mx-auto text-blue-400" />
            <h3 className="text-xl font-semibold">Play Games</h3>
            <p className="text-gray-400">
              5 different question types with buzzer system for real-time competition
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 text-center space-y-4">
            <Trophy className="w-12 h-12 mx-auto text-yellow-400" />
            <h3 className="text-xl font-semibold">Compete</h3>
            <p className="text-gray-400">
              Team or individual modes with live scoreboards
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link
            to="/admin/new"
            className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-lg font-semibold transition"
          >
            Create New Game
          </Link>
          <Link
            to="/test"
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg font-semibold transition"
          >
            Test WebSocket
          </Link>
        </div>

        {/* Status */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Backend: Spring Boot 3.2 | Frontend: React 18 + TypeScript</p>
          <p className="mt-2">Real-time: WebSocket (STOMP) | Database: PostgreSQL</p>
        </div>
      </div>
    </div>
  )
}
