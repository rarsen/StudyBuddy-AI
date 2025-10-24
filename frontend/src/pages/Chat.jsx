import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chat'
import Layout from '../components/Layout'
import ReactMarkdown from 'react-markdown'

function Chat() {
  const { sessionId } = useParams()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)
  const messagesEndRef = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionId && user) {
      loadSession()
      loadMessages()
    }
  }, [sessionId, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSession = async () => {
    try {
      const data = await chatService.getSession(sessionId)
      setSession(data)
    } catch (err) {
      console.error('Failed to load session:', err)
    }
  }

  const loadMessages = async () => {
    try {
      const data = await chatService.getSessionMessages(sessionId)
      setMessages(data)
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || loading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setError('')
    setLoading(true)

    const tempUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      const response = await chatService.sendMessage({
        content: userMessage,
        session_id: sessionId ? parseInt(sessionId) : null
      })

      if (!sessionId) {
        navigate(`/chat/${response.session_id}`, { replace: true })
      }

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMessage.id)
        return [...filtered, response.user_message, response.assistant_message]
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.')
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
      setInputMessage(userMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="bg-white border-b px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {session?.title || 'New Study Session'}
              </h2>
              {session?.subject && (
                <p className="text-sm text-gray-500 capitalize">
                  {session.subject.replace('_', ' ')}
                </p>
              )}
            </div>
            {sessionId && (
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary text-sm"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && !loading && (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Start a conversation</h3>
                <p className="mt-2 text-gray-600">Ask me anything! I'm here to help you learn and understand.</p>
                <div className="mt-6 grid gap-3">
                  <button
                    onClick={() => setInputMessage("Explain photosynthesis in simple terms")}
                    className="btn btn-secondary text-left"
                  >
                    💡 Explain photosynthesis in simple terms
                  </button>
                  <button
                    onClick={() => setInputMessage("Help me understand quadratic equations")}
                    className="btn btn-secondary text-left"
                  >
                    📐 Help me understand quadratic equations
                  </button>
                  <button
                    onClick={() => setInputMessage("What are the causes of World War I?")}
                    className="btn btn-secondary text-left"
                  >
                    📚 What are the causes of World War I?
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-primary-600' : 'bg-gray-300'
                  }`}>
                    {message.role === 'user' ? (
                      <span className="text-white font-semibold text-sm">
                        {user?.username?.[0].toUpperCase() || 'U'}
                      </span>
                    ) : (
                      <span className="text-gray-700 font-semibold text-sm">AI</span>
                    )}
                  </div>
                  
                  <div className={`rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white shadow-sm border border-gray-200'
                  }`}>
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="markdown-content">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                    
                    {message.role === 'assistant' && message.response_time && (
                      <div className="mt-2 text-xs text-gray-400 flex items-center gap-3">
                        <span> {(message.response_time / 1000).toFixed(1)}s</span>
                        {message.tokens_used && <span> {message.tokens_used} tokens</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-3xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-700 font-semibold text-sm">AI</span>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-white border-t px-4 py-4">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your studies..."
                className="input flex-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="btn btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Chat

