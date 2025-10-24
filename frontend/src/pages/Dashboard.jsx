import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chat'
import Layout from '../components/Layout'
import { formatDistanceToNow } from 'date-fns'

function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    // Load sessions manually on first render if user exists
    if (user && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadSessions()
    }
  }, [user])

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError('')
      // Load all active sessions (non-archived)
      const data = await chatService.getSessions(true)
      setSessions(data || []) // Ensure we always have an array
    } catch (err) {
      // Don't show error if it's just empty - user might not have sessions yet
      if (err.response?.status !== 401) {
        console.error('Failed to load sessions:', err)
      }
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  const startNewChat = () => {
    navigate('/chat')
  }

  const getSubjectColor = (subject) => {
    const colors = {
      mathematics: 'bg-blue-100 text-blue-800',
      physics: 'bg-purple-100 text-purple-800',
      chemistry: 'bg-green-100 text-green-800',
      biology: 'bg-emerald-100 text-emerald-800',
      computer_science: 'bg-indigo-100 text-indigo-800',
      history: 'bg-amber-100 text-amber-800',
      literature: 'bg-pink-100 text-pink-800',
      language: 'bg-cyan-100 text-cyan-800',
      economics: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[subject] || colors.other
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            Ready to continue your learning journey? Start a new session or review your past conversations.
          </p>
        </div>

        <div className="mb-8">
          <button
            onClick={startNewChat}
            className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <span className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start New Study Session
            </span>
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Study Sessions</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your sessions...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No study sessions yet</h3>
              <p className="mt-2 text-gray-600">Start your first session to begin learning with AI!</p>
              <button onClick={startNewChat} className="mt-6 btn btn-primary">
                Create First Session
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/chat/${session.id}`}
                  className="card hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-primary-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {session.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSubjectColor(session.subject)}`}>
                      {session.subject.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {session.message_count} messages
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(session.updated_at || session.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard

