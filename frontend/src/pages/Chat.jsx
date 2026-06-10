import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chat'
import { documentsService } from '../services/documents'
import Layout from '../components/Layout'
import ReactMarkdown from 'react-markdown'
import { CitationList, decorateCitationMarkers } from '../components/Citations'

const SUBJECT_CHIP = {
  mathematics: 'bg-blue-50 text-blue-700 border-blue-100',
  physics: 'bg-purple-50 text-purple-700 border-purple-100',
  chemistry: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  biology: 'bg-green-50 text-green-700 border-green-100',
  computer_science: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  history: 'bg-amber-50 text-amber-700 border-amber-100',
  literature: 'bg-pink-50 text-pink-700 border-pink-100',
  language: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  economics: 'bg-orange-50 text-orange-700 border-orange-100',
  other: 'bg-ink-50 text-ink-700 border-ink-200',
}

const SUGGESTIONS = [
  { emoji: '💡', prompt: 'Explain photosynthesis in simple terms' },
  { emoji: '📐', prompt: 'Help me understand quadratic equations' },
  { emoji: '📚', prompt: 'What are the causes of World War I?' },
  { emoji: '💻', prompt: 'Walk me through recursion with an example' },
  { emoji: '🧪', prompt: 'What is the difference between acids and bases?' },
  { emoji: '🗣️', prompt: 'Quiz me on Spanish verb conjugation' },
]

function Chat() {
  const { sessionId } = useParams()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState(null)
  const [groundingDoc, setGroundingDoc] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionId && user) {
      loadSession()
      loadMessages()
    } else {
      setSession(null)
      setMessages([])
    }
  }, [sessionId, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px'
  }, [inputMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSession = async () => {
    try {
      const data = await chatService.getSession(sessionId)
      setSession(data)
      if (data?.document_id) {
        try {
          const doc = await documentsService.get(data.document_id)
          setGroundingDoc(doc)
        } catch {
          setGroundingDoc(null)
        }
      } else {
        setGroundingDoc(null)
      }
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

  const sendMessage = async (content) => {
    if (!content.trim() || loading) return

    const userMessage = content.trim()
    setInputMessage('')
    setError('')
    setLoading(true)

    const tempUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      const response = await chatService.sendMessage({
        content: userMessage,
        session_id: sessionId ? parseInt(sessionId) : null,
      })

      if (!sessionId) {
        navigate(`/chat/${response.session_id}`, { replace: true })
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMessage.id)
        return [...filtered, response.user_message, response.assistant_message]
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.')
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id))
      setInputMessage(userMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const subjectKey = session?.subject || 'other'
  const initials = (user?.full_name || user?.username || '?')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-ink-100 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-shrink-0 w-9 h-9 rounded-xl hover:bg-ink-100 flex items-center justify-center text-ink-500 hover:text-primary-700 transition-colors"
                aria-label="Back to dashboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-display font-semibold text-ink-900 truncate">
                  {session?.title || 'New study session'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {session?.subject ? (
                    <span className={`chip border ${SUBJECT_CHIP[subjectKey] || SUBJECT_CHIP.other}`}>
                      {session.subject.replace('_', ' ')}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-500">Ask anything to start</span>
                  )}
                  {groundingDoc && (
                    <span
                      className="chip border bg-primary-50 text-primary-700 border-primary-200"
                      title={`Answers will cite "${groundingDoc.title}"`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h8l6 6v10a2 2 0 01-2 2z" />
                      </svg>
                      Grounded on {groundingDoc.title.length > 30 ? groundingDoc.title.slice(0, 28) + '…' : groundingDoc.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-ink-50/50 to-white px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-5">
            {messages.length === 0 && !loading && (
              <div className="text-center py-10 animate-fade-in-up">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-ink-900">
                  Let's start learning
                </h3>
                <p className="mt-2 text-ink-600">
                  Ask anything — or pick a prompt below to get going.
                </p>
                <button
                  onClick={() => navigate('/documents')}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-800 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Upload your notes to get cited answers
                </button>
                <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.prompt}
                      onClick={() => sendMessage(s.prompt)}
                      className="group text-left rounded-2xl bg-white border border-ink-100 px-4 py-3 hover:border-primary-300 hover:shadow-soft transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{s.emoji}</span>
                        <span className="text-sm text-ink-700 group-hover:text-primary-700">{s.prompt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.role === 'user'
              const citationCount = message.citations?.length || 0
              const decorate = (children) =>
                Array.isArray(children)
                  ? children.flatMap((c, i) =>
                      typeof c === 'string'
                        ? [<span key={`t-${i}`}>{decorateCitationMarkers(c, citationCount)}</span>]
                        : [c],
                    )
                  : typeof children === 'string'
                    ? decorateCitationMarkers(children, citationCount)
                    : children
              const mdComponents = citationCount
                ? {
                    p: ({ children }) => <p>{decorate(children)}</p>,
                    li: ({ children }) => <li>{decorate(children)}</li>,
                  }
                : undefined
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex gap-3 max-w-3xl ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                        isUser
                          ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white'
                          : 'bg-gradient-to-br from-primary-500 to-accent-500 text-white'
                      }`}
                    >
                      {isUser ? initials : 'AI'}
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isUser
                          ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white rounded-tr-md shadow-md'
                          : 'bg-white border border-ink-100 shadow-soft rounded-tl-md'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      ) : (
                        <div className="markdown-content">
                          <ReactMarkdown components={mdComponents}>
                            {message.content}
                          </ReactMarkdown>
                          <CitationList citations={message.citations} />
                        </div>
                      )}

                      {!isUser && message.response_time && (
                        <div className="mt-2 pt-2 border-t border-ink-100 text-xs text-ink-400 flex items-center gap-3">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {(message.response_time / 1000).toFixed(1)}s
                          </span>
                          {message.tokens_used && (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              {message.tokens_used} tokens
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-3 max-w-3xl">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-sm font-bold">
                    AI
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3.5 border border-ink-100 shadow-soft">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="bg-white/80 backdrop-blur-md border-t border-ink-100 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-end gap-2 rounded-2xl border border-ink-200 bg-white px-3 py-2.5 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-200 transition-all shadow-soft">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask anything about your studies…"
                  className="flex-1 resize-none bg-transparent text-ink-900 placeholder:text-ink-400 outline-none py-1.5 max-h-44"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 text-white flex items-center justify-center shadow-glow hover:shadow-glow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Send"
                >
                  {loading ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-2 text-center text-xs text-ink-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-ink-100 border border-ink-200 text-ink-600 font-mono text-[10px]">Enter</kbd> to send ·{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-ink-100 border border-ink-200 text-ink-600 font-mono text-[10px]">Shift + Enter</kbd> for new line
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Chat
