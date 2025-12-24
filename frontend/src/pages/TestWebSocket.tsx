import { useState, useEffect } from 'react'
import { wsService } from '../services/websocket.service'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Wifi, WifiOff } from 'lucide-react'

export default function TestWebSocket() {
  const [connected, _setConnected] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [error, _setError] = useState<string | null>(null)

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect(
      // () => {
      //   setConnected(true)
      //   setError(null)

      //   // Subscribe to test topic
      //   wsService.subscribe('/topic/test', (msg) => {
      //     const body = JSON.parse(msg.body)
      //     setMessages((prev) => [...prev, { type: 'received', data: body }])
      //   })
      // },
      // (err: any) => {
      //   setConnected(false)
      //   setError('Failed to connect to WebSocket server. Is the backend running?')
      //   console.error(err)
      // }
    )

    return () => {
      wsService.disconnect()
    }
  }, [])

  const sendMessage = () => {
    if (!message.trim()) return

    const payload = { text: message }
    wsService.send('/app/test', payload)

    setMessages((prev) => [...prev, { type: 'sent', data: payload }])
    setMessage('')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold">WebSocket Test</h1>
        </div>

        {/* Connection Status */}
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          connected ? 'bg-green-900/30 border border-green-600' : 'bg-red-900/30 border border-red-600'
        }`}>
          {connected ? (
            <>
              <Wifi className="w-6 h-6 text-green-400" />
              <span className="text-green-400">Connected to WebSocket</span>
            </>
          ) : (
            <>
              <WifiOff className="w-6 h-6 text-red-400" />
              <span className="text-red-400">
                {error || 'Disconnected'}
              </span>
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            disabled={!connected}
            className="flex-1 px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !message.trim()}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>

        {/* Messages */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-3 max-h-96 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages yet. Send a message to test!</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  msg.type === 'sent' ? 'bg-blue-900/30 ml-12' : 'bg-green-900/30 mr-12'
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">
                  {msg.type === 'sent' ? 'Sent' : 'Received'}
                </div>
                <pre className="text-sm">
                  {JSON.stringify(msg.data, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">How it works</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Make sure the Spring Boot backend is running on port 8080</li>
            <li>This page connects to <code className="bg-gray-900 px-2 py-1 rounded">/ws</code> endpoint</li>
            <li>Messages sent to <code className="bg-gray-900 px-2 py-1 rounded">/app/test</code> are echoed back to <code className="bg-gray-900 px-2 py-1 rounded">/topic/test</code></li>
            <li>You should see your message echoed back with a timestamp</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
